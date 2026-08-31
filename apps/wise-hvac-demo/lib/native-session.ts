export type NativeFieldAuth = {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    firstName?: string;
    lastName?: string;
  };
};

const AUTH_KEY = 'wise2.fieldtech.auth.v1';
const READY_KEY = 'wise2.fieldtech.nativeReady';

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadNativeAuth(): NativeFieldAuth | null {
  const raw = storage()?.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as NativeFieldAuth;
    return parsed.accessToken ? parsed : null;
  } catch {
    return null;
  }
}

export function saveNativeAuth(auth: NativeFieldAuth): void {
  const store = storage();
  if (!store) return;
  store.setItem(AUTH_KEY, JSON.stringify(auth));
  store.setItem(READY_KEY, '1');
}

export function markNativeSessionReady(): void {
  storage()?.setItem(READY_KEY, '1');
}

export function clearNativeSession(): void {
  const store = storage();
  store?.removeItem(AUTH_KEY);
  store?.removeItem(READY_KEY);
}

export function hasNativeSession(): boolean {
  return Boolean(loadNativeAuth() || storage()?.getItem(READY_KEY));
}

export function nativeAuthHeaders(): HeadersInit {
  const auth = loadNativeAuth();
  return auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {};
}
