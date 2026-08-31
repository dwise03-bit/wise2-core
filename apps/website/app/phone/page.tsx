import type { Metadata } from 'next';
import { PhoneConsole } from './PhoneConsole';

export const metadata: Metadata = {
  title: 'AI Phone | WISE²',
  description: 'WISE² AI Phone answers inbound calls, captures leads, and writes the conversation back into the operating system.',
  alternates: {
    canonical: 'https://wise2.net/phone',
  },
};

export default function PhonePage() {
  return <PhoneConsole />;
}
