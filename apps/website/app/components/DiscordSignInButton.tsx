'use client';

import { FormEvent } from 'react';
import { analytics } from '@/lib/analytics';

interface DiscordSignInButtonProps {
  clientId: string;
  redirectUri: string;
}

export default function DiscordSignInButton({ clientId, redirectUri }: DiscordSignInButtonProps) {
  const handleClick = (e: FormEvent) => {
    e.preventDefault();

    analytics.track('discord_signin_click');

    const oauthUrl = new URL('https://discord.com/api/oauth2/authorize');
    oauthUrl.searchParams.set('client_id', clientId);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('redirect_uri', redirectUri);
    oauthUrl.searchParams.set('scope', 'identify email guilds');
    oauthUrl.searchParams.set('prompt', 'consent');

    window.location.href = oauthUrl.toString();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full py-2 border border-wise-subtle hover:border-wise-primary text-wise-primary rounded-md transition-colors hover:bg-wise-surface flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.211.375-.445.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.162-.386-.395-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03a.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892a.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.009c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892a.077.077 0 00-.041.107c.36.699.77 1.364 1.225 1.994a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03a.077.077 0 00.032-.054c.5-4.467-.838-8.343-3.554-11.761a.07.07 0 00-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419c0-1.334.969-2.419 2.157-2.419c1.188 0 2.157 1.085 2.157 2.42c0 1.333-.969 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.334.969-2.419 2.157-2.419c1.188 0 2.157 1.085 2.157 2.42c0 1.333-.969 2.419-2.157 2.419z" />
      </svg>
      Continue with Discord
    </button>
  );
}
