import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  SESSION_COOKIE,
  readSessionSubjectFromCookieHeader,
  verifyAdminSessionToken,
  verifySessionToken,
} from '@/lib/auth/session';

export async function getSessionSubjectId(): Promise<string | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    return (await verifySessionToken(token))?.sid ?? null;
  } catch {
    return null;
  }
}

export async function getSessionSubjectIdFromRequest(request: Request): Promise<string | null> {
  return readSessionSubjectFromCookieHeader(request.headers.get('cookie'));
}

export async function getAdminSessionId(): Promise<string | null> {
  try {
    const store = await cookies();
    return await verifyAdminSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

export async function getAdminSessionIdFromRequest(request: Request): Promise<string | null> {
  const header = request.headers.get('cookie');
  if (!header) return null;
  const match = header.match(/(?:^|;\s*)life_admin_session=([^;]+)/);
  if (!match?.[1]) return null;
  return verifyAdminSessionToken(decodeURIComponent(match[1]));
}
