'use client';

export function BackgroundGrid() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(0, 217, 255, .05) 25%, rgba(0, 217, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, .05) 75%, rgba(0, 217, 255, .05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 217, 255, .05) 25%, rgba(0, 217, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, .05) 75%, rgba(0, 217, 255, .05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px',
          animation: 'drift 20s linear infinite',
        }}
      />
      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}
