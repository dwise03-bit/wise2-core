import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest, NextResponse } from 'next/server';
import type {
  ProfileId,
  StoreResult,
  ClientStatus,
  NextPrompt,
} from '../../../../../packages/api-keys/src/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ApiKeysModule = {
  PROFILES: Array<{ id: string; name: string; summary: string }>;
  isProfileId: (value: string) => value is ProfileId;
  getStatus: (client: string, profile: ProfileId) => ClientStatus;
  getNextPrompt: (client: string, profile: ProfileId) => NextPrompt;
  storeKey: (client: string, envVariable: string, value: string) => StoreResult;
  skipKey: (client: string, envVariable: string) => StoreResult;
  deleteKey: (client: string, envVariable: string) => StoreResult;
};

let cached: ApiKeysModule | null = null;

function packageEntry(): string {
  const candidates = [
    join(process.cwd(), '../../packages/api-keys/src/index.ts'),
    join(process.cwd(), 'packages/api-keys/src/index.ts'),
    join(process.cwd(), 'node_modules/@wise2/api-keys/src/index.ts'),
  ];
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    throw new Error('WISE² API keys package not found. Run from the monorepo or set cwd to the repo root.');
  }
  return found;
}

async function loadApiKeys(): Promise<ApiKeysModule> {
  if (cached) return cached;
  const spec = pathToFileURL(packageEntry()).href;
  cached = (await import(/* webpackIgnore: true */ spec)) as ApiKeysModule;
  return cached;
}

function isAuthorized(request: NextRequest): boolean {
  const token =
    request.cookies.get('authToken')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (token) return true;
  return process.env.NODE_ENV !== 'production';
}

function clientFrom(request: NextRequest, body?: Record<string, unknown>): string {
  const fromBody = typeof body?.client === 'string' ? body.client : '';
  const fromQuery = request.nextUrl.searchParams.get('client') || '';
  return fromBody.trim() || fromQuery.trim() || 'default';
}

function profileFrom(
  request: NextRequest,
  keys: ApiKeysModule,
  body?: Record<string, unknown>,
): ProfileId {
  const raw =
    (typeof body?.profile === 'string' && body.profile) ||
    request.nextUrl.searchParams.get('profile') ||
    'core';
  if (!keys.isProfileId(raw)) {
    throw new Error(`Unknown profile: ${raw}`);
  }
  return raw;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Sign in to view API keys' }, { status: 401 });
  }

  try {
    const keys = await loadApiKeys();
    const catalogOnly = request.nextUrl.searchParams.get('catalog') === '1';
    if (catalogOnly) {
      return NextResponse.json({ profiles: keys.PROFILES });
    }
    const client = clientFrom(request);
    const profile = profileFrom(request, keys);
    const status = keys.getStatus(client, profile);
    const next = keys.getNextPrompt(client, profile);
    return NextResponse.json({ ...status, next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load API keys' },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Sign in to store API keys' }, { status: 401 });
  }

  try {
    const keys = await loadApiKeys();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = typeof body.action === 'string' ? body.action : 'store';
    const client = clientFrom(request, body);
    const envVariable = typeof body.envVariable === 'string' ? body.envVariable : '';

    if (action === 'store') {
      const value = typeof body.value === 'string' ? body.value : '';
      const result = keys.storeKey(client, envVariable, value);
      if (!result.ok) {
        return NextResponse.json(result, { status: 400 });
      }
    } else if (action === 'skip') {
      const result = keys.skipKey(client, envVariable);
      if (!result.ok) return NextResponse.json(result, { status: 400 });
    } else if (action === 'remove') {
      const result = keys.deleteKey(client, envVariable);
      if (!result.ok) return NextResponse.json(result, { status: 400 });
    } else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const profile = profileFrom(request, keys, body);
    const status = keys.getStatus(client, profile);
    const next = keys.getNextPrompt(client, profile);
    return NextResponse.json({ ok: true, ...status, next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update API keys' },
      { status: 400 },
    );
  }
}
