import BuildIntakeClient from '@/components/build-intake/BuildIntakeClient';

export const metadata = {
  title: 'WISE² BUILD INTAKE™',
  description: 'Tell us about your project',
};

export default function StartYourBuild() {
  return <BuildIntakeClient />;
}
