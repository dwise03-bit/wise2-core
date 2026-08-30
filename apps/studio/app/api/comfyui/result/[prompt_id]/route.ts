import { NextRequest, NextResponse } from "next/server";
import { imageViewUrl, pollComfyResult } from "@/lib/comfyui";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { prompt_id: string } }
) {
  const result = await pollComfyResult(params.prompt_id);
  if (!result) {
    return NextResponse.json({ status: "pending", promptId: params.prompt_id });
  }
  return NextResponse.json({
    status: "complete",
    promptId: params.prompt_id,
    images: result.images.map((img) => ({
      filename: img.filename,
      url: imageViewUrl(img),
    })),
  });
}
