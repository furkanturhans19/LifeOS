import fs from 'fs';
import path from 'path';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

const dbPath = path.join(process.cwd(), 'src/generated/local_db.json');

type LocalUser = Record<string, unknown> & {
  id?: string;
  supabaseId: string;
  email?: string;
  lifeosId?: string;
  passwordHash?: string;
};

type LocalDbShape = {
  users: Record<string, LocalUser>;
};

function ensureDbFile() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: {} }, null, 2), 'utf-8');
  }
}

function readDb(): LocalDbShape {
  ensureDbFile();
  const raw = fs.readFileSync(dbPath, 'utf-8');
  const parsed = JSON.parse(raw || '{}') as Record<string, unknown>;

  // Migrate legacy flat map { [supabaseId]: user } → { users: { ... } }
  if (parsed.users && typeof parsed.users === 'object') {
    return { users: parsed.users as Record<string, LocalUser> };
  }

  const users: Record<string, LocalUser> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (key.startsWith('_')) continue;
    if (value && typeof value === 'object') {
      users[key] = value as LocalUser;
    }
  }
  return { users };
}

/** Atomic-ish write: temp file + rename. Still single-process safe only. */
function writeDb(db: LocalDbShape) {
  ensureDbFile();
  const tmp = `${dbPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmp, dbPath);
}

function publicUser(user: LocalUser): LocalUser {
  const { passwordHash: _omit, ...rest } = user;
  return rest as LocalUser;
}

export function getLocalUser(supabaseId: string): LocalUser | null {
  try {
    const db = readDb();
    const user = db.users[supabaseId];
    return user ? publicUser(user) : null;
  } catch (error) {
    console.error('Error reading local DB:', error);
    return null;
  }
}

export function findLocalUserByEmail(email: string): LocalUser | null {
  try {
    const db = readDb();
    const needle = email.trim().toLowerCase();
    for (const user of Object.values(db.users)) {
      if (typeof user.email === 'string' && user.email.toLowerCase() === needle) {
        return publicUser(user);
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding local user by email:', error);
    return null;
  }
}

/** True when email exists but has no password hash (legacy orphan). */
export function isPasswordlessLocalAccount(email: string): boolean {
  try {
    const db = readDb();
    const needle = email.trim().toLowerCase();
    for (const user of Object.values(db.users)) {
      if (typeof user.email === 'string' && user.email.toLowerCase() === needle) {
        return !user.passwordHash;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/** Remove a local account by email (used to clear legacy passwordless rows). */
export function deleteLocalUserByEmail(email: string): boolean {
  try {
    const db = readDb();
    const needle = email.trim().toLowerCase();
    let removed = false;
    for (const [key, user] of Object.entries(db.users)) {
      if (typeof user.email === 'string' && user.email.toLowerCase() === needle) {
        delete db.users[key];
        removed = true;
      }
    }
    if (removed) writeDb(db);
    return removed;
  } catch {
    return false;
  }
}

export function saveLocalUser(supabaseId: string, userData: Record<string, unknown>): LocalUser {
  try {
    const db = readDb();
    const existing = db.users[supabaseId] || { supabaseId };
    const updated: LocalUser = {
      ...existing,
      ...userData,
      supabaseId,
      updatedAt: new Date().toISOString(),
    } as LocalUser;

    if (!updated.id) {
      updated.id = existing.id || `local_${Date.now()}`;
    }
    if (!updated.createdAt) {
      updated.createdAt = existing.createdAt || new Date().toISOString();
    }

    // Never wipe password unless explicitly provided.
    if (!userData.passwordHash && existing.passwordHash) {
      updated.passwordHash = existing.passwordHash;
    }

    db.users[supabaseId] = updated;
    writeDb(db);
    return publicUser(updated);
  } catch (error) {
    console.error('Error writing to local DB:', error);
    return { ...userData, supabaseId } as LocalUser;
  }
}

export function setLocalPassword(supabaseId: string, password: string): void {
  const db = readDb();
  const existing = db.users[supabaseId];
  if (!existing) {
    throw new Error('LOCAL_USER_MISSING');
  }
  existing.passwordHash = hashPassword(password);
  existing.updatedAt = new Date().toISOString();
  db.users[supabaseId] = existing;
  writeDb(db);
}

export function verifyLocalPassword(email: string, password: string): LocalUser | null {
  try {
    const db = readDb();
    const needle = email.trim().toLowerCase();
    for (const user of Object.values(db.users)) {
      if (typeof user.email === 'string' && user.email.toLowerCase() === needle) {
        if (!user.passwordHash) return null;
        if (!verifyPassword(password, user.passwordHash)) return null;
        return publicUser(user);
      }
    }
    return null;
  } catch (error) {
    console.error('Error verifying local password:', error);
    return null;
  }
}

export function isLocalUsernameUnique(lifeosId: string, excludeSupabaseId?: string): boolean {
  try {
    const db = readDb();
    const lowercaseId = lifeosId.toLowerCase();

    for (const [key, user] of Object.entries(db.users)) {
      if (excludeSupabaseId && key === excludeSupabaseId) continue;
      if (typeof user.lifeosId === 'string' && user.lifeosId.toLowerCase() === lowercaseId) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking local username uniqueness:', error);
    return false;
  }
}

export function isLocalEmailUnique(email: string, excludeSupabaseId?: string): boolean {
  try {
    const db = readDb();
    const needle = email.trim().toLowerCase();
    for (const [key, user] of Object.entries(db.users)) {
      if (excludeSupabaseId && key === excludeSupabaseId) continue;
      if (typeof user.email === 'string' && user.email.toLowerCase() === needle) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}
