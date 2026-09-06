import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects, type ProjectSlug } from "@/lib/projects";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const project = projects[slug as ProjectSlug];
  if (!project) return {};
  return { title: project.title, description: `${project.promise} ${project.summary}` };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const project = projects[slug as ProjectSlug]; if (!project) notFound();
  return <main className="case-page"><header className="case-nav shell"><a className="logo" href="/">WISE<sup>2</sup></a><a className="text-link" href="/">← Back to the foundry</a></header><section className="case-hero shell"><p className="eyebrow">{project.category}</p><h1>{project.title}</h1><p className="case-promise">{project.promise}</p><figure className="case-object"><img src={project.image} alt={project.imageAlt}/></figure></section><section className="case-story porcelain"><div className="shell case-grid"><div><p className="eyebrow dark">The system</p><h2>Built as one connected idea.</h2></div><div><p>{project.summary}</p><div className="output-list">{project.outputs.map((x,i)=><span key={x}><b>0{i+1}</b>{x}</span>)}</div></div></div></section><section className="case-cta shell"><div><p className="eyebrow">Your idea can become a system.</p><h2>Build the next one<br/>with WISE².</h2></div><a className="button" href="/start">Start a project ↗</a></section></main>;
}
