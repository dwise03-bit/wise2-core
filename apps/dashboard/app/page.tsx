'use client';


import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardHome } from '@wise2/dashboard-shell';

export default function Home() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <DashboardHome
      showAuthStatus
      userEmail={user?.email ?? null}
      onLogout={handleLogout}
      isLoggingOut={isLoading}
    />
  );
}
