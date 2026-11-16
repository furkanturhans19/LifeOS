import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanLifeOSId, isValidLifeOSId } from '@/lib/utils';
import {
  deleteLocalUserByEmail,
  isLocalEmailUnique,
  isLocalUsernameUnique,
  isPasswordlessLocalAccount,
  saveLocalUser,
  setLocalPassword,
} from '@/lib/localDb';
import { attachSessionCookie } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';

const DEFAULT_HOMESCREEN = {
  pages: [
    {
      page: 0,
      items: [
        { moduleId: 'ai', position: 0, size: 'small' },
        { moduleId: 'chat', position: 1, size: 'small' },
        { moduleId: 'family', position: 2, size: 'small' },
        { moduleId: 'finance', position: 3, size: 'small' },
        { moduleId: 'medai', position: 4, size: 'small' },
        { moduleId: 'kids', position: 5, size: 'small' },
        { moduleId: 'arcade', position: 6, size: 'small' },
        { moduleId: 'smart-home', position: 7, size: 'small' },
      ],
    },
  ],
  dockItems: [
    { moduleId: 'services', position: 0 },
    { moduleId: 'chat', position: 1 },
    { moduleId: 'ai', position: 2 },
    { moduleId: 'family', position: 3 },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, displayName, lifeosId: rawLifeosId, password } = body;

    if (!email || !displayName || !rawLifeosId || !password) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurunuz (şifre dahil).' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const lifeosId = cleanLifeOSId(rawLifeosId);
    if (!isValidLifeOSId(lifeosId)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı formatı.' },
        { status: 400 }
      );
    }

    // Allow reclaiming legacy accounts created before password auth existed.
    if (isPasswordlessLocalAccount(email)) {
      deleteLocalUserByEmail(email);
    }

    if (!isLocalEmailUnique(email) || !isLocalUsernameUnique(lifeosId)) {
      return NextResponse.json(
        { error: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const localSupabaseId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { lifeosId }] },
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return NextResponse.json(
            { error: 'Bu e-posta adresi zaten kullanılıyor.' },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: `@${lifeosId} kullanıcı adı zaten kullanımda.` },
          { status: 409 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          email,
          displayName,
          lifeosId,
          supabaseId: localSupabaseId,
          theme: 'dark',
          locale: 'tr',
          backgroundType: 'default',
          homescreen: { create: DEFAULT_HOMESCREEN },
        },
      });

      saveLocalUser(newUser.supabaseId, {
        id: newUser.id,
        supabaseId: newUser.supabaseId,
        lifeosId: newUser.lifeosId,
        email: newUser.email,
        displayName: newUser.displayName,
        avatarUrl: newUser.avatarUrl,
        bio: newUser.bio,
        locale: newUser.locale,
        theme: newUser.theme,
        backgroundType: newUser.backgroundType,
        backgroundValue: newUser.backgroundValue,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
        passwordHash,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          supabaseId: newUser.supabaseId,
          lifeosId: newUser.lifeosId,
          email: newUser.email,
          displayName: newUser.displayName,
          avatarUrl: newUser.avatarUrl,
          bio: newUser.bio,
          locale: newUser.locale,
          theme: newUser.theme,
          backgroundType: newUser.backgroundType,
          backgroundValue: newUser.backgroundValue,
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        },
      });
      return attachSessionCookie(response, newUser.supabaseId);
    } catch (dbError) {
      console.warn('DB creation fallback to local:', dbError);

      const fallbackUser = saveLocalUser(localSupabaseId, {
        id: `local_${Date.now()}`,
        supabaseId: localSupabaseId,
        lifeosId,
        email,
        displayName,
        avatarUrl: null,
        bio: null,
        locale: 'tr',
        theme: 'dark',
        backgroundType: 'default',
        backgroundValue: null,
        createdAt: new Date().toISOString(),
        passwordHash,
      });

      // Ensure hash persisted even if merge quirks
      setLocalPassword(localSupabaseId, password);

      const response = NextResponse.json({
        success: true,
        user: fallbackUser,
      });
      return attachSessionCookie(response, localSupabaseId);
    }
  } catch (error: unknown) {
    console.error('Registration API error:', error);
    const message = error instanceof Error ? error.message : 'Kayıt sırasında bir hata oluştu.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
