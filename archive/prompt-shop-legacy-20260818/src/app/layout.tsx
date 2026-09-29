import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ForemanAssistant } from '@/components/ForemanAssistant';

export const metadata: Metadata = {
  title: 'WISE TOUCH // PROMPT SHOP™',
  description: 'AI-native prompt builder with construction metaphors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ForemanAssistant />
      </body>
    </html>
  );
}
