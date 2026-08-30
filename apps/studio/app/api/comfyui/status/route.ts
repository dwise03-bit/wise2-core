import { NextResponse } from "next/server";
import { COMFYUI_API_URL, comfyHealth } from "@/lib/comfyui";

export const dynamic = "force-dynamic";

export async function GET() {
  const online = await comfyHealth();
  return NextResponse.json({
    online,
    url: COMFYUI_API_URL,
    model: "sd_xl_base_1.0.safetensors",
  });
}
