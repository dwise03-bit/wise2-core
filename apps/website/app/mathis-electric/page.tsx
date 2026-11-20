import type { Metadata } from 'next';
import { MathisEntrance } from './MathisEntrance';

export const metadata: Metadata = {
  title: 'Mathis Electric LLC | Built on Service. Powered by Purpose.',
  description: 'Enter the Mathis Electric Living Grid.',
};

export default function MathisElectricPage() {
  return <MathisEntrance />;
}
