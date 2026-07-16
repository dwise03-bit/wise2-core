'use client';

import { useState } from 'react';
import { analytics } from '@/lib/analytics';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
    analytics.track('button_click', { button: 'chat_open' });
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#0094FF',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          zIndex: 40,
          fontSize: '24px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 148, 255, 0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Open chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '384px',
            maxWidth: 'calc(100vw - 2rem)',
            background: '#050505',
            border: '1px solid #333333',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '600px',
            zIndex: 40,
          }}
        >
          <div
            style={{
              background: '#0094FF',
              color: 'white',
              padding: '16px',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
            }}
          >
            <h3 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>WISE² Support</h3>
            <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.9 }}>
              Powered by Hermes AI
            </p>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ textAlign: 'center', paddingTop: '32px' }}>
              <p style={{ color: '#999999', fontSize: '14px', margin: 0 }}>
                👋 Hi! How can we help?
              </p>
            </div>
            <p style={{ color: '#999999', fontSize: '12px', margin: 0 }}>
              💬 Start a conversation or escalate to our Discord team
            </p>
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid #333333' }}>
            <button
              onClick={() => {
                analytics.track('button_click', { button: 'chat_escalate' });
                window.open('https://discord.gg/', '_blank');
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0094FF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0080DD')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0094FF')}
            >
              Join Discord Support
            </button>
          </div>
        </div>
      )}
    </>
  );
}
