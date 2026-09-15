import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WISE COMMAND | AI Operator for Real-World Business',
  description: 'WISE COMMAND connects your people, projects, knowledge, and operations into one AI-native command layer.',
  alternates: { canonical: '/hermes' },
  openGraph: {
    title: 'WISE COMMAND | WISE²',
    description: 'One connected operating layer from intelligence to impact.',
    url: '/hermes',
    type: 'website',
  },
};

export default function HermesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
