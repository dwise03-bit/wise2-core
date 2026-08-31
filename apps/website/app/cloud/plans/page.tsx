import { Suspense } from 'react';
import CloudPlansContent from './CloudPlansContent';

export default function CloudPlansRoute() {
  return (
    <Suspense
      fallback={
        <section className="px-4 py-16 text-[#B7C0CB]">
          Loading WISE² Cloud plans…
        </section>
      }
    >
      <CloudPlansContent />
    </Suspense>
  );
}
