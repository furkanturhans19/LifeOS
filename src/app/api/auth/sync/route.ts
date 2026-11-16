import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalUser } from '@/lib/localDb';
import { getSessionSubjectIdFromRequest } from '@/lib/auth/request-user';

/**
 * Profile sync for an ALREADY authenticated session.
 * Does NOT create sessions from email alone (account-takeover fix).
 */
export async function POST(request: NextRequest) {
  try {
    const subjectId = await getSessionSubjectIdFromRequest(request);
    if (!subjectId) {
      return NextResponse.json(
        { error: 'SIGN_IN', message: 'Önce giriş yapmalısınız.' },
        { status: 401 }
      );
    }

    try {
      const user = await prisma.user.findUnique({
        where: { supabaseId: subjectId },
      });

      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            supabaseId: user.supabaseId,
            lifeosId: user.lifeosId,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            locale: user.locale,
            theme: user.theme,
            backgroundType: user.backgroundType,
            backgroundValue: user.backgroundValue,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          },
        });
      }
    } catch (dbErr) {
      console.warn('Sync DB offline, using local:', dbErr);
    }

    const local = getLocalUser(subjectId);
    if (local) {
      return NextResponse.json({ success: true, user: local });
    }

    return NextResponse.json(
      { error: 'PROFILE_REQUIRED', message: 'Oturum geçerli ama profil bulunamadı.' },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error('Auth sync error:', error);
    return NextResponse.json(
      { error: 'Sync sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
