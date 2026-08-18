export interface BrowserAuthUser {
  id?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider?: string;
  verified?: boolean;
  [key: string]: unknown;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie
    .split('; ')
    .find((pair) => pair.startsWith(prefix));

  if (!entry) return null;

  const raw = entry.slice(prefix.length);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function readAppState(): { auth?: { token?: string | null; user?: BrowserAuthUser | null } } | null {
  if (typeof window === 'undefined') return null;
  return parseJson(localStorage.getItem('app-state'));
}

export function devLogin(name: string = 'Developer', email: string = 'developer@wise2.local') {
  if (typeof window === 'undefined') return;

  const userData = {
    id: `dev_${Date.now()}`,
    userId: `dev_${Date.now()}`,
    email,
    firstName: name.split(' ')[0],
    lastName: name.split(' ').slice(1).join(' ') || 'User',
    picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0055FF&color=fff`,
    provider: 'dev',
    verified: true,
  };

  const appState = {
    auth: {
      token: `dev_token_${Date.now()}`,
      user: userData,
    },
  };

  localStorage.setItem('app-state', JSON.stringify(appState));
  window.location.href = '/sound-labs';
}

export function getBrowserAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  const appState = readAppState();

  return (
    localStorage.getItem('auth_token') ||
    localStorage.getItem('authToken') ||
    appState?.auth?.token ||
    readCookie('authToken') ||
    readCookie('auth_token') ||
    null
  );
}

export function getBrowserAuthUser(): BrowserAuthUser | null {
  if (typeof window === 'undefined') return null;

  const appState = readAppState();
  const storedUser = parseJson<BrowserAuthUser>(localStorage.getItem('user'));
  const cookieUser =
    parseJson<BrowserAuthUser>(readCookie('authUser')) ||
    parseJson<BrowserAuthUser>(readCookie('google_user'));

  return appState?.auth?.user || storedUser || cookieUser || null;
}

export function clearBrowserAuthSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('auth_token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('app-state');

  const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
  for (const name of ['authToken', 'auth_token', 'authUser', 'google_user', 'google_token', 'google_refresh_token']) {
    document.cookie = `${encodeURIComponent(name)}=; expires=${expired}; path=/;`;
  }
}
