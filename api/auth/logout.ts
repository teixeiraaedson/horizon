import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer, hashToken, clearSessionCookie } from './_shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const raw = (req.headers.cookie || '').match(/(?:^|;\s*)session_token=([^;]+)/);
  const token = raw ? decodeURIComponent(raw[1]) : null;
  if (token) {
    const supabase = supabaseServer();
    const sessionHash = hashToken(token);
    await supabase.from('sessions').update({ revoked_at: new Date().toISOString() }).eq('session_hash', sessionHash);
  }
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}