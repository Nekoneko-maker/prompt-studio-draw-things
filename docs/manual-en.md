# Prompt Studio — Complete Manual

A full guide to Prompt Studio, a prompt management tool for Draw Things. Written so that first-time users can follow along.

---

## Table of Contents

1. [What is Prompt Studio?](#1-what-is-prompt-studio)
2. [Installation (Download & Launch)](#2-installation-download--launch)
3. [Batch Script "Prompt Runner Unlimited" — Setup & Usage](#3-batch-script-prompt-runner-unlimited--setup--usage)
4. [How Your Data Is Stored (Read This First)](#4-how-your-data-is-stored-read-this-first)
5. [Screen Layout Overview](#5-screen-layout-overview)
6. [Library Tab — Your Tag & LoRA Storehouse](#6-library-tab--your-tag--lora-storehouse)
7. [Compose Tab — Build Prompts and Generate](#7-compose-tab--build-prompts-and-generate)
8. [Setting Up the Draw Things API Connection (Beginner-Friendly)](#8-setting-up-the-draw-things-api-connection-beginner-friendly)
9. [Groups Tab — Where Prompts Grow](#9-groups-tab--where-prompts-grow)
10. [Assist Tab — Import & Formatting Helpers](#10-assist-tab--import--formatting-helpers)
11. [Preview Tab — Reverse-Lookup Prompts from Images](#11-preview-tab--reverse-lookup-prompts-from-images)
12. [Settings Tab — Theme, Backup, and AI](#12-settings-tab--theme-backup-and-ai)
13. [FAQ & Troubleshooting](#13-faq--troubleshooting)

---

## 1. What is Prompt Studio?

Prompt Studio is a prompt management tool for the AI image generation app "Draw Things".

- It runs as a **single HTML file**. No installation — just open it in your browser
- It works **fully offline** (network access is only used for the optional AI helper features and the Draw Things API connection, and both stay on your local machine/LAN)
- Your data is stored **inside your browser**. Nothing is ever sent to an external server

### What can it do?

- Register and categorize tags and LoRAs (Library)
- Combine tags into prompts and send generation requests directly to Draw Things (Compose)
- Organize finished prompts into groups and folders, and refine them with search, replace, and compare tools (Groups)
- Automatically split and bulk-register prompt batches written by an AI (Assist)
- **Load a folder of generated images and reverse-lookup prompts from the images themselves** (Preview)

The last one, Preview, is the heart of the tool. Draw Things embeds the prompt and generation settings into every image it creates as metadata. Prompt Studio reads that metadata so you can search it and reuse it — creating a loop of "image → prompt → generate again".

### Requirements

- **Recommended browsers**: Google Chrome / Microsoft Edge (latest)
- Safari / Firefox run the core features, but some functions (folder selection, parts of automatic backup) may be limited
- Works on both Mac and Windows (the Draw Things connection assumes Draw Things running on a Mac)

---

## 2. Installation (Download & Launch)

1. Open the GitHub repository
2. Click `prompt_studio_en.html`
3. Click the "**Raw**" button at the top right
4. Save the file with `Cmd + S` (`Ctrl + S` on Windows)
   - Make sure the filename ends in `.html`. If it saved as `.txt` or similar, rename it to `.html`
5. Double-click the saved file to open it in your browser

That's it. From then on, just open the same file. Bookmarking it is handy.

---

## 3. Batch Script "Prompt Runner Unlimited" — Setup & Usage

The one-prompt-per-line output that Prompt Studio produces (via "Copy Batch" / "Copy Script OPTIONS") is designed to be pasted into this batch generation script. **This combination is the standard workflow**, so we recommend installing it right away.

It is an extended version of the Batch Prompt Runner published by apeboywired (https://apeboywired.com), with per-prompt size, per-prompt LoRA OFF, and inpaint support added. It is bundled in the ZIP as `Prompt Runner Unlimited`.

### 3-1. What it does

- Paste a prompt list, and it **generates each prompt in order automatically and saves the results to a folder**
- Per-prompt resolution (`704x832 | prompt`)
- Per-prompt LoRA OFF (`--no-lora | prompt`)
- Inpaint mode: reuses the current canvas image + mask across all prompts
- After the batch finishes, Draw Things' settings and prompt are automatically restored to their pre-run state

### 3-2. Installation

1. Open the `Prompt Runner Unlimited` file from the ZIP in a text editor and **copy its entire contents**
2. Open Draw Things and select "**Scripts**" in the sidebar
3. Click the "**+**" button at the top right to create a new script
4. Paste the copied contents and save (name it whatever you like)
5. From now on, just select it from the script list and run it

### 3-3. Usage

1. In Prompt Studio, copy your prompts with Copy Batch (Groups tab) or Copy Prompt + (Compose tab)
2. Run the script in Draw Things — a popup appears
3. Paste into the "Prompt list" field and press OK
4. Generation runs top to bottom automatically, saving into your Pictures folder

When finished, you'll see "Batch complete: n image(s) generated". It looks like an error dialog, but it's actually the completion report.

### 3-4. Prompt format

One prompt per line. The following formats are supported:

```
masterpiece, best quality, 1girl, ramen shop counter
704x832 | masterpiece, best quality, 1girl, portrait
1344x768 | masterpiece, best quality, landscape, wide shot
--no-lora | masterpiece, background only, no character
704x832 | --no-lora | masterpiece, simple background
# lines starting with # are ignored
```

- Prefix a line with `WIDTHxHEIGHT |` to set an individual resolution for that prompt only
- Prefix with `--no-lora |` to generate that prompt without any LoRA (`--lora-off` and `--clear-lora` also work). When combined with a size, the size comes first
- Lines starting with `#` are ignored

You rarely need to type these by hand — Prompt Studio adds them automatically. If a prompt in Groups has a size or a LoRA OFF flag set, Copy Batch outputs it in this exact format.

### 3-5. Popup fields

| Field | Description |
|---|---|
| Prompt list | Paste your prompt list here |
| Negative prompt override | If filled, overrides the negative prompt for this run only (leave empty to keep the current setting) |
| Images per prompt | Number of images per prompt (1–16) |
| Enable Inpaint mode | Inpaint mode (see below) |

### 3-6. Inpaint mode

When "Enable Inpaint mode" is ON, the script reuses **the image currently on the canvas plus the mask you drew** for every prompt in the list.

- Great for "same composition, different expression" or "keep the background, change the pose"
- You must load an image onto the canvas and draw a mask beforehand (the script raises a clear error if either is missing)
- **Per-prompt size specification is disabled in inpaint mode** (a size-prefixed line will raise an error)

Images downloaded from the Preview tab keep their metadata, so loading one onto the canvas as inpaint material works seamlessly.

### 3-7. Advanced: OPTIONS settings

Editing the `OPTIONS` block at the top of the script unlocks finer control. Normally you don't need to touch it.

| Setting | Default | Description |
|---|---|---|
| seedStart / seedStep | -1 / 1 | -1 = random seed. Set 0 or higher for a fixed starting seed that increments by seedStep per image |
| filenamePrefix | "batch" | Prefix for saved filenames |
| negativePrompt | "" | Default negative prompt (popup input takes priority) |
| steps / guidanceScale / model / sampler / clipSkip / strength | null | Set to override the current settings — useful for restoring settings from PNG metadata |
| loras / mergeLoras | null / false | Override the LoRA setup. `[]` clears all LoRAs; mergeLoras: true appends to the current LoRAs |

### 3-8. Leaving batches unattended (Mac)

If your Mac sleeps mid-batch, generation may stop. Run

```
caffeinate
```

in Terminal before starting the batch (`caffeinate -i` if you want the display to sleep). If your save folder is on iCloud, you can watch the images arrive in real time from your iPhone or another device.

---

## 4. How Your Data Is Stored (Read This First)

All Prompt Studio data (tags, LoRAs, Groups, settings) lives in your **browser's localStorage**. The HTML file itself is never modified.

This means:

- Open the file in the same browser and your data is right where you left it
- **Opening it in a different browser shows an empty state** (Chrome's data is invisible to Safari)
- **Clearing your browser's history/cache also clears your data**

> **Note for users of the Japanese version:** the English version stores its data under separate keys, so the two versions never touch each other's data — even in the same browser. To bring your data over from the Japanese version, use Export JSON there and Import JSON here. The file format is fully compatible.

### Three ways to protect your data

| Method | Location | Description |
|---|---|---|
| **Automatic Backup** | Settings tab | Automatically saves to your browser on every change (last 10 generations). On by default, no setup needed |
| **Export JSON** | Library tab | Writes all data to a JSON file. Use it for periodic manual backups and for moving to another browser or PC |
| **Auto-import** | Settings tab | Automatically loads a designated JSON file on startup |

**At minimum, get in the habit of pressing "Export JSON" on the Library tab after any big session.**

---

## 5. Screen Layout Overview

The tabs across the top switch between features.

| Tab | Role | Think of it as |
|---|---|---|
| **Library** | Register and categorize tags & LoRAs | The pantry |
| **Compose** | Build prompts and send them to generation | The kitchen counter |
| **Groups** | Save, organize, and refine finished prompts | The freezer and shelves |
| **Assist** | Import AI output, translate, reformat | The prep corner |
| **Preview** | Browse generated images and reverse-lookup prompts | Where you take ingredients back out of a finished dish |
| **Settings** | Theme, backup, AI settings | The utility room |

The "↑" and "↓" buttons at the screen edges jump to the top/bottom of the page.

---

## 6. Library Tab — Your Tag & LoRA Storehouse

The left column manages tags; the right column manages LoRAs.

### 6-1. Export / Import

At the very top of the tab.

- **Export JSON**: saves everything (tags, categories, LoRAs, Stock, Groups, Folders) into one JSON file
- **Import JSON**: loads a JSON file. Choose the scope with the dropdown:
  - "Import: Tags + Groups": import everything
  - "Import: Only Tags": tags, categories, LoRAs
  - "Import: Only Groups": groups only

Import **merges into** your existing data. Duplicate entries are skipped automatically — nothing gets overwritten or lost.

### 6-2. Registering tags

Paste a comma-separated prompt into the registration box:

```
masterpiece, best quality, 1girl, solo, long hair
```

A per-tag preview appears below.

- **Register selection**: register only the tags you clicked in the preview
- **Register All**: register everything at once
- Already-registered tags are skipped automatically

### 6-3. Categories

Tags can be sorted into 11 categories.

| Category | Examples |
|---|---|
| quality | masterpiece, best quality |
| character | 1girl, long hair, blue eyes |
| clothes | dress, oversized clothes — garment types and shapes |
| clothes/expression | wet clothes, torn clothes — temporary states of clothing |
| emotion | happy, sad, embarrassed |
| pose/expression | sitting, looking at viewer — body movement and gaze |
| style/technique | pixel art, watercolor |
| background | outdoor, city, forest |
| camera/angle | close-up, from above |
| effect | bokeh, sparkle |
| other | everything else |

You can categorize by hand, or let **the AI categorizer in the Assist tab** do it automatically (see later).

### 6-4. Browsing and searching tags

- Sort order: registration order / A-Z / kana
- Search box to filter tags
- Category bar to browse by category
- "To top" / "To bottom" buttons for quick navigation in long lists

### 6-5. Output

Click tags to select them; they collect in the output box at the bottom.

- **Comma / Lines**: toggle comma-separated vs. line-separated
- **Copy Output**: copy the output
- **Select All / Clear Sel**: select or deselect everything

### 6-6. Registering LoRAs (right column)

- Enter a display name, filename (.ckpt), weight (0–2, slider), and an optional memo, then press "**Add LoRA**"
- Registered LoRAs become selectable in the Compose tab
- **LoRA sets**: save frequently used LoRA combinations under a name (e.g. "Character set") and recall them with one click

---

## 7. Compose Tab — Build Prompts and Generate

Three columns: a summary sidebar on the left, tag/LoRA selection in the middle, prompt editing and output on the right.

### 7-1. Basic flow

1. In "LoRA to Use", click LoRAs registered in Library to activate them
2. Click tags under "Category Tag Selection" → they get appended to the positive prompt
3. Refine the positive/negative prompts in the right column
4. Set size, steps, CFG, etc.
5. Output (copy, or send via API)

### 7-2. Positive / negative prompts

- The positive field accepts tag clicks, direct typing, and pasting
- **Line-leading trigger word**: enter a character name or LoRA trigger word and it will be automatically prepended to each line at copy time. Saved Group contents are never modified

### 7-3. Size and generation settings

- **Batch size**: pick from presets (704×832, 1024×1024, 1344×768 16:9 — 27 in total) or type width/height directly
- **Steps / CFG Scale / Images per Prompt**: leave blank to use "current" — whatever Draw Things is currently set to
- **Add to Group**: save the prompt you just built into a selected Group

### 7-4. Output buttons

| Button | Action |
|---|---|
| **Copy Script OPTIONS** | Copy code with settings for the batch script |
| **Copy Prompt + ,** | Copy the prompt text only |
| **Shuffle Prompts** | Randomly reorder the prompt lines |
| **Clear** | Clear the inputs |

Paste the copied text into the popup of the bundled batch script "Prompt Runner Unlimited" (see [Chapter 3](#3-batch-script-prompt-runner-unlimited--setup--usage) for installation).

### 7-5. Sending directly to the Draw Things API

The "Draw Things API" card at the bottom of the Compose tab lets you **send generation requests to Draw Things without any copy-pasting**.

| Button | Action |
|---|---|
| **Connection Test** | Verifies the connection to Draw Things. Press this first |
| **Generate First Line** | Generates only the first prompt line. Good for a quick test |
| **Generate All Lines in Order** | Generates every prompt from top to bottom |
| **Stop** | Aborts sending |

Any Model / Sampler / LoRA / setting you leave unspecified uses whatever Draw Things is currently set to. A send log appears below.

**→ Connection setup is explained in the next chapter.**

---

## 8. Setting Up the Draw Things API Connection (Beginner-Friendly)

### 8-1. Draw Things side (required — takes one minute)

1. Open the Draw Things app
2. Open Settings (the gear icon ⚙️)
3. Turn "**API Server**" (HTTP Server) **ON**
4. Leave the port at the default "**7860**"

Done. Draw Things now has a listening endpoint that accepts generation requests.

### 8-2. Prompt Studio side

Confirm that the URL field in the Draw Things API card reads

```
http://127.0.0.1:7860
```

(this is the default). Press "Save" to remember it for next time.

`127.0.0.1` means "this Mac itself". If Draw Things and Prompt Studio run **on the same Mac**, this default just works.

### 8-3. Connection test

Press "**Connection Test**".

- ✅ Success: Draw Things' current model name etc. is displayed
- ❌ Failure: check the following
  1. Is Draw Things running?
  2. Is API Server turned ON in Draw Things settings?
  3. Is the port 7860? (If you changed it, update the URL field to match)

### 8-4. If it still fails: about CORS errors

If you opened the HTML file directly (the address bar starts with `file://`), the browser's security policy (CORS) may block the connection.

Two ways around it:

**Option 1: Check the CORS settings on the Draw Things side**
If Draw Things' API Server settings include a response-header/CORS option, enable it.

**Option 2: Use the bundled local server**
The repository includes a small local server. Running it lets you open Prompt Studio at `http://localhost:PORT`, which avoids the CORS issue entirely (the server provides a `/dtapi` relay endpoint that Prompt Studio uses automatically). Using the local server also enables the **Mac-side automatic backup (30 generations)** described later.

※ The local server is optional. If `file://` works for you, keep using it.

### 8-5. Using it from an iPad or another device

You can open Prompt Studio in an iPad browser and drive Draw Things on your Mac.

1. Connect the Mac and iPad to the **same Wi-Fi**
2. Find the Mac's local IP address (System Settings → Network — something like `192.168.x.x`)
3. Change Prompt Studio's API URL to `http://192.168.x.x:7860` and press "Save"
4. Press Connection test

If it doesn't connect, check that the Mac's firewall allows incoming connections on port 7860.

---

## 9. Groups Tab — Where Prompts Grow

Bundle finished prompts by theme and refine them with search, replace, and compare tools. This is the main workspace of Prompt Studio. Left column: Group list. Right column: details of the selected Group.

### 9-1. Creating and managing Groups

- Type a group name and press "**Create**"
- Filter the list with the **Group search** box
- Buttons in Group Detail:
  - **Copy Batch**: convert every prompt in the Group into one-line batch-script format and copy
  - **Duplicate**: duplicate the Group
  - **Rename** / **Delete**

### 9-2. Organizing Groups with Folders

When Groups pile up, organize them into folders.

- Enter a folder name and press "**Create Folder**"
- **Drag & drop** Groups into folders
- Folders can be collapsed, reordered, and renamed
- Deleting a folder **does not delete the Groups inside** — they move to "Unfiled". No accidental data loss
- The checkbox on a folder header selects every prompt in that folder at once

### 9-3. Adding prompts

Several ways:

| Method | Where | Use case |
|---|---|---|
| "Add to Group" from Compose | Compose tab | Save a prompt you just built |
| "Add paste to Group" | Top of Groups right column | Bulk-paste multiple lines. `704x832 | prompt` size-prefixed lines work too |
| "Add New Prompt to Group" | Bottom of Groups right column | Add a single entry with a TITLE. Multi-line input is flattened to one line |
| Assist AI import | Assist tab | Bulk-register AI output (see later) |
| Register from Preview | Preview tab | Register an image's prompt directly (see later) |

### 9-4. Reordering

- "**Start order editing**" → drag prompts around → "**Confirm and renumber**"
- "**Reverse Group Order**" flips the order in one click

### 9-5. Selecting prompts and bulk actions

Every prompt has a checkbox, and **selection works across Groups**. With a selection you can:

- **Send selections to Compose / Append selections to Compose**: send to the Compose prompt field (replace or append)
- **To Compare & Remix**: view multiple prompts side by side and remix the best parts into a new prompt
- **Derived Group from Selection**: create a new Group containing only the selected prompts
- **Copy Combined Selection / Send merge to Compose / Add merge to Group**: **concatenate** multiple prompts into one — great for assembling parts like "quality tags" + "character description" + "art style"
- **Related Images in Selection Order**: search your generated images for ones matching the selected prompts (requires an image folder loaded in Preview)
- **Top score image**: show the images that match the selected prompts best, ranked

### 9-6. Size at send time

- **Send size**: a temporary size used when sending to Compose. Saved Group contents are unchanged
- **Random size**: pick several candidate sizes, and each selected prompt gets a random one when sent to Compose. Handy for trying the same prompt at various aspect ratios

### 9-7. Search & replace (bulk editing)

The headline feature of Groups.

- **Search**: hits are highlighted as you type. "Prev" / "Next" to jump between them
- **Saved search terms**: store frequent search terms with "Add search term" and recall them from the dropdown
- **Replace**: type the replacement and press
  - "**Apply to Active Group**": run the replacement on the displayed Group
  - "**Apply Across Selected Groups**": run it on selected prompts across every Group (with a confirmation dialog)
  - "**Replace → Save as Variant**": keep the original and save the replaced version as a new variant
  - "**Append Replacement Text**": instead of replacing, append the text to the end of selected prompts
  - Leaving the replace field empty turns the operation into deletion of the search term
- **Search Hits to Compose**: send only the prompts that match the current search (random-size variants available)
- **Comment search**: search TITLEs and memos

### 9-8. Extract All Group Tags (cross-Group search)

"Extract All Group Tags" in the left column **searches every Group for prompts containing specific tags**.

- Comma-separated terms are AND-searched (e.g. `wet hair, swimsuit` → prompts containing both)
- "**Extraction → Selection**": select all hits at once
- "**Selection → Grouping**": build a new Group from the selection

Collecting, say, every swimsuit scene scattered across all your Groups into one Group takes seconds.

### 9-9. Duplicate check

Press "**Duplicate check**" to cluster prompts that are highly similar to each other.

- The similarity threshold is adjustable
- Detects not just exact matches but "almost identical" prompts
- Delete the redundant ones on the spot

If you have an AI mass-produce prompts, near-duplicates pile up — this keeps things tidy.

### 9-10. Library Palette

Expand "Library Palette" to **search your Library tags right inside the Groups screen and insert them into the prompt you're editing**.

- Category filter and search included
- "Insert into editing prompt" / "Copy selected tags" / "Add to Group as new prompt"

Solve "what was that tag again?" on the spot, without switching tabs.

### 9-11. Per-prompt controls

Each prompt row has:

- Edit (with the option to keep the original and save as a diff)
- Individual size (`W x H`)
- **LoRA OFF flag**: send just that prompt without LoRA ("Clear All LoRA OFF" resets them all)
- Duplicate / delete / send to Compose

### 9-12. AI Style Cleaner

"AI Style Cleaner" compresses the essay-style prompts AIs tend to write ("A realistic photo of a woman sitting..., while soft sunlight...") into image-generation tag format. Apply it to any selection at once.

---

## 10. Assist Tab — Import & Formatting Helpers

### 10-1. AI prompt import

Ask Grok, ChatGPT, or another AI for multiple scene prompts, then paste the output here **as-is**.

- Separators like `Prompt 1 (title)` / `Scene 1` / `1. Title` / `### Title` are detected automatically
- Asking the AI to "output in markdown format" keeps the structure stable
- If splitting fails, insert **3 or more blank lines** or a line containing only `---` between prompts

Steps:

1. Paste and press "**Import Preview**" → confirm how many scenes were detected
2. Choose a destination Group (or type a new Group name to create one)
3. Press "**Register all in Group**"

Titles are saved as memos, and boilerplate text is mostly stripped automatically.

### 10-2. Split prompt blocks into single lines

Paste a pile of old prompts (blank-line separated, `---` separated, or size-prefixed lines) and split them into one-prompt-per-line format.

### 10-3. AI Prompt Cleaner

Compresses essay-style prompts into tag format (a standalone version of the Groups "AI Style Cleaner").

### 10-4. Translation (uses Ollama)

※ Requires [Ollama setup](#12-4-ai-backend-ollama) in the Settings tab. Everything else in Prompt Studio works fine without it.

- **Japanese → English (single line)**: type Japanese, press Enter or Translate. Click the result to copy
- **Batch translate & register**: enter multiple lines (one per line), translate them all, and register directly into the Library

### 10-5. Flatten multi-line prompts & Stock

Flattens multi-line prompts into a single line and saves them to "Stock". Stock is searchable and recallable anytime.

### 10-6. AI categorizer (uses Ollama)

Lets an AI sort your Library tags into categories.

- **Manual selection**: click tags to choose, then run
- **Uncategorized batch**: process every uncategorized tag at once
- **pose manual / pose batch**: for refining pose/expression tags
- After running, a preview appears — **review and hand-correct before applying**. Nothing is changed without your confirmation

---

## 11. Preview Tab — Reverse-Lookup Prompts from Images

The heart of Prompt Studio. Load your generated images and search/reuse the metadata (prompts and settings) embedded in them.

### 11-1. Loading an image folder

1. Press "**Select image folder**"
2. Choose Draw Things' save folder
3. Images appear as a thumbnail grid

- **Load mode**: for huge folders, choose "Fast: Image First" to show thumbnails immediately and parse metadata only when an image is selected
- **Sort order**: by modified date, filename, file size, or image dimensions, ascending/descending
- **Thumb slider**: thumbnail size from 80 to 220px

※ Images are only read in place — nothing is copied or modified. Your files stay untouched.

### 11-2. Metadata search

Type a keyword in the search box to **search across the metadata of every loaded image**. The search covers the full prompt, negative prompt, Seed, Model, Sampler, LoRA names — every piece of embedded generation info.

Examples:

- `ramen` → only the ramen-scene images
- a LoRA name → only images generated with that LoRA
- `DPM++ 2M` → only images using that sampler

"Where did that image with those settings go?" — solved instantly.

### 11-3. Image detail panel (right column)

Click a thumbnail to show its details on the right.

**Displayed info**: file info (name, path, size, modified date), generation info (DT Size / Seed / Model / Sampler / Steps / Scale / LoRAs with weights), full Positive/Negative prompts, raw metadata

**Actions on the image**:

| Button | Action |
|---|---|
| Click the image / Zoom | Lightbox view. "100%" toggles actual-size display |
| **Download displayed images** | Downloads this image. **Metadata is preserved**, so Draw Things recognizes it as one of its own generated images. Load it onto the canvas as material for inpainting or depth detection |

**Actions on the prompt**:

| Button | Action |
|---|---|
| **Prompt Copy / Negative Copy / Seed Copy / Metadata Copy** | Copy each piece of info |
| **Copy as One Line with Settings** | Copy the prompt as one line, with size etc. attached |
| **Copy Settings Memo** | Copy Seed / Model / Sampler etc. as a settings memo |
| **To Compose / One-row Compose / Send to Compose with Settings** | Send the prompt to Compose, ready for the next generation |
| **To Compare & Remix** | Send to the Groups comparison panel |
| **Register Prompt to Group / Register Line-by-Line as a Group** | Save into an existing or new Group |
| **Register LoRA to Library** | Register the LoRAs this image used into your Library |

### 11-4. Snippet search (search by part of a prompt)

**Drag-select text** inside the Positive Prompt box and press "Extract selected portion" to use just that fragment for:

- **Search for images in the extracted part**: find other images containing the same phrase
- **Search for Groups in the extracted part**: find saved prompts containing the same phrase
- **Register the extracted part to Library**: save that fragment as a tag

"Have I used this expression anywhere else?" — check it instantly.

### 11-5. Similarity search

- **Nearby Group search from image Prompt**: shows saved prompts closest to the current image's prompt, ranked by score
- **Approximate image search from image Prompt**: finds other images generated from similar prompts
- Match strictness is adjustable: Flexible / Standard / Stringent

"I love this image — which Group did its prompt come from?" — solved.

### 11-6. Selection mode (bulk operations on multiple images)

Turn on "**Selection Mode**" (the toggle reads "Selection Mode OFF" when inactive) and click thumbnails to multi-select (Shift for range select, "Select Visible" for everything in the current search results).

- **Convert selected images to a single line and compose them**: send all selected images' prompts to Compose at once
- **Download the selected images**: batch download
- **Register Selected Image Line-by-Line**: batch-register to a Group
- "With size" checkbox: attach each image's generation size when sending
- "Positive only" checkbox: when ON, negatives are omitted when sending

---

## 12. Settings Tab — Theme, Backup, and AI

### 12-1. Theme

Switch color themes. The LIGHT checkbox enables light mode.

### 12-2. Auto-import

Automatically loads a designated JSON file on startup. Press "File settings" and choose a file exported via Export JSON. Useful for keeping multiple environments in sync.

### 12-3. Automatic Backup

Every time your data changes, a backup is saved automatically. **Enabled by default, no setup needed.**

| Destination | Generations | Condition |
|---|---|---|
| In-browser (IndexedDB) | Last 10 | Always on |
| Mac-side JSON files | Last 30 | Only when using the local server |

- If nothing changed since the last backup, it is skipped (no wasteful writes)
- "**Backup now**" creates a manual backup
- The "**Restore**" button on any history entry rolls back to that point. **Your current state is backed up automatically before restoring**, so even a mistaken restore is reversible

※ If you're not running the local server, the Mac column shows "not connected" — that's normal, not an error. The in-browser backup alone is generally sufficient.

### 12-4. AI Backend (Ollama)

The translation and AI-categorizer features in the Assist tab use the local LLM runtime "Ollama". **No external API key needed.**

Setup:

1. Install Ollama from https://ollama.com
2. Pull a model in Terminal: `ollama pull llama3.2` (other models work too)
3. Confirm the ENDPOINT in the Settings tab reads `http://localhost:11434`
4. Press "Fetch" to list your installed models, then pick one

If you opened Prompt Studio via `file://` and the connection fails, start Ollama like this:

```
OLLAMA_ORIGINS=* ollama serve
```

※ Without Ollama, everything except translation and AI categorization works normally.

---

## 13. FAQ & Troubleshooting

**Q. Where is my data stored? Is anything sent externally?**
A. Everything stays inside your browser (localStorage / IndexedDB). Nothing is sent to any external server. Communication with the Draw Things API and Ollama also stays on your Mac (or your LAN).

**Q. I switched browsers and my data is gone.**
A. Data is stored per-browser. In the original browser, press "Export JSON" on the Library tab, then "Import JSON" in the new browser.

**Q. I cleared my browser cache and my data disappeared.**
A. localStorage was cleared along with it. The automatic backup (10 in-browser generations) in the Settings tab may have survived — press "Update history" and try a restore. If that's also gone, import from a previously exported JSON file.

**Q. I'm coming from the Japanese version — where's my data?**
A. The English version stores its data under separate keys, so the two versions don't share data even in the same browser. Export JSON from the Japanese version and Import JSON here. The file format is fully compatible.

**Q. The Draw Things API connection test fails.**
A. Check in this order: (1) Is Draw Things running? (2) Is API Server ON in Draw Things settings? (3) Is the port 7860? (4) If it still fails, it may be a CORS restriction → see [Chapter 8-4](#8-4-if-it-still-fails-about-cors-errors)

**Q. I want to stop mid-way through "Generate all lines in order".**
A. Press "Stop". Requests already sent may still finish generating on the Draw Things side.

**Q. I loaded images in Preview but no prompts show up.**
A. Metadata is embedded in PNGs generated by Draw Things. Images edited or converted in other apps, and screenshots, have no metadata. Also, in "Fast: images first" mode, metadata isn't parsed until you select an image and press "Detail loading".

**Q. Do I have to re-select the image folder every time?**
A. Yes — browser security requires re-selecting the folder each session (your files are never modified).

**Q. Does it work on a phone / iPad?**
A. It runs in any browser. The Draw Things API connection works from other devices if you set your Mac's IP address (see [Chapter 8-5](#8-5-using-it-from-an-ipad-or-another-device)). The Preview folder picker, however, assumes a desktop browser.

---

That's everything. If anything is unclear, feel free to ask in the comments of the release article.
