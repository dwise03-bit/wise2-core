import { NextRequest, NextResponse } from 'next/server';

function normalizeUser(raw: Record<string, unknown>) {
  const name = typeof raw.name === 'string' ? raw.name : '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    id: String(raw.id ?? ''),
    email: String(raw.email ?? ''),
    firstName: typeof raw.firstName === 'string' ? raw.firstName : parts[0],
    lastName: typeof raw.lastName === 'string' ? raw.lastName : parts.slice(1).join(' '),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const API_URL = process.env.API_URL || 'http://localhost:3011/api';
    const apiBase = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
    const res = await fetch(`${apiBase}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || 'Invalid email or password' },
        { status: res.status },
      );
    }

    const data = await res.json();
    const token = data.access_token || data.accessToken;

    if (!token) {
      return NextResponse.json({ error: 'No token in response' }, { status: 502 });
    }

    const user = normalizeUser((data.user ?? {}) as Record<string, unknown>);

    const workspaceRes = await fetch(`${apiBase}/v1/cherry-count/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const workspaces = workspaceRes.ok ? await workspaceRes.json() : [];
    const tenantId = Array.isArray(workspaces) && workspaces[0]?.tenantId
      ? workspaces[0].tenantId
      : null;

    return NextResponse.json({ user, token, tenantId, workspaces });
  } catch {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 502 });
  }
}
