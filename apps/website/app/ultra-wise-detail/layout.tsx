import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ultra Wise Detail | Premium Auto Detailing & Restoration',
  description:
    'Ultra Wise Detail provides premium mobile detailing, interior restoration, paint enhancement and vehicle protection services in South Florida. Call Ronald Wise at (917) 749-8960.',
  keywords: [
    'auto detailing',
    'car detailing',
    'premium detailing',
    'vehicle restoration',
    'paint protection',
    'ceramic coating',
    'South Florida detailing',
    'mobile detailing',
  ],
  openGraph: {
    title: 'Ultra Wise Detail | Premium Auto Detailing',
    description:
      'Premium detailing & auto recon services that bring your vehicle back to life.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function UltraWiseDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
