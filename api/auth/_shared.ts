import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash, randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';

type Env = {
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  APP_BASE_URL: string;
  AUTH_TOKEN_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

export function getEnv(): Env {
  const env = {
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || '',
    APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:32110',
    AUTH_TOKEN_SECRET: process.env.AUTH_TOKEN_SECRET || '',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  };
  return env;
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function randomSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function setSessionCookie(res: VercelResponse, rawToken: string, maxAgeSeconds: number) {
  const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
  const cookie = `session_token=${rawToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Expires=${expires}; Secure`;
  res.setHeader('Set-Cookie', cookie);
}

export function clearSessionCookie(res: VercelResponse) {
  const cookie = `session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`;
  res.setHeader('Set-Cookie', cookie);
}

export function getSessionTokenFromReq(req: VercelRequest): string | null {
  const raw = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)session_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function supabaseServer() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnv();
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

// Simple in-memory rate limiter (best-effort; Vercel serverless is stateless, so this is a lightweight guard)
const rl = new Map<string, number>();
export function rateLimit(req: VercelRequest, key: string, cooldownMs = 60_000): boolean {
  const ip = (req.headers['x-forwarded-for'] as string) || (req.socket as any)?.remoteAddress || 'unknown';
  const composite = `${ip}:${key}`;
  const last = rl.get(composite) || 0;
  const now = Date.now();
  if (now - last < cooldownMs) {
    return false;
  }
  rl.set(composite, now);
  return true;
}