import { useEffect } from 'react';
import { CommandGraph } from './graph/CommandGraph';
import { Inspector } from './inspector/Inspector';
import { Timeline } from './timeline/Timeline';
import { useGraphStore } from './state/store';
import { SimulatedEventSource } from './events/simulated';
import type { EventSource } from './events/adapter';
import './App.css';

function makeSource(): EventSource {
  // Real gateway not yet connectable (see hermes/HERMES-PRODUCTION-CONNECTION-PENDING.md).
  // When it is, swap this for `new WebSocketEventSource(url)`.
  return new SimulatedEventSource();
}

export function App() {
  const ingest = useGraphStore((s) => s.ingest);
  const mode = useGraphStore((s) => s.mode);
  const followExecution = useGraphStore((s) => s.followExecution);
  const setFollow = useGraphStore((s) => s.setFollow);
  const currentExecution = useGraphStore((s) => s.currentExecution);

  useEffect(() => {
    if (mode !== 'live') return;
    const source = makeSource();
    source.connect(ingest);
    return () => source.disconnect();
  }, [ingest, mode]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="logo">
          WISE<sup>²</sup>
        </div>
        <div className="topbar-text">
          <div className="topbar-title">AGENT COMMAND GRAPH</div>
          <div className="topbar-sub">PRIMARY NODE · SURFACE</div>
        </div>
        <div className="topbar-exec">
          {currentExecution ? (
            <>
              <span className="pill">EXEC {currentExecution.id.slice(-6)}</span>
              <button
                aria-pressed={Boolean(followExecution)}
                onClick={() => setFollow(followExecution ? null : currentExecution.id)}
              >
                {followExecution ? 'EXIT FOLLOW' : 'FOLLOW EXECUTION'}
              </button>
            </>
          ) : (
            <span className="pill pill-muted">NO ACTIVE EXECUTION</span>
          )}
        </div>
      </header>
      <main className="stage">
        <CommandGraph />
        <Inspector />
      </main>
      <Timeline />
    </div>
  );
}
