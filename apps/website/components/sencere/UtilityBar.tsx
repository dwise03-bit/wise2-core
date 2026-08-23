import { Crown } from 'lucide-react';
import { company } from '@/lib/sencere/config';
import { WisePoweredBadge } from './WisePoweredBadge';

export function UtilityBar() {
  return (
    <div className="border-b border-[#D4842F]/20 bg-[#0f0f0f]">
      <div className="mx-auto flex max-w-[1536px] items-center justify-between px-6 py-2 text-[10px] tracking-[0.12em] sm:px-10">
        <span className="hidden items-center gap-2 font-bold text-[#E8A23A] sm:flex">
          <Crown className="h-3.5 w-3.5" aria-hidden="true" />
          {company.tagline}
        </span>
        <span className="flex items-center gap-1.5 text-[#999] sm:ml-auto">
          <span className="hidden text-[#666] sm:inline">POWERED BY</span>
          <WisePoweredBadge size="sm" />
        </span>
      </div>
    </div>
  );
}
