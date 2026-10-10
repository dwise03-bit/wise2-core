import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

export function dimensionsForAspectRatio(aspectRatio) {
  if (aspectRatio === "9:16") return { width: 384, height: 640 };
  if (aspectRatio === "1:1") return { width: 512, height: 512 };
  return { width: 640, height: 384 };
}

export class LocalImageAdapter {
  constructor({ baseUrl = "", outputDir = path.resolve("data/generated-images"), logoPath = path.resolve("server/assets/w2-signature-primary.png"), fetchImpl = globalThis.fetch } = {}) { this.id = "local-stable-diffusion"; this.name = "Local Stable Diffusion"; this.baseUrl = baseUrl.replace(/\/$/, ""); this.outputDir = outputDir; this.privateDir = path.join(outputDir, "clean"); this.logoPath = logoPath; this.fetchImpl = fetchImpl; }
  isConfigured() { return /^https?:\/\//.test(this.baseUrl); }
  async request(endpoint, body) {
    if (!this.isConfigured()) throw Object.assign(new Error("Local image service is not configured."), { status: 503, code: "LOCAL_IMAGE_NOT_CONFIGURED" });
    const response = await this.fetchImpl(`${this.baseUrl}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.images?.[0]) throw new Error(payload.detail || `Local image generation failed (${response.status}).`);
    return payload.images[0];
  }
  async watermark(cleanBuffer, width, height) {
    const logo = (await readFile(this.logoPath)).toString("base64");
    const markWidth = Math.max(88, Math.round(width * 0.22));
    const markHeight = Math.round(markWidth * 0.68);
    const placements = [[width * .04,height * .08,.10],[width * .55,height * .2,.10],[width * .18,height * .55,.10],[width * .66,height * .68,.10],[width-markWidth-18,height-markHeight-18,.34]];
    const images = placements.map(([x,y,opacity]) => `<image href="data:image/png;base64,${logo}" x="${Math.round(x)}" y="${Math.round(y)}" width="${markWidth}" height="${markHeight}" preserveAspectRatio="xMidYMid meet" opacity="${opacity}"/>`).join("");
    const overlay = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${images}</svg>`);
    return sharp(cleanBuffer).composite([{ input:overlay, top:0, left:0 }]).png().toBuffer();
  }
  async save(base64, metadata, access = {}) {
    const id = randomUUID();
    await mkdir(this.outputDir, { recursive: true }); await mkdir(this.privateDir, { recursive: true });
    const cleanBuffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
    await writeFile(path.join(this.privateDir, `${id}.png`), cleanBuffer);
    await writeFile(path.join(this.privateDir, `${id}.json`), JSON.stringify({ ownerId:access.ownerId || null, createdAt:new Date().toISOString() }));
    await writeFile(path.join(this.outputDir, `${id}.png`), await this.watermark(cleanBuffer, metadata.width, metadata.height));
    const cleanAllowed = Boolean(access.paid && access.ownerId);
    return { id, providerId: this.id, assetUrl: cleanAllowed ? `/api/image/generations/${id}/clean` : `/generated/${id}.png`, watermarked:!cleanAllowed, plan:cleanAllowed ? "pro" : "free", status:"completed", costUsd:0, ...metadata };
  }
  async generate({ prompt, negativePrompt = "", aspectRatio = "1:1", steps = 18, access = {} }) {
    const dimensions = dimensionsForAspectRatio(aspectRatio);
    const image = await this.request("/sdapi/v1/txt2img", { prompt, negative_prompt: negativePrompt, ...dimensions, steps: Math.min(Math.max(Number(steps) || 18, 8), 30), batch_size: 1, n_iter: 1 });
    return this.save(image, dimensions, access);
  }
  async generateFromImage({ imageBuffer, prompt, negativePrompt = "", aspectRatio = "1:1", steps = 18, strength = 0.62, access = {} }) {
    const dimensions = dimensionsForAspectRatio(aspectRatio);
    const image = await this.request("/sdapi/v1/img2img", { init_images: [imageBuffer.toString("base64")], prompt, negative_prompt: negativePrompt, ...dimensions, steps: Math.min(Math.max(Number(steps) || 18, 8), 30), denoising_strength: Math.min(Math.max(Number(strength) || 0.62, 0.15), 0.9), batch_size: 1, n_iter: 1 });
    return this.save(image, { ...dimensions, source: "upload" }, access);
  }
  async getCleanImage(id, ownerId) { if (!/^[0-9a-f-]{36}$/i.test(id)) return null; try { const metadata = JSON.parse(await readFile(path.join(this.privateDir, `${id}.json`), "utf8")); if (!ownerId || metadata.ownerId !== ownerId) return null; return await readFile(path.join(this.privateDir, `${id}.png`)); } catch { return null; } }
}
