import { NextRequest, NextResponse } from "next/server";
import {
  WISE2_BRAND_SUFFIX,
  buildSdxlWorkflow,
  comfyHealth,
  submitComfyPrompt,
} from "@/lib/comfyui";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!(await comfyHealth())) {
    return NextResponse.json({ error: "ComfyUI offline" }, { status: 503 });
  }
  const body = await request.json();
  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }
  const width = Number(body.width) || 1024;
  const height = Number(body.height) || 1024;
  const brand = body.brand !== false;
  const full = brand ? `${prompt}${WISE2_BRAND_SUFFIX}` : prompt;
  const workflow = buildSdxlWorkflow(full, { width, height });
  const promptId = await submitComfyPrompt(workflow);
  return NextResponse.json({ promptId, status: "queued" });
}
