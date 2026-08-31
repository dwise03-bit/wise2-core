import { cookies } from 'next/headers';

export async function getWise2AccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('wise2_access_token')?.value ?? null;
}

export async function getWise2User(): Promise<{
  id: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  name?: string | null;
} | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('wise2_user')?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as {
      id: string;
      email: string;
      role?: string;
      firstName?: string;
      lastName?: string;
      name?: string | null;
    };
  } catch {
    return null;
  }
}
