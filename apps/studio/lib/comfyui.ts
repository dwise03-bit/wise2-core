const COMFYUI_API_URL = (
  process.env.COMFYUI_API_URL || "http://100.68.145.5:8188"
).replace(/\/$/, "");

export const WISE2_BRAND_SUFFIX =
  ", WISE² brand aesthetic, purple #9d4edd and electric green #39ff14 accents, " +
  "matte black background, cinematic HDR, premium luxury tech, 4K";

const DEFAULT_NEGATIVE =
  "blurry, low quality, watermark, signature, distorted text, ugly, deformed";

export function buildSdxlWorkflow(
  prompt: string,
  opts: { width?: number; height?: number; prefix?: string } = {}
) {
  const { width = 1024, height = 1024, prefix = "wise2-studio" } = opts;
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

export async function comfyHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${COMFYUI_API_URL}/system_stats`, {
      signal: AbortSignal.timeout(8000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function submitComfyPrompt(workflow: object): Promise<string> {
  const r = await fetch(`${COMFYUI_API_URL}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: "wise2-studio", prompt: workflow }),
  });
  if (!r.ok) throw new Error(`ComfyUI error ${r.status}`);
  const data = await r.json();
  if (!data.prompt_id) throw new Error("No prompt_id");
  return data.prompt_id;
}

export async function pollComfyResult(promptId: string) {
  const r = await fetch(`${COMFYUI_API_URL}/history/${promptId}`);
  if (!r.ok) return null;
  const history = await r.json();
  const entry = history[promptId];
  if (!entry?.outputs) return null;
  const images: Array<{ filename: string; subfolder?: string; type?: string }> = [];
  for (const out of Object.values(entry.outputs) as Array<{ images?: typeof images }>) {
    for (const img of out.images || []) images.push(img);
  }
  return images.length ? { promptId, images } : null;
}

export function imageViewUrl(img: { filename: string; subfolder?: string; type?: string }) {
  const q = new URLSearchParams({ filename: img.filename, type: img.type || "output" });
  if (img.subfolder) q.set("subfolder", img.subfolder);
  return `${COMFYUI_API_URL}/view?${q}`;
}

export { COMFYUI_API_URL };
