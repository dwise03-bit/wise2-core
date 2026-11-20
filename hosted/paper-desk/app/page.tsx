'use client';

import ChartWorkspace from './ChartWorkspace';

export default function Page() {
  return (
    <div style={{ height: '100vh' }}>
      <ChartWorkspace
        accountLabel="Paper desk"
        onOpenMenu={() => undefined}
        onOpenPlot={() => undefined}
      />
    </div>
  );
}
