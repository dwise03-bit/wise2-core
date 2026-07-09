import BuildIntakeClient from '@/components/build-intake/BuildIntakeClient';

export const metadata = {
  title: 'WISE² BUILD INTAKE™ — Start Your Build',
  description: 'Tell us about your project and get a customized build strategy within 24 hours.',
  openGraph: {
    title: 'WISE² BUILD INTAKE™',
    description: 'Your Idea. Our System. Infinite Creation.',
    images: [{
      url: '/og-build-intake.png',
      width: 1200,
      height: 630,
    }]
  }
};

export default function BuildIntakePage() {
  return <BuildIntakeClient />;
}
