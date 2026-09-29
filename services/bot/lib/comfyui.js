/**
 * ComfyUI client for WISE² Discord bot (SDXL on gpu-nmls-1).
 */
const DEFAULT_COMFY =
  process.platform === "linux" ? "http://127.0.0.1:8188" : "http://100.68.145.5:8188";
const COMFYUI_API_URL = (process.env.COMFYUI_API_URL || DEFAULT_COMFY).replace(/\/$/, "");

const BRAND_SUFFIX =
  ", WISE² brand aesthetic, purple #9d4edd and electric green #39ff14 accents, " +
  "matte black background, cinematic HDR, premium luxury tech, 4K";

const DEFAULT_NEGATIVE =
  "blurry, low quality, watermark, signature, distorted text, ugly, deformed";

function buildWorkflow(prompt, { width = 1024, height = 1024, prefix = "wise2-discord" } = {}) {
  const seed = Math.floor(Math.random() * 1e9);
  return {
    "4": { inputs: { ckpt_name: "sd_xl_base_1.0.safetensors" }, class_type: "CheckpointLoaderSimple" },
    "5": { inputs: { width, height, batch_size: 1 }, class_type: "EmptyLatentImage" },
    "6": { inputs: { text: prompt, clip: ["4", 1] }, class_type: "CLIPTextEncode" },
    "7": { inputs: { text: DEFAULT_NEGATIVE, clip: ["4", 1] }, class_type: "CLIPTextEncode" },
    "8": { inputs: { samples: ["9", 0], vae: ["4", 2] }, class_type: "VAEDecode" },
    "9": {
      inputs: {
        seed,
        steps: 25,
        cfg: 7.5,
        sampler_name: "euler",
        scheduler: "normal",
        denoise: 1,
        model: ["4", 0],
        positive: ["6", 0],
        negative: ["7", 0],
        latent_image: ["5", 0],
      },
      class_type: "KSampler",
    },
    "10": { inputs: { filename_prefix: prefix, images: ["8", 0] }, class_type: "SaveImage" },
  };
}

async function healthCheck() {
  try {
    const r = await fetch(`${COMFYUI_API_URL}/system_stats`, { signal: AbortSignal.timeout(8000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function submitPrompt(workflow) {
  const r = await fetch(`${COMFYUI_API_URL}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: "wise2-discord-bot", prompt: workflow }),
  });
  if (!r.ok) throw new Error(`ComfyUI submit failed: ${r.status}`);
  const data = await r.json();
  if (!data.prompt_id) throw new Error("No prompt_id from ComfyUI");
  return data.prompt_id;
}

async function waitForImages(promptId, timeoutMs = 300000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const r = await fetch(`${COMFYUI_API_URL}/history/${promptId}`);
    if (r.ok) {
      const history = await r.json();
      const entry = history[promptId];
      if (entry?.outputs) {
        const images = [];
        for (const out of Object.values(entry.outputs)) {
          for (const img of out.images || []) images.push(img);
        }
        if (images.length) return images;
      }
    }
    await new Promise((res) => setTimeout(res, 1500));
  }
  throw new Error("ComfyUI generation timed out");
}

async function fetchImageBuffer(img) {
  const q = new URLSearchParams({
    filename: img.filename,
    type: img.type || "output",
  });
  if (img.subfolder) q.set("subfolder", img.subfolder);
  const r = await fetch(`${COMFYUI_API_URL}/view?${q}`);
  if (!r.ok) throw new Error(`Failed to fetch image: ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function generateImage(prompt, opts = {}) {
  const full = opts.brand !== false ? `${prompt}${BRAND_SUFFIX}` : prompt;
  const workflow = buildWorkflow(full, opts);
  const promptId = await submitPrompt(workflow);
  const images = await waitForImages(promptId);
  const buffers = [];
  for (const img of images) {
    buffers.push({ buffer: await fetchImageBuffer(img), filename: img.filename });
  }
  return { promptId, images: buffers };
}

module.exports = { COMFYUI_API_URL, healthCheck, generateImage };
