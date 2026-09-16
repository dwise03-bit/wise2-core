'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useHermesChat } from '@/hooks/useHermesChat';

const nav = ['COMMAND','CHATS','AGENTS','PROJECTS','KNOWLEDGE','MEMORY','TASKS','AUTOMATIONS','CRM & SALES','PHONE (AI)','DISCORD','FILES','TOOLS','MONITORING','LOGS','SETTINGS'];
const agents = ['Hermes','Coding','Deploy','HVAC','Sales','Phone','Research','Sound Labs','XR','Design'];
const context = [['Project','wise2-core'],['Branch','main'],['Active Memory','Synced'],['Tools Connected','12 tools online'],['Docker Services','Healthy'],['System Alerts','0 critical'],['Active Agents','4 running']];

type HermesJob = { id: string; type: string; status: string; createdAt: string; updatedAt: string };
type AssetRole = 'LOCKED' | 'EDITABLE' | 'NEW';
type AssetRef = { id: string; url: string; role: AssetRole; kind?: string };
type GenerationResult = {
  imageUrl: string;
  provider: string;
  preservedReferenceIds: string[];
  preservationGuaranteed: boolean;
  jobId: string;
};

function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || '/api';
  return `${base.replace(/\/$/, '')}${path}`;
}

function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('wise2_access_token') || localStorage.getItem('auth_token') || localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function HermesPage() {
  const [route, setRoute] = useState('AUTO');
  const [input, setInput] = useState('');
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'operational' | 'degraded'>('checking');
  const [jobs, setJobs] = useState<HermesJob[]>([]);
  const [opsError, setOpsError] = useState('');
  const { messages, sendMessage, isLoading, model, provider, error } = useHermesChat();

  // Image generation state
  const [imageTab, setImageTab] = useState<'form' | 'results'>('form');
  const [instruction, setInstruction] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:2' | '16:9'>('1:1');
  const [assets, setAssets] = useState<AssetRef[]>([]);
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetRole, setNewAssetRole] = useState<AssetRole>('LOCKED');
  const [newAssetId, setNewAssetId] = useState('');
  const [generationLoading, setGenerationLoading] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);

  const refreshOperations = useCallback(async () => {
    setOpsError('');
    try {
      const [statusResponse, jobsResponse] = await Promise.all([
        fetch(apiUrl('/v1/hermes/status'), { cache: 'no-store' }),
        fetch(apiUrl('/v1/hermes/jobs'), { headers: authHeaders(), cache: 'no-store' }),
      ]);
      setServiceStatus(statusResponse.ok ? 'operational' : 'degraded');
      if (jobsResponse.ok) {
        const payload = await jobsResponse.json();
        setJobs(payload.data?.jobs || []);
      } else if (jobsResponse.status === 401 || jobsResponse.status === 403) {
        setOpsError('Sign in with a client workspace account to view build jobs.');
      } else {
        setOpsError('Job history is unavailable.');
      }
    } catch {
      setServiceStatus('degraded');
      setOpsError('Hermes operations API is unavailable.');
    }
  }, []);

  useEffect(() => { void refreshOperations(); }, [refreshOperations]);

  const addAsset = () => {
    if (!newAssetUrl || !newAssetId) return;
    const newAsset: AssetRef = {
      id: newAssetId,
      url: newAssetUrl,
      role: newAssetRole,
      kind: newAssetRole === 'LOCKED' ? 'brand-asset' : 'photo'
    };
    setAssets([...assets, newAsset]);
    setNewAssetUrl('');
    setNewAssetId('');
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const generateImage = async (e: FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;
    
    setGenerationLoading(true);
    setGenerationError('');
    setResult(null);
    
    try {
      const response = await fetch(apiUrl('/v1/hermes/image'), {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instruction: instruction.trim(),
          references: assets,
          aspectRatio
        })
      });

      if (!response.ok) {
        const err = await response.json();
        setGenerationError(err.message || 'Generation failed');
        return;
      }

      const data = await response.json();
      setResult(data);
      setImageTab('results');
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setGenerationLoading(false);
    }
  };

  const submit = async (e: FormEvent) => { 
    e.preventDefault(); 
    if (!input.trim()) return; 
    const value=input; 
    setInput(''); 
    await sendMessage(value, route.toLowerCase()); 
  };

  return <main className="min-h-screen bg-[#02070d] text-[#d9f4ff] p-3 font-sans">
    <header className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr] border border-cyan-500/40 bg-[#04111c] p-4 shadow-[0_0_35px_rgba(0,180,255,.12)]">
      <div><h1 className="text-3xl font-black tracking-[.08em] text-white">W² WISE² HERMES</h1><p className="text-xs tracking-[.22em] text-cyan-300">YOUR AI OPERATOR · SECOND BRAIN · EXECUTION ENGINE</p></div>
      <div className="flex items-center gap-2">{['AUTO','LOCAL','CLOUD'].map(x=><button key={x} onClick={()=>setRoute(x)} className={`rounded border px-5 py-2 text-xs font-bold ${route===x?'border-green-400 bg-green-400/15 text-green-300 shadow-[0_0_18px_rgba(34,197,94,.25)]':'border-cyan-800 bg-[#061622] text-cyan-200'}`}>{x}</button>)}</div>
      <div className="grid grid-cols-3 gap-2 text-xs">{['MAC ONLINE','VPS ONLINE','GPU ONLINE'].map(x=><div key={x} className="rounded border border-cyan-800 bg-black/30 p-3 text-center"><span className="text-green-400">●</span> {x}</div>)}</div>
    </header>

    <section className="mt-3 grid gap-3 xl:grid-cols-[180px_minmax(0,1.4fr)_minmax(320px,.9fr)_270px]">
      <aside aria-label="WISE² dashboard navigation" className="rounded border border-cyan-800 bg-[#04101a] p-2">{nav.map((x,i)=><div key={x} className={`mb-1 rounded px-3 py-2 text-xs ${i===0?'bg-cyan-500/15 text-white ring-1 ring-cyan-400':'text-slate-300'}`}>{x}</div>)}</aside>
      
      <section className="rounded border border-cyan-700 bg-[#04101a] p-4">
        <div className="mb-4 flex items-center justify-between border-b border-cyan-900 pb-3"><div><span className="text-2xl font-black text-white">HERMES</span><span className="ml-3 text-[10px] tracking-widest text-cyan-400">AI OPERATOR · SECOND BRAIN</span></div><span aria-live="polite" className={`text-xs ${serviceStatus === 'operational' ? 'text-green-400' : serviceStatus === 'checking' ? 'text-cyan-300' : 'text-amber-300'}`}>● {serviceStatus.toUpperCase()}</span></div>
        <div className="h-[500px] space-y-3 overflow-y-auto pr-1">
          {messages.length===0 && <><div className="rounded border border-cyan-900 bg-[#071a29] p-4"><b>You</b><p className="mt-2 text-sm text-slate-300">Deploy the latest WISE² build, run tests, and give me a full status.</p></div><div className="rounded border border-cyan-900 bg-black/30 p-4"><b>Hermes</b><p className="mt-2 text-sm text-cyan-100">Ready. I can inspect, reason, and execute through the connected WISE² operating layer.</p></div></>}
          {messages.map(m=><div key={m.id} className={`rounded border p-4 ${m.role==='user'?'border-cyan-800 bg-[#071a29]':'border-green-900/70 bg-black/30'}`}><b>{m.role==='user'?'You':'Hermes'}</b><p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{m.content}</p></div>)}
          {isLoading && <div className="text-sm text-green-400">Hermes is working…</div>}{error && <div className="text-sm text-red-400">{error}</div>}
        </div>
        <div className="mt-4 rounded border border-cyan-900 bg-black/40 p-3 font-mono text-xs text-cyan-300"><div>$ route {route.toLowerCase()}</div><div>$ model {model || 'auto'} · provider {provider || 'local-first'}</div><div className="text-green-400">✓ Command layer ready</div></div>
      </section>

      <section className="rounded border border-cyan-700 bg-[#04101a] p-4 min-h-[650px] flex flex-col">
        <div className="flex gap-2 mb-3 border-b border-cyan-900 pb-3">
          <button onClick={() => setImageTab('form')} className={`px-3 py-1 text-xs font-bold rounded ${imageTab === 'form' ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300' : 'border-cyan-800 text-slate-400'} border`}>
            GENERATE
          </button>
          <button onClick={() => setImageTab('results')} className={`px-3 py-1 text-xs font-bold rounded ${imageTab === 'results' ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300' : 'border-cyan-800 text-slate-400'} border`} disabled={!result}>
            RESULTS
          </button>
        </div>

        {imageTab === 'form' && (
          <form onSubmit={generateImage} className="flex flex-col gap-3 flex-1">
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-2">INSTRUCTION</label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Generate a product photo with enhanced lighting..."
                className="w-full h-24 rounded border border-cyan-800 bg-[#02070d] p-3 text-sm outline-none focus:border-cyan-400 text-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-2">ASPECT RATIO</label>
              <div className="flex gap-2">
                {(['1:1', '3:2', '16:9'] as const).map(ratio => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-2 text-xs rounded border ${aspectRatio === ratio ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300' : 'border-cyan-800 bg-black/30 text-slate-300'}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-cyan-900 pt-3">
              <label className="text-xs font-bold text-cyan-300 block mb-2">ASSET REFERENCES</label>
              
              <div className="space-y-2 mb-3">
                {assets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-2 p-2 rounded border border-cyan-900 bg-black/30">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${asset.role === 'LOCKED' ? 'bg-red-500/20 text-red-300' : asset.role === 'EDITABLE' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                      {asset.role}
                    </span>
                    <span className="text-xs text-slate-400 flex-1 truncate">{asset.id}</span>
                    <button
                      type="button"
                      onClick={() => removeAsset(asset.id)}
                      className="text-xs text-red-400 hover:text-red-300 px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-2">
                <select value={newAssetRole} onChange={(e) => setNewAssetRole(e.target.value as AssetRole)} className="px-2 py-1 text-xs rounded border border-cyan-800 bg-[#02070d] text-slate-300">
                  <option value="LOCKED">🔒 LOCKED</option>
                  <option value="EDITABLE">✏️ EDITABLE</option>
                  <option value="NEW">✨ NEW</option>
                </select>
                <input
                  type="text"
                  placeholder="Asset ID"
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs rounded border border-cyan-800 bg-[#02070d] text-slate-300 outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  placeholder="Asset URL (optional)"
                  value={newAssetUrl}
                  onChange={(e) => setNewAssetUrl(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs rounded border border-cyan-800 bg-[#02070d] text-slate-300 outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={addAsset}
                  className="px-3 py-1 text-xs bg-cyan-500/20 border border-cyan-600 text-cyan-300 rounded hover:bg-cyan-500/30"
                >
                  + ADD
                </button>
              </div>
            </div>

            {generationError && <div className="text-xs text-red-400 p-2 rounded border border-red-900 bg-red-950/30">{generationError}</div>}

            <button
              type="submit"
              disabled={generationLoading || !instruction.trim()}
              className="mt-auto bg-cyan-500 text-black font-bold py-2 rounded hover:bg-cyan-400 disabled:opacity-50 text-xs"
            >
              {generationLoading ? 'GENERATING…' : 'GENERATE IMAGE'}
            </button>
          </form>
        )}

        {imageTab === 'results' && result && (
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex-1 rounded border border-cyan-800 bg-black/30 overflow-hidden flex items-center justify-center">
              <img src={result.imageUrl} alt="Generated" className="max-w-full max-h-full" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-cyan-400">Job ID:</span><span className="text-slate-300">{result.jobId}</span></div>
              <div className="flex justify-between"><span className="text-cyan-400">Provider:</span><span className="text-slate-300">{result.provider}</span></div>
              <div className="flex justify-between"><span className="text-cyan-400">Preservation:</span><span className={result.preservationGuaranteed ? 'text-green-400' : 'text-amber-300'}>{result.preservationGuaranteed ? '✓ Guaranteed' : '⚠ Not guaranteed'}</span></div>
              {result.preservedReferenceIds.length > 0 && (
                <div><span className="text-cyan-400">Preserved Assets:</span><div className="text-slate-300 mt-1 text-xs">{result.preservedReferenceIds.join(', ')}</div></div>
              )}
            </div>
            <button onClick={() => setImageTab('form')} className="px-3 py-2 text-xs bg-cyan-500 text-black rounded hover:bg-cyan-400 font-bold">
              GENERATE NEW
            </button>
          </div>
        )}

        {imageTab === 'results' && !result && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No results yet. Generate an image to see results.
          </div>
        )}
      </section>

      <aside className="rounded border border-cyan-800 bg-[#04101a] p-3"><div className="mb-3 flex items-center justify-between"><b>LIVE CONTEXT</b><button type="button" onClick={() => void refreshOperations()} className="text-xs text-cyan-400 hover:text-cyan-200">↻ Sync</button></div>{context.map(([a,b])=><div key={a} className="mb-2 rounded border border-cyan-900 bg-black/30 p-3"><div className="text-[10px] text-slate-500">{a}</div><div className={`text-sm ${b.includes('critical')?'text-green-400':'text-cyan-100'}`}>{b}</div></div>)}<div className="mt-4 border-t border-cyan-900 pt-3"><div className="flex items-center justify-between"><b className="text-xs">RECENT JOBS</b><span className="text-[10px] text-slate-500">{jobs.length}</span></div>{jobs.length === 0 && <p className="mt-2 text-xs text-slate-500">No build jobs returned yet.</p>}{jobs.slice(0, 4).map(job => <div key={job.id} className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-400"><span className="truncate"><span className="text-cyan-400">●</span> {job.type}</span><span className="shrink-0 text-cyan-200">{job.status}</span></div>)}{opsError && <p className="mt-3 text-xs text-amber-300">{opsError}</p>}</div></aside>
    </section>

    <section className="mt-3 rounded border border-cyan-800 bg-[#04101a] p-3"><div className="mb-3 text-xs font-bold">WISE² AGENTS</div><div className="flex flex-wrap gap-2">{agents.map((a,i)=><button key={a} className={`rounded border px-4 py-2 text-xs ${i===0?'border-green-400 bg-green-400/10':'border-cyan-900 bg-black/30'}`}>{a} <span className="text-green-400">●</span></button>)}</div>
      <form onSubmit={submit} className="mt-3 flex gap-2"><button type="button" className="rounded border border-cyan-800 px-4">＋</button><button type="button" className="rounded border border-cyan-800 px-4">🎤</button><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Hermes anything..." className="min-w-0 flex-1 rounded border border-cyan-800 bg-[#02070d] px-4 py-3 text-sm outline-none focus:border-cyan-400"/><div className="rounded border border-cyan-800 px-4 py-3 text-xs">Route: <b>{route}</b></div><button disabled={isLoading} className="rounded bg-cyan-500 px-8 font-bold text-black hover:bg-cyan-300 disabled:opacity-50">Send</button></form>
    </section>
  </main>;
}
