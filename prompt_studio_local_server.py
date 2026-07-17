#!/usr/bin/env python3
"""
Prompt Studio local server + Draw Things API proxy.

Usage:
  python3 prompt_studio_local_server.py

Open:
  http://127.0.0.1:8765/prompt_studio_10_5.html

Proxy:
  /dtapi/* -> http://127.0.0.1:7860/*
"""
from __future__ import annotations

import os
import sys
import json
import mimetypes
import re
import threading
from datetime import datetime, timezone
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HOST = os.environ.get("PROMPT_STUDIO_HOST", "127.0.0.1")
PORT = int(os.environ.get("PROMPT_STUDIO_PORT", "8765"))
DT_TARGET = os.environ.get("DRAW_THINGS_API", "http://127.0.0.1:7860").rstrip("/")
PROXY_PREFIX = "/dtapi"
BACKUP_DIR = Path(os.environ.get(
    "PROMPT_STUDIO_BACKUP_DIR",
    str(Path(__file__).resolve().parent / "prompt_studio_backups"),
)).expanduser().resolve()
BACKUP_LIMIT = max(1, int(os.environ.get("PROMPT_STUDIO_BACKUP_LIMIT", "30")))
BACKUP_MAX_BYTES = 50 * 1024 * 1024
BACKUP_LOCK = threading.Lock()


class PromptStudioHandler(SimpleHTTPRequestHandler):
    server_version = "PromptStudioLocal/1.0"

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/prompt-studio-backups":
            if not self.backup_origin_allowed():
                self.send_error(403, "Backup API is same-origin only")
                return
            edition = urllib.parse.parse_qs(parsed.query).get("edition", ["jp"])[0]
            self.list_backups(edition)
            return
        if parsed.path == "/prompt-studio-backup":
            if not self.backup_origin_allowed():
                self.send_error(403, "Backup API is same-origin only")
                return
            query = urllib.parse.parse_qs(parsed.query)
            self.read_backup(query.get("name", [""])[0], query.get("edition", ["jp"])[0])
            return
        if self.path.startswith(PROXY_PREFIX + "/") or self.path == PROXY_PREFIX:
            self.proxy_request("GET")
            return
        super().do_GET()

    def do_POST(self):
        if urllib.parse.urlparse(self.path).path == "/prompt-studio-backup":
            if not self.backup_origin_allowed():
                self.send_error(403, "Backup API is same-origin only")
                return
            self.write_backup()
            return
        if self.path.startswith(PROXY_PREFIX + "/") or self.path == PROXY_PREFIX:
            self.proxy_request("POST")
            return
        self.send_error(404, "POST is only supported for /dtapi/* and /prompt-studio-backup")

    def backup_origin_allowed(self):
        origin = self.headers.get("Origin")
        if not origin:
            return True
        try:
            return urllib.parse.urlparse(origin).netloc == self.headers.get("Host", "")
        except Exception:
            return False

    def send_json(self, value, status=200):
        data = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def backup_prefix(self, edition):
        return "prompt_studio_en_" if edition == "en" else "prompt_studio_"

    def backup_files(self, edition="jp"):
        if not BACKUP_DIR.exists():
            return []
        prefix = self.backup_prefix(edition)
        files = BACKUP_DIR.glob(prefix + "*.json")
        if edition != "en":
            files = (p for p in files if not p.name.startswith("prompt_studio_en_"))
        return sorted(files, key=lambda p: p.stat().st_mtime, reverse=True)

    def list_backups(self, edition="jp"):
        edition = "en" if edition == "en" else "jp"
        items = []
        for path in self.backup_files(edition):
            stat = path.stat()
            items.append({
                "name": path.name,
                "createdAt": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
                "size": stat.st_size,
            })
        self.send_json({"ok": True, "directory": str(BACKUP_DIR), "items": items})

    def read_backup(self, name, edition="jp"):
        edition = "en" if edition == "en" else "jp"
        prefix = self.backup_prefix(edition)
        if not name or Path(name).name != name or not name.startswith(prefix) or not re.fullmatch(r"prompt_studio_[A-Za-z0-9_.-]+\.json", name):
            self.send_error(400, "Invalid backup name")
            return
        if edition != "en" and name.startswith("prompt_studio_en_"):
            self.send_error(400, "Invalid backup edition")
            return
        path = BACKUP_DIR / name
        if not path.is_file():
            self.send_error(404, "Backup not found")
            return
        data = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def write_backup(self):
        length = int(self.headers.get("Content-Length") or "0")
        if length <= 0 or length > BACKUP_MAX_BYTES:
            self.send_error(413, "Backup body is empty or too large")
            return
        try:
            body = self.rfile.read(length)
            payload = json.loads(body.decode("utf-8"))
            data = payload.get("data") if isinstance(payload, dict) else None
            if not isinstance(data, dict) or not isinstance(data.get("promptGroups"), list):
                raise ValueError("promptGroups is required")
            reason = str(payload.get("reason") or "auto")
            reason = re.sub(r"[^A-Za-z0-9_-]+", "-", reason).strip("-")[:24] or "auto"
            edition = "en" if payload.get("edition") == "en" else "jp"
            with BACKUP_LOCK:
                BACKUP_DIR.mkdir(parents=True, exist_ok=True)
                stamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                name = f"{self.backup_prefix(edition)}{stamp}_{reason}.json"
                path = BACKUP_DIR / name
                temp = BACKUP_DIR / (name + ".tmp")
                temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
                temp.replace(path)
                for old in self.backup_files(edition)[BACKUP_LIMIT:]:
                    old.unlink(missing_ok=True)
            self.send_json({"ok": True, "name": name, "directory": str(BACKUP_DIR)})
        except Exception as exc:
            self.send_json({"ok": False, "error": str(exc)}, status=400)

    def proxy_request(self, method: str):
        suffix = self.path[len(PROXY_PREFIX):] or "/"
        target_url = DT_TARGET + suffix
        length = int(self.headers.get("Content-Length") or "0")
        body = self.rfile.read(length) if length else None
        headers = {}
        content_type = self.headers.get("Content-Type")
        if content_type:
            headers["Content-Type"] = content_type
        req = urllib.request.Request(target_url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=None) as res:
                data = res.read()
                self.send_response(res.status)
                ctype = res.headers.get("Content-Type") or mimetypes.guess_type(target_url)[0] or "application/octet-stream"
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            data = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", e.headers.get("Content-Type") or "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            msg = f"Draw Things proxy error: {e}\nTarget: {target_url}\n".encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    httpd = ThreadingHTTPServer((HOST, PORT), PromptStudioHandler)
    print(f"Prompt Studio: http://{HOST}:{PORT}/prompt_studio_10_5.html")
    print(f"Draw Things proxy: /dtapi -> {DT_TARGET}")
    print(f"Prompt Studio backups: {BACKUP_DIR} (latest {BACKUP_LIMIT})")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
