'use client';

import { useEffect, useState } from 'react';

type WiseUser = {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string;
  lastName?: string;
};

function readWiseUserCookie(): WiseUser | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)wise2_user=([^;]+)/);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as WiseUser;
  } catch {
    return null;
  }
}

export function LoginButton() {
  const [user, setUser] = useState<WiseUser | null>(null);

  useEffect(() => {
    setUser(readWiseUserCookie());
  }, []);

  if (user) {
    const displayName = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-wise-mute">
          <p className="font-semibold text-white">{displayName}</p>
          <p className="text-xs">{user.email}</p>
        </div>
        <a
          href="/wise-hvac-demo/api/auth/logout"
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.18em] border border-white/15 bg-white/5 text-white hover:border-wise-orange/35 hover:bg-wise-orange/10 transition"
        >
          Sign Out
        </a>
      </div>
    );
  }

  return (
    <a
      href="/wise-hvac-demo/api/auth/google/authorize"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-wise-blue/35 bg-wise-blue px-6 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-neon transition hover:-translate-y-0.5"
    >
      Sign In with Google
    </a>
  );
}
