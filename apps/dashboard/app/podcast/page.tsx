'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function PodcastPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/podcast/dashboard');
      } else {
        router.push('/podcast/auth/login');
      }
    }
  }, [user, isLoading, router]);

  return null;
}
