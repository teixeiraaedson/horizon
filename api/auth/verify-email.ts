import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnv, supabaseServer, hashToken, setSessionCookie, randomSessionToken } from './_shared';
import { verifyToken } from '../../src/lib/auth/tokens';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const token = (req.query?.token as string) || '';
  if (!token) return res.status(400).json({ error: { message: 'Missing token' } });

  const env = getEnv();
  let payload;
  try {
    payload = await verifyToken(token, env.AUTH_TOKEN_SECRET);
  } catch {
    return res.status(400).json({ error: { message: 'Invalid or expired token.' } });
  }
  if (payload.purpose !== 'verify') {
    return res.status(400).json({ error: { message: 'Invalid token purpose.' } });
  }

  const tokenHash = hashToken(token);
  const supabase = supabaseServer();

  const { data: tok } = await supabase.from('auth_tokens').select('id,user_id,type,expires_at,used_at').eq('token_hash', tokenHash).eq('type', 'verify_email').maybeSingle();
  if (!tok || tok.used_at || new Date(tok.expires_at) < new Date()) {
    return res.status(400).json({ error: { message: 'Invalid or expired token.' } });
  }

  // Mark token used and verify the user
  await supabase.from('auth_tokens').update({ used_at: new Date().toISOString() }).eq('id', tok.id);
  await supabase.from('users').update({ email_verified_at: new Date().toISOString() }).eq('id', tok.user_id);

  // Create session and set cookie
  const rawSession = randomSessionToken();
  const sessionHash = hashToken(rawSession);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  await supabase.from('sessions').insert({
    user_id: tok.user_id,
    session_hash: sessionHash,
    expires_at: expiresAt
  });
  setSessionCookie(res, rawSession, 7 * 24 * 60 * 60);

  return res.status(200).json({ ok: true });
}