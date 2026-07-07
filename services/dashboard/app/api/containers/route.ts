import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  const output = execSync('docker ps --format "{{.Names}}"').toString();

  return NextResponse.json({
    containers: output.split("\n").filter(Boolean)
  });
}
