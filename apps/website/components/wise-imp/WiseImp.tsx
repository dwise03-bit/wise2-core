'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WiseImpMascot } from './WiseImpMascot';
import { ColorPicker } from './ColorPicker';
import { ChatPanel } from './ChatPanel';
import { IntakeFlow } from './IntakeFlow';
import { useWiseImpStore } from './useWiseImpStore';

const PAGE_HINTS: Record<string, string> = {
  '/consulting': "You're looking at consulting services — want the short version of which one fits?",
  '/pricing': 'Happy to help you figure out which plan makes sense.',
  '/audit': 'The AI Business Audit is a good first step if you\'re not sure where to start.',
};

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

  const hint = PAGE_HINTS[pathname];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'max(20px, calc(20px + env(safe-area-inset-bottom)))',
        right: 'max(20px, calc(20px + env(safe-area-inset-right)))',
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <WiseImpMascot glowColor={state.glowColor} mascotState={state.mascotState} size={36} />
              <div>
                <div style={{ color: '#E8ECEF', fontWeight: 700, fontSize: 13 }}>Wise Imp</div>
                {state.intake.active && currentCategory && (
                  <div style={{ color: '#8D98A5', fontSize: 10 }}>{currentCategory.label}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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

      <button
        ref={openButtonRef}
        type="button"
        onClick={() => (state.open ? store.close() : store.open())}
        aria-expanded={state.open}
        aria-label={state.open ? 'Close Wise Imp' : 'Open Wise Imp, WISE² AI companion'}
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(13, 17, 23, 0.85)',
          border: '1px solid rgba(57, 255, 20, 0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
        }}
      >
        <WiseImpMascot glowColor={state.glowColor} mascotState={state.open ? 'idle' : state.mascotState} size={52} />
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
