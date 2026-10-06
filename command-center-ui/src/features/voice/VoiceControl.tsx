import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { parseVoiceCommand, type VoiceAction } from './commands';
import { useGraphStore } from '../../state/store';
import './voice.css';

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

/**
 * Topbar-adjacent voice panel. Browser must support SpeechRecognition and
 * grant microphone permission. All processing is in-browser; no audio leaves
 * the page.
 */
export function VoiceControl({ open, onOpenChange }: Props) {
  const rf = useReactFlow();
  const selectNode = useGraphStore((s) => s.selectNode);
  const setFollow = useGraphStore((s) => s.setFollow);
  const setMode = useGraphStore((s) => s.setMode);
  const setPlaying = useGraphStore((s) => s.setReplayPlaying);
  const currentExecutionId = useGraphStore((s) => s.currentExecution?.id ?? null);
  const mode = useGraphStore((s) => s.mode);

  const dispatchAction = useCallback(
    (action: VoiceAction) => {
      switch (action.type) {
        case 'FIT':
          rf.fitView({ padding: 0.1, duration: 400 });
          return;
        case 'ZOOM_IN':
          rf.zoomIn({ duration: 300 });
          return;
        case 'ZOOM_OUT':
          rf.zoomOut({ duration: 300 });
          return;
        case 'SELECT':
          selectNode(action.nodeId);
          return;
        case 'CLEAR_SELECTION':
          selectNode(null);
          return;
        case 'FOLLOW':
          if (currentExecutionId) setFollow(currentExecutionId);
          return;
        case 'EXIT_FOLLOW':
          setFollow(null);
          return;
        case 'REPLAY_TOGGLE':
          setMode(mode === 'replay' ? 'live' : 'replay');
          return;
        case 'REPLAY_PLAY':
          setPlaying(true);
          return;
        case 'REPLAY_PAUSE':
          setPlaying(false);
          return;
      }
    },
    [rf, selectNode, setFollow, setMode, setPlaying, currentExecutionId, mode],
  );

  const { supported, listening, transcript, error, start, stop } = useSpeechRecognition({
    onFinalPhrase: (phrase) => {
      const action = parseVoiceCommand(phrase);
      if (action) dispatchAction(action);
    },
  });

  if (!open) return null;

  return (
    <section className="voice-panel" aria-live="polite">
      <header>
        <div className="voice-title">VOICE CONTROL</div>
        <button className="voice-close" aria-label="Close voice panel" onClick={() => onOpenChange(false)}>
          ✕
        </button>
      </header>
      {!supported ? (
        <p className="voice-muted">
          Not supported in this browser. Use Chrome or Edge for Web Speech API; Firefox is in progress.
        </p>
      ) : (
        <>
          <div className="voice-row">
            <button aria-pressed={listening} onClick={listening ? stop : start}>
              {listening ? 'STOP LISTENING' : 'START LISTENING'}
            </button>
            <span className={`voice-dot ${listening ? 'live' : ''}`} aria-hidden />
          </div>
          <div className="voice-transcript" aria-label="Live transcript">
            {transcript || <span className="voice-muted">Say something — try "fit view" or "select hermes".</span>}
          </div>
          {error && <p className="voice-error">Error: {error}</p>}
          <details>
            <summary>Commands</summary>
            <ul>
              <li>fit view · zoom in · zoom out</li>
              <li>select &lt;hermes | planner | claude | qa | deploy | github | approval&gt;</li>
              <li>clear selection</li>
              <li>follow execution · exit follow</li>
              <li>replay · play · pause</li>
            </ul>
          </details>
        </>
      )}
    </section>
  );
}
