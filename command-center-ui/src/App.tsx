import { useEffect, useMemo, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { CommandGraph } from './graph/CommandGraph';
import { Inspector } from './inspector/Inspector';
import { Timeline } from './timeline/Timeline';
import { VoiceControl } from './features/voice/VoiceControl';
import { CameraPanel } from './features/camera/CameraPanel';
import { useGraphStore } from './state/store';
import { SimulatedEventSource } from './events/simulated';
import { WebSocketEventSource, HERMES_WSS } from './events/websocket';
import type { EventSource } from './events/adapter';
import './App.css';

type SourceKind = 'simulated' | 'hermes';

function pickSourceKind(): SourceKind {
  if (typeof window === 'undefined') return 'simulated';
  const query = new URLSearchParams(window.location.search);
  return query.get('source') === 'hermes' ? 'hermes' : 'simulated';
}

function buildSource(kind: SourceKind): EventSource {
  if (kind === 'hermes') return new WebSocketEventSource(HERMES_WSS);
  return new SimulatedEventSource();
}

export function App() {
  const ingest = useGraphStore((s) => s.ingest);
  const mode = useGraphStore((s) => s.mode);
  const followExecution = useGraphStore((s) => s.followExecution);
  const setFollow = useGraphStore((s) => s.setFollow);
  const currentExecution = useGraphStore((s) => s.currentExecution);
  const [sourceKind] = useState<SourceKind>(() => pickSourceKind());
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const sourceLabel = useMemo(() => (sourceKind === 'hermes' ? 'HERMES' : 'SIMULATED'), [sourceKind]);

  useEffect(() => {
    if (mode !== 'live') return;
    const source = buildSource(sourceKind);
    source.connect(ingest);
    return () => source.disconnect();
  }, [ingest, mode, sourceKind]);

  return (
    <ReactFlowProvider>
      <div className="shell">
        <header className="topbar">
          <div className="logo">
            WISE<sup>²</sup>
          </div>
          <div className="topbar-text">
            <div className="topbar-title">AGENT COMMAND GRAPH</div>
            <div className="topbar-sub">
              PRIMARY NODE · SURFACE · SOURCE {sourceLabel}
            </div>
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
            <button
              aria-pressed={voiceOpen}
              onClick={() => setVoiceOpen((v) => !v)}
              title="Voice control"
            >
              VOICE
            </button>
            <button
              aria-pressed={cameraOpen}
              onClick={() => setCameraOpen((v) => !v)}
              title="Camera preview"
            >
              CAMERA
            </button>
          </div>
        </header>
        <main className="stage">
          <CommandGraph />
          <Inspector />
          <VoiceControl open={voiceOpen} onOpenChange={setVoiceOpen} />
          <CameraPanel open={cameraOpen} onOpenChange={setCameraOpen} />
        </main>
        <Timeline />
      </div>
    </ReactFlowProvider>
  );
}
