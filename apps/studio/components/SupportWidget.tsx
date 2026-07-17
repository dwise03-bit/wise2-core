'use client';

export function SupportWidget() {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.open('https://discord.gg/', '_blank');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        aria-label="Open support chat"
        title="Open support chat"
        className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/30 bg-[radial-gradient(circle_at_top_left,#4fd1ff,#0f6bff_55%,#07111f_100%)] text-2xl text-white shadow-[0_0_35px_rgba(0,153,255,0.35)] backdrop-blur-xl transition-transform hover:scale-105"
        onClick={handleClick}
      >
        💬
      </button>
    </div>
  );
}
