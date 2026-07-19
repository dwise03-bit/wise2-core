'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ChatWidget() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}>
      {/* Chat Button */}
      <button
        className="group relative transition-all duration-300"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isHovered ? '#22C55E' : '#22C55E',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: isHovered
            ? '0 8px 24px rgba(34, 197, 94, 0.6)'
            : '0 4px 12px rgba(34, 197, 94, 0.4)',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        💬
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className="absolute bottom-20 right-0 w-80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
          style={{
            background: 'linear-gradient(135deg, #0D1117 0%, #181818 100%)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div className="bg-wise-accent-green/10 border-b border-wise-accent-green/30 p-4 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span>💬</span> WISE² Support
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-wise-text-muted hover:text-wise-accent-green transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-64 overflow-y-auto p-4 space-y-4 bg-wise-bg-secondary/50">
            <div className="flex justify-center text-wise-text-muted text-sm">
              <p>Loading chat...</p>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-wise-accent-green/30 p-3 bg-wise-bg-secondary/50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-wise-bg-primary border border-wise-accent-green-border text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green text-sm"
              />
              <button className="px-3 py-2 bg-wise-accent-green text-wise-bg-primary rounded-lg hover:brightness-110 transition-all text-sm font-bold">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
