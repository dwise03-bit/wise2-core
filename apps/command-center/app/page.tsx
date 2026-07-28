import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard (let middleware handle auth)
  redirect('/dashboard');
}
