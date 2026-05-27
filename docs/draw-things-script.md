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
