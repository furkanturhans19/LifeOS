import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { attachSessionCookie } from '@/lib/auth/session';
import {
  verifyLocalPassword,
  findLocalUserByEmail,
  getLocalUser,
  isPasswordlessLocalAccount,
} from '@/lib/localDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'E-posta ve şifre zorunludur.' },
        { status: 400 }
      );
    }

    // Local credential store (Supabase bilerek kapalıyken birincil yol)
    const localAuth = verifyLocalPassword(email, password);
    if (localAuth?.supabaseId) {
      const user = getLocalUser(localAuth.supabaseId) || localAuth;
      const response = NextResponse.json({ success: true, user });
      return attachSessionCookie(response, String(user.supabaseId));
    }

    if (isPasswordlessLocalAccount(email)) {
      return NextResponse.json(
        {
          error:
            'Bu e-posta eski (şifresiz) bir kayıttan kalmış. Lütfen Hesap oluştur ile yeniden kayıt olun.',
          code: 'PASSWORDLESS_LEGACY',
        },
        { status: 401 }
      );
    }

    try {
      const dbUser = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
      });
      if (dbUser && !findLocalUserByEmail(email)) {
        return NextResponse.json(
          {
            error:
              'Bu hesap için yerel şifre tanımlı değil. Lütfen yeniden kayıt olun.',
            code: 'PASSWORDLESS_LEGACY',
          },
          { status: 401 }
        );
      }
    } catch {
      // DB offline — local-only auth already failed above
    }

    return NextResponse.json(
      { error: 'E-posta veya şifre hatalı.' },
      { status: 401 }
    );
  } catch (error: unknown) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
