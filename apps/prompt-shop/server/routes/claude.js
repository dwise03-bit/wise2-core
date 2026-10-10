import { Router } from "express";
import { ClaudeServiceError, enhanceWithClaude, validateEnhanceRequest } from "../services/claude.js";

export function createClaudeRouter(options = {}) {
  const router = Router();
  router.post("/enhance", async (request, response) => {
    try {
      const input = validateEnhanceRequest(request.body);
      const result = await enhanceWithClaude(input, options);
      response.json({ ok: true, ...result });
    } catch (error) {
      const known = error instanceof ClaudeServiceError;
      response.status(known ? error.status : 500).json({
        ok: false,
        error: { code: known ? error.code : "INTERNAL_ERROR", message: known ? error.message : "Unexpected server error." },
      });
    }
  });
  return router;
}
