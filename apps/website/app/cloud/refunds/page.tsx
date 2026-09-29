import type { Metadata } from 'next';
import { cloudEyebrow, cloudPanel } from '@/lib/cloud-brand';

export const metadata: Metadata = {
  title: 'Refund Policy',
};

export default function CloudRefundsPage() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-invert mx-auto max-w-3xl">
        <p className={cloudEyebrow}>WISE² Cloud</p>
        <h1 className="mt-4 text-4xl font-black not-prose">Refund Policy</h1>
        <div className={`${cloudPanel} mt-8 p-6 not-prose text-[#B7C0CB]`}>
          <p>
            WISE² Cloud plans are billed monthly through Stripe. You may cancel anytime from the
            billing portal. Refunds are evaluated case-by-case for billing errors or failed
            provisioning. Contact support within 7 days of charge if service was not delivered.
          </p>
          <p className="mt-4">
            Support:{' '}
            <a href="mailto:hello@wise2.net" className="text-[#8EDBFF] hover:text-white">
              hello@wise2.net
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
