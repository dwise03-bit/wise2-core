'use client';

import { OrderProvider } from '@/contexts/OrderContext';
import { OwnerProvider } from '@/contexts/OwnerContext';
import { TourProvider } from '@/contexts/TourContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OrderProvider>
      <OwnerProvider>
        <TourProvider>{children}</TourProvider>
      </OwnerProvider>
    </OrderProvider>
  );
}
