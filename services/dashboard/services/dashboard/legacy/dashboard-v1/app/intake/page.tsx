import { Metadata } from 'next';
import IntakeForm from '@/components/IntakeForm';

export const metadata: Metadata = {
  title: 'Client Intake Form | WISE²',
  description: 'Tell us about your project so we can build the perfect solution for your business.',
};

export default function IntakePage() {
  return (
    <>
      <IntakeForm />
    </>
  );
}
