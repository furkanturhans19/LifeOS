import type { NextResponse } from 'next/server';
import { getSessionSecret } from './secrets';

export const SESSION_COOKIE = 'lifeos_session';
export const ADMIN_SESSION_COOKIE = 'life_admin_session';
const SESSION_TTL_SEC = 60 * 60 * 24 * 7;
const ADMIN_TTL_SEC = 60 * 60 * 8;

type SessionPayload = {
  sid: string;
  exp: number;
};

function b64url(bytes: ArrayBuffer | Uint8Array | string): string {
  const buffer =
    typeof bytes === 'string'
      ? new TextEncoder().encode(bytes)
      : bytes instanceof Uint8Array
        ? bytes
        : new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < buffer.length; i += 1) binary += String.fromCharCode(buffer[i]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromB64url(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(normalized);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return b64url(sig);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(subjectId: string, ttlSec = SESSION_TTL_SEC): Promise<string> {
  const payload: SessionPayload = {
    sid: subjectId,
    exp: Math.floor(Date.now() / 1000) + ttlSec,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = await sign(body, getSessionSecret());
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  try {
    const expected = await sign(body, getSessionSecret());
    if (!timingSafeEqualStr(sig, expected)) return null;

    const json = new TextDecoder().decode(fromB64url(body));
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload?.sid || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (typeof payload.sid !== 'string' || payload.sid.length < 3) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createAdminSessionToken(adminId: string): Promise<string> {
  return createSessionToken(`admin:${adminId}`, ADMIN_TTL_SEC);
}

export async function verifyAdminSessionToken(token: string | undefined | null): Promise<string | null> {
  const payload = await verifySessionToken(token);
  if (!payload?.sid.startsWith('admin:')) return null;
  return payload.sid.slice('admin:'.length);
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SEC) {
  return {
    path: '/',
    maxAge,
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };
}

export async function attachSessionCookie(response: NextResponse, subjectId: string): Promise<NextResponse> {
  response.cookies.set(SESSION_COOKIE, await createSessionToken(subjectId), sessionCookieOptions());
  return response;
}

export function clearSessionCookieOnResponse(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(0), maxAge: 0 });
  return response;
}

export async function attachAdminSessionCookie(response: NextResponse, adminId: string): Promise<NextResponse> {
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    await createAdminSessionToken(adminId),
    sessionCookieOptions(ADMIN_TTL_SEC)
  );
  response.cookies.set('lifeos_admin_key_verified', '', { path: '/', maxAge: 0 });
  return response;
}

export function clearAdminSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { ...sessionCookieOptions(0), maxAge: 0 });
  response.cookies.set('lifeos_admin_key_verified', '', { path: '/', maxAge: 0 });
  return response;
}

export async function readSessionSubjectFromCookieHeader(cookieHeader: string | null): Promise<string | null> {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)lifeos_session=([^;]+)/);
  if (!match?.[1]) return null;
  const raw = decodeURIComponent(match[1]);
  return (await verifySessionToken(raw))?.sid ?? null;
}
