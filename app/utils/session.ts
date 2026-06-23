import { cookies } from 'next/headers';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const COOKIE_NAME = 'bq_session';

export interface SessionData {
  accessToken: string;
  refreshToken: string | null;
  expiry: number;
  email: string;
}

/**
 * Derives a 32-byte key from the SESSION_SECRET environment variable
 */
function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET || 'fallback-dev-secret-key-replace-this-in-production';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a string using AES-256-GCM
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv.authTag.encrypted
  return `${iv.toString('hex')}.${authTag}.${encrypted}`;
}

/**
 * Decrypt a string using AES-256-GCM
 */
export function decrypt(encryptedText: string): string {
  const key = getKey();
  const parts = encryptedText.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted session format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Retrieve the current session from the cookies
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const encrypted = cookieStore.get(COOKIE_NAME)?.value;
    if (!encrypted) return null;
    
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted) as SessionData;
  } catch (error) {
    console.warn('Failed to retrieve or decrypt session:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Write a session to the cookies
 */
export async function setSession(session: SessionData): Promise<void> {
  const encrypted = encrypt(JSON.stringify(session));
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Delete the session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
