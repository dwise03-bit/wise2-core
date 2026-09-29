'use client';

import { describeAction, type WiseImpAction } from '@/lib/wise-imp/actions';

interface ActionConfirmProps {
  action: WiseImpAction;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function ActionConfirm({ action, onConfirm, onDismiss }: ActionConfirmProps) {
  return (
    <div
      role="group"
      aria-label="Suggested action"
      style={{
        background: 'rgba(57, 255, 20, 0.08)',
        border: '1px solid rgba(57, 255, 20, 0.35)',
        borderRadius: 10,
        padding: '10px 12px',
        margin: '4px 0',
        fontSize: 13,
      }}
    >
      <p style={{ margin: 0, marginBottom: 8, color: '#E8ECEF' }}>{describeAction(action)}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            background: '#39FF14',
            color: '#050505',
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Yes, do it
        </button>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'transparent',
            color: '#8D98A5',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
