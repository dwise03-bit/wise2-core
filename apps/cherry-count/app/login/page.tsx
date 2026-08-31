import { Suspense } from 'react';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cherry-black" />}>
      <LoginForm />
    </Suspense>
  );
}
