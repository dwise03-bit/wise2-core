'use client';

import { useState } from 'react';
import { ActionReviewDialog } from './ActionReviewDialog';
import { CommandHeader } from './CommandHeader';
import { DispatchProvider } from './DispatchProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { IntelligencePanel } from './IntelligencePanel';
import { PriorityQueue } from './PriorityQueue';

export function CommandWorkspace() {
  return (
    <DispatchProvider>
      <ErrorBoundary>
        <Workspace />
      </ErrorBoundary>
    </DispatchProvider>
  );
}

function Workspace() {
  const [mobileDetail, setMobileDetail] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CommandHeader />
      <div className="flex min-h-0 flex-1">
        <div className={mobileDetail ? 'hidden lg:flex lg:w-[28rem] lg:flex-col' : 'flex min-h-0 w-full flex-col lg:w-[28rem]'}>
          <PriorityQueue onOpenDetail={() => setMobileDetail(true)} />
        </div>
        <div className={mobileDetail ? 'flex min-h-0 w-full flex-1 flex-col' : 'hidden min-h-0 flex-1 lg:flex'}>
          <IntelligencePanel onBack={() => setMobileDetail(false)} />
        </div>
      </div>
      <ActionReviewDialog />
    </div>
  );
}
