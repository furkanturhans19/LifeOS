import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

const PROTECTED_PAGE_PREFIXES = [
  '/home',
  '/library',
  '/profile',
  '/settings',
  '/ai',
  '/chat',
  '/connect',
  '/family',
  '/finance',
  '/documents',
  '/arcade',
  '/kids',
  '/courses',
  '/education',
  '/explore',
  '/services',
  '/smarthome',
  '/notifications',
  '/search',
  '/admin',
];

const AUTH_PATHS = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sessionOk = Boolean(await verifySessionToken(token));

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (!sessionOk && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (sessionOk && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
