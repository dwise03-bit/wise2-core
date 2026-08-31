import { hvacAppUrl } from './hvac-public.ts';
import {
  markNativeSessionReady,
  saveNativeAuth,
  type NativeFieldAuth,
} from './native-session.ts';

const AUTHORIZE_PATH = '/wise-hvac-demo/api/auth/google/authorize';
const AUTH_EVENT = 'wise2-fieldtech-auth';

type CapacitorBridge = {
  isNativePlatform?: () => boolean;
  Plugins?: {
    Browser?: {
      open: (options: { url: string; presentationStyle?: string }) => Promise<void>;
      close?: () => Promise<void>;
    };
    App?: {
      addListener: (
        event: 'appUrlOpen',
        handler: (event: { url: string }) => void,
      ) => Promise<{ remove: () => void }> | { remove: () => void };
      getLaunchUrl?: () => Promise<{ url?: string } | undefined>;
    };
  };
};

function capacitor(): CapacitorBridge | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { Capacitor?: CapacitorBridge }).Capacitor;
}

export function isFieldTechNative(): boolean {
  return Boolean(capacitor()?.isNativePlatform?.());
}

export function ticketFromAppUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const ticket = parsed.searchParams.get('ticket');
    if (ticket) return ticket;
  } catch {
    // Custom schemes can fail URL parsing in older engines.
  }
  const match = url.match(/[?&]ticket=([^&]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function authorizeUrl(native = isFieldTechNative()): string {
  if (native) return hvacAppUrl('/api/auth/google/authorize?native=1');
  return `${AUTHORIZE_PATH}`;
}

export async function startGoogleSignIn(): Promise<void> {
  const native = isFieldTechNative();
  const dest = authorizeUrl(native);
  const Browser = capacitor()?.Plugins?.Browser;
  if (native && Browser?.open) {
    await Browser.open({ url: dest, presentationStyle: 'popover' });
    return;
  }
  window.location.href = dest;
}

function isNativeAuth(value: unknown): value is NativeFieldAuth {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  const user = record.user as Record<string, unknown> | undefined;
  return typeof record.accessToken === 'string' && Boolean(user?.id && user?.email);
}

export async function redeemHandoffTicket(ticket: string): Promise<boolean> {
  const url = hvacAppUrl(`/api/auth/handoff?ticket=${encodeURIComponent(ticket)}`);
  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return false;

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as unknown;
    if (isNativeAuth(payload)) saveNativeAuth(payload);
    else markNativeSessionReady();
  } else {
    markNativeSessionReady();
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
  return true;
}

export function listenForOAuthHandoff(onSignedIn?: () => void): () => void {
  const App = capacitor()?.Plugins?.App;
  const Browser = capacitor()?.Plugins?.Browser;
  if (!App?.addListener) return () => undefined;

  let removed = false;
  let handle: { remove: () => void } | undefined;

  const onAuth = () => onSignedIn?.();
  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_EVENT, onAuth);
  }

  const onOpen = (event: { url: string }) => {
    const ticket = ticketFromAppUrl(event.url);
    if (!ticket) return;
    void (async () => {
      await Browser?.close?.().catch(() => undefined);
      const ok = await redeemHandoffTicket(ticket);
      if (ok) onSignedIn?.();
    })();
  };

  void App.getLaunchUrl?.().then((launch) => {
    if (!removed && launch?.url) onOpen({ url: launch.url });
  });

  Promise.resolve(App.addListener('appUrlOpen', onOpen)).then((listener) => {
    if (removed) {
      listener.remove();
      return;
    }
    handle = listener;
  });

  return () => {
    removed = true;
    handle?.remove();
    if (typeof window !== 'undefined') {
      window.removeEventListener(AUTH_EVENT, onAuth);
    }
  };
}
