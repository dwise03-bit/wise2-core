import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knight Wing Dashboard | WISE² DEFENSE',
  description: 'Real-time crime radar, SDR monitoring, and watch zones for Greensboro, NC. Train. Teach. Protect.',
  robots: 'noindex, nofollow', // Private dashboard
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
