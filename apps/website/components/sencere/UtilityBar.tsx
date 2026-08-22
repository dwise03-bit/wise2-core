import { Crown } from 'lucide-react';
import { company } from '@/lib/sencere/config';
import { WisePoweredBadge } from './WisePoweredBadge';

export function UtilityBar() {
  return (
    <div className="border-b border-[#8C6518]/40 bg-[#080808]">
      <div className="mx-auto flex max-w-[1536px] items-center justify-between px-6 py-2 text-[11px] tracking-[0.15em] sm:px-10">
        <span className="hidden items-center gap-2 font-semibold text-[#D6A331] sm:flex">
          <Crown className="h-3.5 w-3.5" aria-hidden="true" />
          {company.tagline}
        </span>
        <span className="flex items-center gap-1.5 text-[#C8C8C8] sm:ml-auto">
          <span className="hidden text-[#888] sm:inline">POWERED BY</span>
          <WisePoweredBadge size="sm" />
        </span>
      </div>
    </div>
  );
}
