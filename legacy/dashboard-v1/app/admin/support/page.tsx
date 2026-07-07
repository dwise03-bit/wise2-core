import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import SupportDashboard from '@/components/SupportDashboard';

export default function SupportPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="heading-silver text-3xl">Support & Customer Service</h1>
          <p className="text-gray-400 text-sm mt-1">Manage tickets, conversations, and AI analytics</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <SupportDashboard />
      </main>
    </div>
  );
}
