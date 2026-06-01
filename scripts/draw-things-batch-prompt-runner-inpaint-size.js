//@api-1.0
/*
 * Draw Things Batch Prompt Runner - Inpaint Edition
 * Size-per-prompt supported
 * Based on original by apeboywired (https://apeboywired.com)
 * Original gist: https://gist.github.com/apeboywired/03e625cc2eb7fc41ef16481178b55b85
 *
 * Notes:
 * - This is a modified/extended version for personal batch prompt workflows.
 * - Supports optional per-prompt size format: WIDTHxHEIGHT | prompt
 * - Inpaint mode reuses the current canvas image + mask and disables size-per-prompt.
 */

var OPTIONS = {
  imagesPerPrompt: 1,
  seedStart: -1,
  seedStep: 1,
  filenamePrefix: "batch",
  negativePrompt: "",
  keepPromptAfterRun: true,

  // Optional config overrides. Leave null / "" to keep current Draw Things settings.
  // These make it possible to restore settings from PNG metadata when needed.
  steps: null,
  guidanceScale: null,
  model: "",
  sampler: null, // numeric Draw Things sampler id, not sampler name
  loras: null,   // null = keep current LoRA, [] = clear LoRA, array = replace LoRA
  mergeLoras: false,
  clipSkip: null,
  strength: null,
};

function parsePrompts(raw) {
  return String(raw || "")
    .split(/\r?\n|;/)
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return s.length > 0 && !s.startsWith("#"); })
    .map(function (line) {
      var m = line.match(/^(\d+)\s*[xX×]\s*(\d+)\s*\|\s*(.+)$/);
      if (m) {
        return {
          width: Math.floor(Number(m[1])),
          height: Math.floor(Number(m[2])),
          prompt: m[3].trim(),
          raw: line
        };
      }

      return {
        width: null,
        height: null,
        prompt: line,
        raw: line
      };
    });
}

function zeroPad(n, width) {
  var s = String(n);
  while (s.length < width) s = "0" + s;
  return s;
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function applySizeToConfig(cfg, width, height) {
  if (!width || !height) return;

  cfg.width = width;
  cfg.height = height;

  cfg.targetImageWidth = width;
  cfg.targetImageHeight = height;

  cfg.originalImageWidth = width;
  cfg.originalImageHeight = height;
}

function hasNumber(value) {
  return value !== null && value !== undefined && value !== "" && isFinite(Number(value));
}

function normalizeLoraEntry(lora) {
  if (!lora) return null;
  var file = lora.file || lora.model || lora.name || "";
  file = String(file || "").trim();
  if (!file) return null;
  var weight = hasNumber(lora.weight) ? Number(lora.weight) : 1;
  var mode = String(lora.mode || "all");
  return { mode: mode, file: file, weight: weight };
}

function normalizeLoras(loras) {
  if (!loras || !loras.length) return [];
  var out = [];
  for (var i = 0; i < loras.length; i++) {
    var item = normalizeLoraEntry(loras[i]);
    if (item) out.push(item);
  }
  return out;
}

function applyOptionalOverridesToConfig(cfg) {
  if (hasNumber(OPTIONS.steps)) cfg.steps = Math.floor(Number(OPTIONS.steps));
  if (hasNumber(OPTIONS.guidanceScale)) cfg.guidanceScale = Number(OPTIONS.guidanceScale);
  if (hasNumber(OPTIONS.sampler)) cfg.sampler = Math.floor(Number(OPTIONS.sampler));
  if (hasNumber(OPTIONS.clipSkip)) cfg.clipSkip = Math.floor(Number(OPTIONS.clipSkip));
  if (hasNumber(OPTIONS.strength)) cfg.strength = Number(OPTIONS.strength);

  if (String(OPTIONS.model || "").trim().length > 0) {
    cfg.model = String(OPTIONS.model).trim();
  }

  if (OPTIONS.loras !== null && OPTIONS.loras !== undefined) {
    var overrideLoras = normalizeLoras(OPTIONS.loras);
    if (OPTIONS.mergeLoras) {
      cfg.loras = normalizeLoras(cfg.loras || []).concat(overrideLoras);
    } else {
      cfg.loras = overrideLoras;
    }
  }
}

if (!pipeline.prompts) { pipeline.prompts = {}; }

var originalPrompt = pipeline.prompts.prompt || "";
var originalNegative = pipeline.prompts.negativePrompt || "";
var originalConfiguration = JSON.parse(JSON.stringify(pipeline.configuration));

var defaultPromptBlock =
  originalPrompt && String(originalPrompt).trim().length > 0
    ? String(originalPrompt)
    : "704x832 | a red apple on white background\n832x704 | a blue sports car at night";

var popup = requestFromUser(
  "Batch Prompt Runner + Inpaint",
  "Paste prompts. Optional format: WIDTHxHEIGHT | prompt",
  function () {
    return [
      this.section("Input", "One prompt per line. Optional: 704x832 | prompt. Lines starting with # are ignored.", [
        this.textField(defaultPromptBlock, "Prompt list", true, 260),
        this.textField("", "Negative prompt override (optional)", true, 90),
        this.slider(1, this.slider.fractional(0), 1, 16, "Images per prompt"),
      ]),
      this.section("Inpaint", "Uses current canvas image + mask. Size-per-prompt is disabled in inpaint mode.", [
        this.switch(false, "Enable Inpaint mode"),
      ]),
    ];
  }
);

var form0 = popup && popup.length > 0 ? popup[0] : null;
var form1 = popup && popup.length > 1 ? popup[1] : null;

var promptText           = form0 && form0.length > 0 ? String(form0[0] || "") : String(originalPrompt || "");
var popupNegative        = form0 && form0.length > 1 ? String(form0[1] || "") : "";
var popupImagesPerPrompt = form0 && form0.length > 2 ? Number(form0[2]) : NaN;
var inpaintMode          = form1 && form1.length > 0 ? Boolean(form1[0]) : false;

// inpaintモード: 事前に画像・マスクを取得しておく
var inpaintImageSrc = null;
var inpaintMask     = null;

if (inpaintMode) {
  inpaintImageSrc = canvas.saveImageSrc(false);
  if (!inpaintImageSrc) {
    throw new Error("Inpaint: キャンバスに画像がありません。先に画像を読み込んでください。");
  }

  inpaintMask = canvas.currentMask;
  if (!inpaintMask || !inpaintMask.handle) {
    throw new Error("Inpaint: マスクがありません。先にマスクを描いてください。");
  }
}

var promptList = parsePrompts(promptText);

if (promptList.length === 0) {
  throw new Error("No prompts found. Paste one prompt per line in the popup Prompt list.");
}

if (inpaintMode) {
  for (var p = 0; p < promptList.length; p++) {
    if (promptList[p].width && promptList[p].height) {
      throw new Error(
        "Inpaint modeではプロンプトごとのサイズ指定は使えません。\n" +
        "サイズ指定を外すか、Inpaint modeをOFFにしてください。\n\n" +
        "該当行: " + promptList[p].raw
      );
    }
  }
}

var imagesPerPrompt = Math.max(
  1,
  Math.floor(Number(isNaN(popupImagesPerPrompt) ? OPTIONS.imagesPerPrompt : popupImagesPerPrompt) || 1)
);

var hasFixedSeed = Number(OPTIONS.seedStart) >= 0;
var seed     = hasFixedSeed ? Math.floor(Number(OPTIONS.seedStart)) : -1;
var seedStep = Math.max(1, Math.floor(Number(OPTIONS.seedStep) || 1));
var prefix   = String(OPTIONS.filenamePrefix || "batch").trim() || "batch";
var generatedCount = 0;

try {
  var runNegativePrompt = null;

  if (String(popupNegative || "").trim().length > 0) {
    runNegativePrompt = String(popupNegative).trim();
  } else if (String(OPTIONS.negativePrompt || "").trim().length > 0) {
    runNegativePrompt = String(OPTIONS.negativePrompt).trim();
  }

  for (var i = 0; i < promptList.length; i++) {
    for (var n = 0; n < imagesPerPrompt; n++) {
      generatedCount += 1;

      var item = promptList[i];
      var prompt = item.prompt;

      var cfg = JSON.parse(JSON.stringify(originalConfiguration));
      applyOptionalOverridesToConfig(cfg);
      cfg.seed = hasFixedSeed ? seed : -1;

      if (item.width && item.height) {
        applySizeToConfig(cfg, item.width, item.height);
      }

      pipeline.configuration = cfg;

      var runArgs = {
        configuration: cfg,
        prompt: prompt,
      };

      if (runNegativePrompt !== null) {
        runArgs.negativePrompt = runNegativePrompt;
      }

      // inpaintモード: 同じ元画像・マスクを全プロンプトで使い回す
      if (inpaintMode) {
        runArgs.image = inpaintImageSrc;
        runArgs.mask  = inpaintMask;
      }

      pipeline.run(runArgs);

      var modeTag   = inpaintMode ? "inpaint_" : "";
      var sizeTag   = item.width && item.height ? String(item.width) + "x" + String(item.height) + "_" : "";
      var promptTag = slugify(prompt) || "prompt";
      var filename  = prefix + "_" + modeTag + sizeTag + promptTag + "_" + zeroPad(generatedCount, 4) + ".png";
      var outputPath = filesystem.pictures.path + "/" + filename;

      canvas.saveImage(outputPath, true);

      if (hasFixedSeed) {
        seed += seedStep;
      }
    }
  }
} finally {
  pipeline.configuration = originalConfiguration;
  pipeline.prompts.negativePrompt = originalNegative;

  if (OPTIONS.keepPromptAfterRun) {
    pipeline.prompts.prompt = originalPrompt;
  }
}

throw new Error(
  "Batch complete: " +
  String(generatedCount) +
  " image(s) generated to " +
  filesystem.pictures.path
);
