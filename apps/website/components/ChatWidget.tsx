'use client';

export default function ChatWidget() {
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 40 }}>
      <button
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#0094FF',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0, 148, 255, 0.4)',
        }}
        onClick={() => window.open('https://discord.gg/', '_blank')}
      >
        💬
      </button>
    </div>
  );
}
