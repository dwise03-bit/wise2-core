import { Crown } from 'lucide-react';

type CloudCrownLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
};

const SIZES = {
  sm: { box: 'h-9 w-9', text: 'text-xs', crown: 14 },
  md: { box: 'h-10 w-10', text: 'text-sm', crown: 16 },
  lg: { box: 'h-14 w-14', text: 'text-lg', crown: 20 },
};

export function CloudCrownLogo({ size = 'md', showWordmark = false }: CloudCrownLogoProps) {
  const dims = SIZES[size];

  return (
    <span className="inline-flex items-center gap-3">
      <span
        className={`relative flex ${dims.box} items-center justify-center border border-[#4DA3FF]/50 bg-gradient-to-br from-[#0D141A] to-[#050607] shadow-[0_0_24px_rgba(77,163,255,0.25)]`}
      >
        <Crown
          size={dims.crown}
          className="absolute -top-1 text-[#4DA3FF]"
          aria-hidden
        />
        <span className={`${dims.text} font-black tracking-tight text-[#DCE7EF]`}>W²</span>
      </span>
      {showWordmark ? (
        <span>
          <span className="block text-sm font-black tracking-[0.2em]">WISE² CLOUD</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8FA0AE]">
            Piff City Infrastructure
          </span>
        </span>
      ) : null}
    </span>
  );
}
