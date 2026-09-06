import { env } from "cloudflare:workers";
import { desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const user = await requireChatGPTUser("/inquiries");
  const adminEmail = (env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL;
  if (!adminEmail || user.email.toLowerCase() !== adminEmail.toLowerCase()) notFound();
  const rows = await getDb().select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(100);
  return <main className="inbox-page"><header className="case-nav shell"><a className="logo" href="/">WISE<sup>2</sup></a><div className="inbox-user"><span>{user.displayName}</span><a href={chatGPTSignOutPath("/")}>Sign out</a></div></header><section className="inbox shell"><div className="inbox-head"><div><p className="eyebrow">Private project inbox</p><h1>New ideas<br/>enter here.</h1></div><div className="inbox-count"><strong>{rows.filter(x=>x.status==="new").length}</strong><span>New briefs</span></div></div>{rows.length===0?<div className="inbox-empty"><b>Inbox ready.</b><p>New project briefs will appear here as soon as someone submits the start form.</p></div>:<div className="inquiry-list">{rows.map((row,i)=><article key={row.id}><div className="inquiry-meta"><span>{String(i+1).padStart(2,"0")}</span><time dateTime={row.createdAt.toISOString()}>{row.createdAt.toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"})}</time><b>{row.status}</b></div><div className="inquiry-body"><div><p className="eyebrow">From</p><h2>{row.name}</h2><a href={`mailto:${row.contact}`}>{row.contact}</a></div><div><p className="eyebrow">Build path</p><div className="inquiry-tags">{(JSON.parse(row.services) as string[]).map(x=><span key={x}>{x}</span>)}</div><h3>The rough idea</h3><p>{row.idea}</p><h3>Success looks like</h3><p>{row.goal}</p></div></div></article>)}</div>}</section></main>;
}
