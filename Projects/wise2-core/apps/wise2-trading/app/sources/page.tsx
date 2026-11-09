import { ExternalLink, Github, RefreshCw, ShieldCheck, Star } from 'lucide-react';

type Repo = { full_name: string; html_url: string; description: string | null; stargazers_count: number; language: string | null; pushed_at: string; topics?: string[] };

const queries = ['tradingview webhook', 'algorithmic trading python', 'NinjaTrader strategy', 'market data AI trading'];

async function getSources() {
  const results = await Promise.all(queries.map(async (query) => {
    const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=6`, { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, next: { revalidate: 3600 } });
    if (!response.ok) return [] as Repo[];
    const payload = await response.json() as { items?: Repo[] };
    return payload.items ?? [];
  }));
  const unique = new Map<string, Repo>();
  results.flat().forEach((repo) => unique.set(repo.full_name, repo));
  return [...unique.values()].sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at)).slice(0, 18);
}

export default async function SourcesPage() {
  const repos = await getSources();
  return <main className="source-page"><header className="source-hero"><div><p className="eyebrow">WISE² SOURCE RADAR</p><h1>Find the signal.<br/><i>Keep the judgment.</i></h1><p className="lead">A daily public-source scan across GitHub trading research, webhooks, market data, and AI tooling. Every result links back to the original repository for review.</p></div><div className="source-trust"><ShieldCheck size={18}/><span>Public repositories only<br/><small>Sorted by recent activity</small></span></div></header><section className="source-toolbar"><div><p className="eyebrow">DAILY DISCOVERY</p><h2>{repos.length} sources surfaced</h2></div><a className="source-refresh" href="/trading/sources"><RefreshCw size={15}/> Refresh scan</a></section><section className="source-grid">{repos.map((repo) => <article className="source-card" key={repo.full_name}><div className="source-card-top"><Github size={18}/><span>{repo.language || 'Open source'}</span></div><h3>{repo.full_name}</h3><p>{repo.description || 'No description provided by the repository owner.'}</p><div className="source-meta"><span><Star size={13}/> {repo.stargazers_count.toLocaleString()}</span><span>Updated {new Date(repo.pushed_at).toLocaleDateString()}</span></div><a className="source-link" href={repo.html_url} target="_blank" rel="noreferrer">Review repository <ExternalLink size={14}/></a></article>)}</section><footer className="source-foot">Source Radar is a discovery tool, not a recommendation engine. Review code, licenses, security posture, and provider terms before using anything in production. GitHub API results are public and rate-limited.</footer></main>;
}
