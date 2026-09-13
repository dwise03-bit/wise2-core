import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Command Center is a self-contained demo/operations surface. Keep its
// middleware local so Next.js never resolves the monorepo's unrelated auth
// middleware when this app is built independently.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
