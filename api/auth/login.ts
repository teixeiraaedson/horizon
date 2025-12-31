import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnv, supabaseServer, hashToken, setSessionCookie, randomSessionToken } from './_shared';
import { comparePassword } from '../../src/lib/auth/password';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: { message: 'Email and password are required' } });

  const supabase = supabaseServer();
  const { data: user } = await supabase.from('users').select('id,email,password_hash,email_verified_at,role').eq('email', email).maybeSingle();
  if (!user) {
    // Do not leak existence
    return res.status(401).json({ error: { message: 'Invalid credentials.' } });
  }
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: { message: 'Invalid credentials.' } });

  if (!user.email_verified_at) {
    return res.status(403).json({ error: { code: 'EMAIL_NOT_VERIFIED', message: 'Email not verified.' } });
  }

  const rawSession = randomSessionToken();
  const sessionHash = hashToken(rawSession);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('sessions').insert({
    user_id: user.id,
    session_hash: sessionHash,
    expires_at: expiresAt
  });
  setSessionCookie(res, rawSession, 7 * 24 * 60 * 60);

  return res.status(200).json({ ok: true });
}