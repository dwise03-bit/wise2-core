'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { OWNER_PATHS } from '@/lib/brand-tokens';

type Role = 'guest' | 'owner';

type OwnerContextValue = {
  role: Role;
  isOwner: boolean;
  isNative: boolean;
  setRole: (role: Role) => void;
};

const OwnerContext = createContext<OwnerContextValue | null>(null);

const ROLE_KEY = 'fergie-role';

function readNative() {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function OwnerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRoleState] = useState<Role>('guest');
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const native = readNative();
    setIsNative(native);
    const stored = localStorage.getItem(ROLE_KEY) as Role | null;
    if (stored === 'owner' || stored === 'guest') {
      setRoleState(stored);
    } else if (native || OWNER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      setRoleState('owner');
    }
  }, [pathname]);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    localStorage.setItem(ROLE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({
      role,
      isOwner: role === 'owner',
      isNative,
      setRole,
    }),
    [role, isNative],
  );

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}

export function useOwner() {
  const ctx = useContext(OwnerContext);
  if (!ctx) throw new Error('useOwner must be used within OwnerProvider');
  return ctx;
}
