import { WiseShieldMark } from './icons';

export function WisePoweredBadge({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const isLg = size === 'lg';
  return (
    <span className={`inline-flex items-center ${isLg ? 'gap-2.5' : 'gap-1.5'}`}>
      <WiseShieldMark className={isLg ? 'h-7 w-7' : 'h-4 w-4'} />
      <span
        className={`font-bold tracking-tight text-[#F7F7F7] ${isLg ? 'text-2xl' : 'text-sm'}`}
        style={{ fontFamily: 'var(--font-headers)' }}
      >
        WISE<sup className="text-[0.6em]">2</sup>
      </span>
    </span>
  );
}
