import { env } from "cloudflare:workers";
import { z } from "zod";

const Inquiry = z.object({
  name: z.string().trim().min(2).max(100),
  contact: z.string().trim().min(3).max(160),
  services: z.array(z.string().trim().min(1).max(80)).max(8),
  idea: z.string().trim().min(10).max(5000),
  goal: z.string().trim().min(5).max(3000),
  sourcePath: z.string().trim().max(200).default("/start"),
  company: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = Inquiry.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Please check the highlighted information and try again." }, { status: 400 });
    const { company: _company, ...data } = parsed.data;
    const id = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO inquiries (id, created_at, name, contact, services, idea, goal, status, source_path) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`)
      .bind(id, Date.now(), data.name, data.contact, JSON.stringify(data.services), data.idea, data.goal, data.sourcePath).run();
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    console.error("Inquiry submission failed", error);
    return Response.json({ error: "Your brief could not be saved right now. Your answers are still here—please try again." }, { status: 503 });
  }
}
