import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getAdminMasterKey } from '@/lib/auth/secrets';
import { attachAdminSessionCookie } from '@/lib/auth/session';

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}
const ATTEMPT_LOGS = new Map<string, RateLimitRecord>();

function safeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(request: Request) {
  try {
    const expectedKey = getAdminMasterKey();
    if (!expectedKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'ADMIN_MASTER_KEY tanımlı değil. Yönetici girişi bu ortamda kapalı.',
        },
        { status: 503 }
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const now = Date.now();
    const rateLimit = ATTEMPT_LOGS.get(ip) || { attempts: 0, lockedUntil: 0 };

    if (rateLimit.lockedUntil > now) {
      const remainingSeconds = Math.ceil((rateLimit.lockedUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Çok fazla hatalı deneme. ${remainingSeconds} saniye sonra tekrar deneyin.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const key = typeof body.key === 'string' ? body.key.trim() : '';

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Güvenlik anahtarını giriniz.' },
        { status: 400 }
      );
    }

    if (!safeEqualString(key, expectedKey)) {
      rateLimit.attempts += 1;
      if (rateLimit.attempts >= 5) {
        rateLimit.lockedUntil = now + 15 * 60 * 1000;
        rateLimit.attempts = 0;
      }
      ATTEMPT_LOGS.set(ip, rateLimit);
      return NextResponse.json(
        { success: false, error: 'Geçersiz güvenlik anahtarı.' },
        { status: 401 }
      );
    }

    ATTEMPT_LOGS.delete(ip);

    const response = NextResponse.json({
      success: true,
      message: 'Yönetici güvenlik anahtarı doğrulandı.',
      unlockedAt: new Date().toISOString(),
      expiresIn: '8h',
    });

    return attachAdminSessionCookie(response, 'admin_master');
  } catch {
    return NextResponse.json(
      { success: false, error: 'Güvenlik anahtarı doğrulanırken hata oluştu.' },
      { status: 500 }
    );
  }
}
