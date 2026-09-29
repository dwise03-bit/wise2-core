import type { Metadata } from 'next';
import { cloudEyebrow, cloudPanel } from '@/lib/cloud-brand';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
};

export default function CloudAcceptableUsePage() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-invert mx-auto max-w-3xl">
        <p className={cloudEyebrow}>WISE² Cloud</p>
        <h1 className="mt-4 text-4xl font-black not-prose">Acceptable Use Policy</h1>
        <div className={`${cloudPanel} mt-8 p-6 not-prose text-[#B7C0CB]`}>
          <p>
            WISE² Cloud hosting may not be used for illegal activity, malware distribution, spam,
            phishing, resource abuse, or content that violates applicable law. We may suspend
            services that threaten platform stability or other customers.
          </p>
          <p className="mt-4">
            Questions:{' '}
            <a href="mailto:hello@wise2.net" className="text-[#8EDBFF] hover:text-white">
              hello@wise2.net
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
