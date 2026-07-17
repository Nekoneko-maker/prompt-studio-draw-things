# Prompt Studio for Draw Things

Prompt Studio is a local, single-file HTML tool for building, organizing, cleaning, and batching image-generation prompts for [Draw Things](https://drawthings.ai/).

It is designed for workflows where you generate or edit many prompts, group them into story-like sequences, and then send them to Draw Things batch scripts.

## Contents

- `prompt_studio.html` — Japanese edition of Prompt Studio 10.5.
- `prompt_studio_en.html` — English edition of Prompt Studio 10.5. Its browser data and backups are kept separate from the Japanese edition.
- `prompt_studio_local_server.py` — optional local server for Draw Things API relay and Mac-side automatic backups.
- `scripts/prompt-runner-unlimited.js` — current Draw Things batch runner with inpaint, per-prompt size, and per-prompt LoRA OFF support.
- `scripts/draw-things-batch-prompt-runner-inpaint-size.js` — Draw Things batch runner script with inpaint support and optional per-prompt size syntax.
- `docs/draw-things-script.md` — usage notes for the Draw Things script.
- `docs/manual-ja.md` — Japanese user manual for Prompt Studio.
- `docs/manual-en.md` — English user manual for Prompt Studio.

## Manuals

- [English manual](docs/manual-en.md)
- [日本語マニュアル](docs/manual-ja.md)

## Features

### Prompt Studio

- Tag library and category management
- Compose workspace for building prompts
- Prompt groups for storyboards / batches
- Drag-and-drop prompt ordering
- Group-wide and cross-group selection
- Per-prompt temporary size override when sending to Compose
- AI-generated prompt import with flexible auto-splitting
- One-line prompt conversion
- Prompt cleaner for prose-like AI output
- Ollama-assisted translation, categorization, and prompt cleanup
- Generated-image preview and metadata-based prompt search
- Direct generation through the Draw Things API
- Local-first browser storage with optional automatic backups

### Draw Things script

- Batch prompt execution
- Optional per-prompt size format:

```text
704x832 | prompt text here
1536x1024 | another prompt here
```

- Optional inpaint mode using the current canvas image + mask
- Negative prompt override
- Fixed or random seed support
- Output filename includes size and prompt slug

## Quick Start

### Prompt Studio

Open either edition directly in a browser:

```text
file:///path/to/prompt_studio.html
file:///path/to/prompt_studio_en.html
```

No build step is required.

For Draw Things API relay and Mac-side backups, start the optional local server:

```bash
python3 prompt_studio_local_server.py
```

### Draw Things script

1. Open Draw Things.
2. Open Scripts.
3. Create a new script.
4. Paste the contents of `scripts/draw-things-batch-prompt-runner-inpaint-size.js`.
5. Run the script.
6. Paste prompts into the popup.

Example:

```text
1024x1536 | masterpiece, best quality, 1girl, city street
1536x1024 | masterpiece, best quality, landscape, sunset
```

## Attribution

The Draw Things batch runner script is an extended version based on the original Batch Prompt Runner by apeboywired.

- Original creator: apeboywired
- Website: https://apeboywired.com
- Original gist: https://gist.github.com/apeboywired/03e625cc2eb7fc41ef16481178b55b85

## License / Publishing note

Prompt Studio itself is provided under the license in this repository.

The Draw Things script includes attribution to apeboywired because it is based on the original public gist. If you plan to redistribute the derived script publicly, it is recommended to confirm permission or licensing terms from the original author if no explicit license is provided with the original gist.

## Disclaimer

This project is an independent tool and is not affiliated with Draw Things, apeboywired, Anthropic, Ollama, or OpenAI.
