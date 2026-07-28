/**
 * Workspace Dashboard Page
 * Redirects to Command Center
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/src/context/WorkspaceContext';

export default function WorkspaceDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      window.location.pathname.replace('/dashboard', '/command-center')
    );
  }, [router]);

  return null;
}
