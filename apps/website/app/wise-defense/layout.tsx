import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WISE Defense - Train. Teach. Protect.',
  description: 'Empower yourself with real training, real education, and real protection. Join the movement with WISE Defense L.L.C.',
  keywords: 'self-defense, training, education, firearm training, protection, community safety',
  openGraph: {
    title: 'WISE Defense - Train. Teach. Protect.',
    description: 'Empowering minds. Protecting lives.',
    type: 'website',
  },
};

export default function WiseDefenseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
