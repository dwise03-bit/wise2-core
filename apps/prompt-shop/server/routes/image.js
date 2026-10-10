import { Router, raw } from "express";
import { authMiddleware, optionalAuthMiddleware } from "../auth/auth.js";

export function createImageRouter(adapter, { authRuntime, billing } = {}) {
  const router = Router();
  const optionalAuth = optionalAuthMiddleware(authRuntime.service);
  const requireAuth = authMiddleware(authRuntime.service);
  const accessFor = async (request) => { const entitlement = request.user ? await authRuntime.repository.getImageEntitlement(request.user.id) : { plan:"free", active:false }; return { ownerId:request.user?.id || null, paid:Boolean(entitlement.active), entitlement }; };
  router.get("/providers", (_request, response) => response.json({ ok: true, providers: [{ id: adapter.id, name: adapter.name, configured: adapter.isConfigured(), costPolicy: "local-no-api-fee" }] }));
  router.get("/entitlement", optionalAuth, async (request, response) => { const access = await accessFor(request); response.json({ ok:true, signedIn:Boolean(request.user), plan:access.entitlement.plan, active:access.paid, watermarkRequired:!access.paid, billingConfigured:Boolean(billing?.isConfigured()) }); });
  router.get("/generations/:id/clean", requireAuth, async (request, response) => { const entitlement = await authRuntime.repository.getImageEntitlement(request.user.id); if (!entitlement.active) return response.status(403).json({ ok:false, error:{ code:"CLEAN_DOWNLOAD_REQUIRES_PRO", message:"An active paid plan is required for clean downloads." } }); const image = await adapter.getCleanImage(request.params.id, request.user.id); if (!image) return response.status(404).json({ ok:false, error:{ code:"IMAGE_NOT_FOUND", message:"Clean image was not found for this account." } }); response.setHeader("Cache-Control","private, no-store"); response.type("png").send(image); });
  router.post("/generations", optionalAuth, async (request, response) => {
    try {
      const { prompt, negativePrompt, aspectRatio, steps } = request.body || {};
      if (!String(prompt || "").trim() || String(prompt).length > 12000) return response.status(400).json({ ok: false, error: { code: "INVALID_IMAGE_PROMPT", message: "Image prompt must contain 1 to 12,000 characters." } });
      const result = await adapter.generate({ prompt: String(prompt).trim(), negativePrompt: String(negativePrompt || "").slice(0, 4000), aspectRatio, steps, access:await accessFor(request) });
      return response.status(201).json({ ok: true, generation: result });
    } catch (error) { return response.status(error.status || 502).json({ ok: false, error: { code: error.code || "IMAGE_GENERATION_ERROR", message: error.message || "Image generation failed." } }); }
  });
  router.post("/generations/from-image", optionalAuth, raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "10mb" }), async (request, response) => {
    try {
      if (!Buffer.isBuffer(request.body) || !request.body.length) return response.status(400).json({ ok:false, error:{ code:"INVALID_SOURCE_IMAGE", message:"Upload a PNG, JPEG, or WebP image up to 10MB." } });
      const prompt = String(request.query.prompt || "").trim();
      if (!prompt || prompt.length > 12000) return response.status(400).json({ ok:false, error:{ code:"INVALID_IMAGE_PROMPT", message:"Choose or enter a valid WISE TOUCH transformation prompt." } });
      const generation = await adapter.generateFromImage({ imageBuffer:request.body, prompt, negativePrompt:String(request.query.negativePrompt || "").slice(0,4000), aspectRatio:String(request.query.aspectRatio || "1:1"), steps:Number(request.query.steps || 18), strength:Number(request.query.strength || 0.62), access:await accessFor(request) });
      return response.status(201).json({ ok:true, generation });
    } catch(error) { return response.status(error.status || 502).json({ ok:false, error:{ code:error.code || "IMAGE_GENERATION_ERROR", message:error.message || "Image transformation failed." } }); }
  });
  return router;
}
