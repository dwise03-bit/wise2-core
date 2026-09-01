'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WiseImpMascot, GLOW_HEX } from './WiseImpMascot';
import { ColorPicker } from './ColorPicker';
import { ChatPanel } from './ChatPanel';
import { IntakeFlow } from './IntakeFlow';
import { useWiseImpStore } from './useWiseImpStore';
import { useImpTour } from './useImpTour';
import { pageGreeting } from './pageContext';

export function WiseImp() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const store = useWiseImpStore(pathname);
  const panelRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  const { state, currentCategory } = store;

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router],
  );

  const scrollToContact = useCallback(() => {
    router.push('/contact');
  }, [router]);

  useEffect(() => {
    if (!state.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        store.close();
        openButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [state.open, store]);

  useEffect(() => {
    if (state.open) {
      panelRef.current?.querySelector<HTMLElement>('input, button, textarea, select')?.focus();
    }
  }, [state.open]);

  // Route-aware greeting, plus the idle page tour. The tour is suppressed
  // whenever the panel is open so the assistant always takes priority.
  const hint = pageGreeting(pathname);
  const tourStop = useImpTour(pathname, state.open);

  return (
    <div
      data-wise-imp
      style={{
        position: 'fixed',
        // While touring the companion drifts to the element it is describing;
        // otherwise it rests in its usual corner.
        ...(tourStop
          ? { top: tourStop.top, left: tourStop.left, bottom: 'auto', right: 'auto' }
          : {
              bottom: 'max(20px, calc(20px + env(safe-area-inset-bottom)))',
              right: 'max(20px, calc(20px + env(safe-area-inset-right)))',
            }),
        transition: 'top 900ms ease, left 900ms ease',
        zIndex: 60,
      }}
    >
      {state.open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Wise Imp, WISE² AI companion"
          style={{
            position: 'absolute',
            bottom: 84,
            right: 0,
            width: 340,
            maxWidth: 'calc(100vw - 32px)',
            height: 480,
            maxHeight: 'calc(100vh - 160px)',
            background: 'linear-gradient(180deg, #0D1117 0%, #12131A 100%)',
            border: '1px solid rgba(57, 255, 20, 0.25)',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header with prominent mascot */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '14px 12px 10px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: `radial-gradient(ellipse at center bottom, ${GLOW_HEX[state.glowColor]}08 0%, transparent 70%)`,
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, position: 'absolute', top: 8, right: 8 }}>
              {!state.intake.active && !state.handoff && (
                <button
                  type="button"
                  onClick={() => store.clearConversation()}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  style={{ background: 'none', border: 'none', color: '#8D98A5', cursor: 'pointer', fontSize: 12, padding: 4 }}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => store.close()}
                aria-label="Close panel"
                style={{ background: 'none', border: 'none', color: '#8D98A5', cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <WiseImpMascot glowColor={state.glowColor} mascotState={state.mascotState} size={240} animated breathing={state.loading} />
            <div style={{ marginTop: 6, textAlign: 'center' }}>
              <div style={{ color: '#E8ECEF', fontWeight: 700, fontSize: 14 }}>Wise Imp</div>
              <div style={{ color: state.loading ? GLOW_HEX[state.glowColor] : '#8D98A5', fontSize: 11, transition: 'color 300ms ease' }}>
                {state.loading ? 'Thinking…' : state.intake.active && currentCategory ? currentCategory.label : 'Your AI guide'}
              </div>
            </div>
          </div>

          {!state.intake.active && !state.handoff && (
            <div style={{ padding: '0 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <ColorPicker value={state.glowColor} onChange={store.setGlowColor} />
            </div>
          )}

          {hint && !state.intake.active && !state.handoff && state.messages.length === 0 && (
            <div style={{ padding: '6px 14px', color: '#0094FF', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {hint}
            </div>
          )}

          <div style={{ flex: 1, minHeight: 0 }}>
            {state.handoff ? (
              <HandoffPanel summary={state.handoff.summary} onDone={() => store.clearHandoff()} />
            ) : state.intake.active ? (
              <IntakeFlow
                intake={state.intake}
                onSetMode={store.setIntakeMode}
                onSetField={store.setIntakeField}
                onAnswer={store.answerIntakeQuestion}
                onBack={store.intakeBack}
                onSetStep={store.setIntakeStep}
                onSubmit={store.submitIntake}
                onClose={() => store.resetIntake()}
              />
            ) : (
              <ChatPanel
                messages={state.messages}
                loading={state.loading}
                aiUnavailable={state.aiUnavailable}
                pendingAction={state.pendingAction}
                glowColor={state.glowColor}
                mascotState={state.mascotState}
                onSend={store.sendMessage}
                onConfirmAction={() => store.confirmPendingAction(handleNavigate, scrollToContact)}
                onDismissAction={store.dismissAction}
                onStartIntake={() => store.startIntake()}
                onOpenContact={scrollToContact}
              />
            )}
          </div>
        </div>
      )}

      {tourStop && !state.open && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 72,
            // The container is only as wide as the 64px launcher, so an
            // absolutely positioned child shrink-to-fits into 64px and wraps
            // one word per line. width: max-content lets the bubble size to
            // its text and overflow the container, with maxWidth capping it.
            ...(tourStop.bubbleSide === 'right' ? { right: 0 } : { left: 0 }),
            width: 'max-content',
            maxWidth: 220,
            padding: '6px 10px',
            fontSize: 12,
            lineHeight: 1.35,
            color: '#E8ECEF',
            background: 'rgba(13, 17, 23, 0.92)',
            border: '1px solid rgba(57, 255, 20, 0.28)',
            borderRadius: 10,
            whiteSpace: 'normal',
            pointerEvents: 'none',
          }}
        >
          {tourStop.reaction}
        </div>
      )}

      <button
        ref={openButtonRef}
        type="button"
        onClick={() => (state.open ? store.close() : store.open())}
        aria-expanded={state.open}
        aria-label={state.open ? 'Close Wise Imp' : 'Open Wise Imp, WISE² AI companion'}
        className="wise-imp-launcher"
        style={{
          width: 'auto',
          minWidth: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(13, 17, 23, 0.85)',
          border: `1px solid ${GLOW_HEX[state.glowColor]}59`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 10px 4px 4px',
          gap: 8,
          transition: 'border-color 400ms ease, box-shadow 400ms ease',
          '--wimp-color-33': `${GLOW_HEX[state.glowColor]}33`,
          '--wimp-color-55': `${GLOW_HEX[state.glowColor]}55`,
          '--wimp-color-11': `${GLOW_HEX[state.glowColor]}11`,
          '--wimp-color-22': `${GLOW_HEX[state.glowColor]}22`,
        } as React.CSSProperties}
      >
        <WiseImpMascot
          glowColor={state.glowColor}
          mascotState={state.open ? 'idle' : tourStop?.state ?? state.mascotState}
          size={52}
          breathing={!state.open}
        />
        {!state.open && <span style={{ color: '#D6A331', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em' }}>ASK IMP</span>}
      </button>
    </div>
  );
}

function HandoffPanel({ summary, onDone }: { summary: string; onDone: () => void }) {
  return (
    <div style={{ padding: 16 }}>
      <p style={{ color: '#E8ECEF', fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>Connecting you with the team</p>
      <p style={{ color: '#8D98A5', fontSize: 13, margin: '0 0 12px' }}>
        I&apos;ve sent this to the WISE² team on Discord: <em>&ldquo;{summary}&rdquo;</em>. Someone will follow up. You can keep
        chatting with me in the meantime.
      </p>
      <button
        type="button"
        onClick={onDone}
        style={{ background: '#39FF14', color: '#050505', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
      >
        Got it
      </button>
    </div>
  );
}
