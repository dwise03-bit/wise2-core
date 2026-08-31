'use client';

import { BlakkhailFooter } from './BlakkhailFooter';
import { BlakkhailHeader } from './BlakkhailHeader';
import { BLAKKHAIL_LAYOUT } from './brand-tokens';

interface BlakkhailStoreShellProps {
  children: React.ReactNode;
  contained?: boolean;
}

export function BlakkhailStoreShell({ children, contained = true }: BlakkhailStoreShellProps) {
  return (
    <div className={`${BLAKKHAIL_LAYOUT.page} scroll-smooth`}>
      <BlakkhailHeader />
      <main className={contained ? BLAKKHAIL_LAYOUT.container : undefined}>{children}</main>
      <BlakkhailFooter />
    </div>
  );
}
