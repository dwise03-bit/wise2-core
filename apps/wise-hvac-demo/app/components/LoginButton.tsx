'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-wise-mute">
          <p className="font-semibold text-white">{session.user?.name}</p>
          <p className="text-xs">{session.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ redirect: false })}
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.18em] border border-white/15 bg-white/5 text-white hover:border-wise-orange/35 hover:bg-wise-orange/10 transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-wise-blue/35 bg-wise-blue px-6 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-neon transition hover:-translate-y-0.5"
    >
      Sign In with Google
    </button>
  );
}
