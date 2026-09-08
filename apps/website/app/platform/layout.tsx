import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform | WISE²',
  description: 'The operating layer for field data, business records, AI workflows, and delivery systems.',
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
