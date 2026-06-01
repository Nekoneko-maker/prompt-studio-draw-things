# Draw Things Batch Prompt Runner - Inpaint + Size-per-prompt

This script is a modified Draw Things batch runner based on apeboywired's original Batch Prompt Runner.

## Supported prompt formats

Plain prompt:

```text
a red apple on white background
```

Size-prefixed prompt:

```text
704x832 | a red apple on white background
832x704 | a blue sports car at night
```

Lines beginning with `#` are ignored.

## Inpaint mode

When Inpaint mode is enabled, the script reuses the current canvas image and current mask for every prompt.

Per-prompt size is intentionally disabled in inpaint mode, because changing output size while reusing a fixed image/mask can produce inconsistent or invalid behavior.

## Options

Edit the `OPTIONS` object near the top of the script:

```js
var OPTIONS = {
  imagesPerPrompt: 1,
  seedStart: -1,
  seedStep: 1,
  filenamePrefix: "batch",
  negativePrompt: "",
  keepPromptAfterRun: true,
};
```

## Output

Generated images are saved to Draw Things' Pictures path. Filenames include:

- prefix
- inpaint tag when applicable
- size tag when applicable
- prompt slug
- generated count

Example:

```text
batch_1024x1536_masterpiece_best_quality_0001.png
```


## Optional setting overrides

The script keeps the current Draw Things configuration by default. If you want to restore settings from metadata or force a specific setup, edit `OPTIONS` near the top of the script.

```js
var OPTIONS = {
  imagesPerPrompt: 1,
  seedStart: -1,
  seedStep: 1,
  filenamePrefix: "batch",
  negativePrompt: "",
  keepPromptAfterRun: true,

  // Leave null / "" to keep current Draw Things settings.
  steps: null,
  guidanceScale: null,
  model: "",
  sampler: null, // numeric Draw Things sampler id
  loras: null,   // null = keep current LoRA, [] = clear LoRA, array = replace LoRA
  mergeLoras: false,
  clipSkip: null,
  strength: null,
};
```

Example LoRA override:

```js
loras: [
  { mode: "all", file: "barbu_2500_lora_f32.ckpt", weight: 0.78 },
  { mode: "all", file: "detialn_xl_lora_f16.ckpt", weight: 0.45 },
],
```

Notes:

- `model` should be a model file name available in Draw Things.
- `sampler` currently expects the numeric Draw Things sampler id, not the display name.
- `loras: null` keeps the current Draw Things LoRA settings.
- `loras: []` clears LoRA settings for the run.
- `mergeLoras: true` appends the listed LoRA entries to the current Draw Things LoRA configuration.
