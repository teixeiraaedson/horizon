import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnv, supabaseServer, hashToken } from './_shared';
import { verifyToken } from '../../src/lib/auth/tokens';
import { meetsRules, hashPassword } from '../../src/lib/auth/password';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) return res.status(400).json({ error: { message: 'Token and newPassword are required.' } });
  if (!meetsRules(newPassword)) return res.status(400).json({ error: { message: 'Password does not meet complexity rules.' } });

  const env = getEnv();
  let payload;
  try {
    payload = await verifyToken(token, env.AUTH_TOKEN_SECRET);
  } catch {
    return res.status(400).json({ error: { message: 'Invalid or expired token.' } });
  }
  if (payload.purpose !== 'reset') {
    return res.status(400).json({ error: { message: 'Invalid token purpose.' } });
  }

  const tokenHash = hashToken(token);
  const supabase = supabaseServer();

  const { data: tok } = await supabase.from('auth_tokens').select('id,user_id,type,expires_at,used_at').eq('token_hash', tokenHash).eq('type', 'reset_password').maybeSingle();
  if (!tok || tok.used_at || new Date(tok.expires_at) < new Date()) {
    return res.status(400).json({ error: { message: 'Invalid or expired token.' } });
  }

  const pwHash = await hashPassword(newPassword);
  await supabase.from('users').update({ password_hash: pwHash }).eq('id', tok.user_id);

  // Mark token used and revoke existing sessions
  await supabase.from('auth_tokens').update({ used_at: new Date().toISOString() }).eq('id', tok.id);
  await supabase.from('sessions').update({ revoked_at: new Date().toISOString() }).eq('user_id', tok.user_id);

  return res.status(200).json({ ok: true });
}