import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-admin-key");

  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    execSync("docker restart wise-defense-saas-discord-1");

    return NextResponse.json({
      success: true,
      message: "restart-discord successful"
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      message: String(e)
    });
  }
}
