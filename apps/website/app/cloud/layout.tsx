import type { Metadata } from 'next';
import { CloudShell } from '@/components/cloud/CloudShell';

export const metadata: Metadata = {
  title: {
    default: 'WISE² Cloud',
    template: '%s | WISE² Cloud',
  },
  description:
    'WISE² Cloud managed hosting — SSL, email, backups, and automated provisioning. HOST. AUTOMATE. PROFIT.',
  metadataBase: new URL('https://cloud.wise2.net'),
  openGraph: {
    title: 'WISE² Cloud',
    description: 'More than hosting. A business platform.',
    url: 'https://cloud.wise2.net',
    siteName: 'WISE² Cloud',
    type: 'website',
  },
};

export default function CloudLayout({ children }: { children: React.ReactNode }) {
  return <CloudShell>{children}</CloudShell>;
}
