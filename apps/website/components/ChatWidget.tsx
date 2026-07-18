'use client';

import { useRouter } from 'next/navigation';

export default function ChatWidget() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/live-studio?tab=support');
  };

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
        onClick={handleClick}
      >
        💬
      </button>
    </div>
  );
}
