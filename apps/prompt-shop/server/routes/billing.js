import { Router, raw } from "express";
import { authMiddleware } from "../auth/auth.js";

export function createBillingWebhookRouter(billing) {
  const router = Router();
  router.post("/", raw({ type:"application/json", limit:"1mb" }), async (request, response) => {
    try { const event = billing.constructEvent(request.body, request.headers["stripe-signature"]); await billing.handleEvent(event); response.json({ received:true }); }
    catch (error) { response.status(400).json({ ok:false, error:{ code:"INVALID_STRIPE_WEBHOOK", message:"Webhook signature or payload is invalid." } }); }
  });
  return router;
}

export function createBillingRouter(billing, authRuntime) {
  const router = Router(); const requireAuth = authMiddleware(authRuntime.service);
  router.get("/status", (_request, response) => response.json({ ok:true, configured:billing.isConfigured() }));
  router.post("/checkout", requireAuth, async (request,response) => { try { response.json({ ok:true, url:await billing.createCheckout(request.user) }); } catch(error) { response.status(error.status || 502).json({ ok:false,error:{code:error.code || "CHECKOUT_ERROR",message:error.message} }); } });
  router.post("/portal", requireAuth, async (request,response) => { try { response.json({ ok:true, url:await billing.createPortal(request.user.id) }); } catch(error) { response.status(error.status || 502).json({ ok:false,error:{code:error.code || "PORTAL_ERROR",message:error.message} }); } });
  return router;
}
