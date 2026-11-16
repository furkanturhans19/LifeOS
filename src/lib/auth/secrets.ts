/**
 * Server-side secrets for signed sessions.
 * Production requires LIFE_SESSION_SECRET (or SESSION_SECRET).
 */
export function getSessionSecret(): string {
  const fromEnv =
    process.env.LIFE_SESSION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();

  if (fromEnv && fromEnv.length >= 32) {
    return fromEnv;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('LIFE_SESSION_SECRET (min 32 chars) is required in production.');
  }

  // Dev-only fallback — not for multi-user / public hosts.
  return 'life-dev-session-secret-change-me-32b';
}

export function getAdminMasterKey(): string | null {
  const key = process.env.ADMIN_MASTER_KEY?.trim();
  return key && key.length >= 16 ? key : null;
}
