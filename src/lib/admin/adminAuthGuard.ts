import { NextResponse } from 'next/server';
import { AdminRegistry } from './AdminRegistry';
import { getAdminSessionIdFromRequest } from '@/lib/auth/request-user';

export interface AdminAuthContext {
  isAdmin: boolean;
  role: 'admin' | 'super_admin' | null;
  adminId: string;
  displayName: string;
}

/**
 * Admin routes require a signed life_admin_session cookie.
 * Spoofable x-user-id / query params are ignored.
 */
export async function assertAdmin(request: Request): Promise<{
  authorized: boolean;
  context?: AdminAuthContext;
  response?: NextResponse;
}> {
  const adminId = await getAdminSessionIdFromRequest(request);

  if (!adminId) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Yönetici oturumu gerekli. Güvenlik anahtarı ile doğrulama yapın.',
          code: 'UNAUTHORIZED_ADMIN_ACCESS',
        },
        { status: 403 }
      ),
    };
  }

  const result = AdminRegistry.verifyAdmin({
    userId: adminId,
    email: process.env.OWNER_ADMIN_EMAIL || null,
  });

  // Signed admin session alone is enough after key unlock; bind display name.
  return {
    authorized: true,
    context: {
      isAdmin: true,
      role: result.role || 'admin',
      adminId,
      displayName: result.displayName || 'Yönetici',
    },
  };
}
