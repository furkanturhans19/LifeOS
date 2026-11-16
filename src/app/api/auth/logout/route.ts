import { NextResponse } from 'next/server';
import { clearAdminSessionCookie, clearSessionCookieOnResponse } from '@/lib/auth/session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearSessionCookieOnResponse(response);
  clearAdminSessionCookie(response);
  return response;
}
