import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
async function probe(url: string) {
  const started = Date.now();
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2500) });
    let data: any = null; try { data = await response.json(); } catch {}
    return { ok: response.ok, status: response.status, latencyMs: Date.now() - started, data };
  } catch (error) { return { ok: false, status: 0, latencyMs: Date.now() - started, error: error instanceof Error ? error.message : "unreachable" }; }
}
export async function GET() {
  const apiBase = process.env.INTERNAL_API_URL || "http://api:3000/api";
  const hermesBase = process.env.HERMES_HEALTH_URL || "http://172.17.0.1:3012";
  const [api, hermesApi, hermesCore] = await Promise.all([
    probe(apiBase.replace(/\/$/, "") + "/health"), probe(apiBase.replace(/\/$/, "") + "/v1/hermes/health"), probe(hermesBase.replace(/\/$/, "") + "/api/health")
  ]);
  const hermesOnline = Boolean(hermesCore.ok || hermesApi.data?.status === "online");
  return NextResponse.json({ generatedAt: new Date().toISOString(), authority: "VPS", website: { ok: true, status: 200 }, api: { ok: api.ok, status: api.status, latencyMs: api.latencyMs }, hermes: { ok: hermesOnline, status: hermesCore.status || hermesApi.status, latencyMs: Math.min(hermesCore.latencyMs, hermesApi.latencyMs), provider: hermesApi.data?.provider, model: hermesApi.data?.model }, deviceFabric: { mode: "TAILSCALE", authority: "VPS" } }, { headers: { "Cache-Control": "no-store" } });
}
