import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer, getEnv, hashToken } from './_shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const raw = (req.headers.cookie || '').match(/(?:^|;\s*)session_token=([^;]+)/);
  const token = raw ? decodeURIComponent(raw[1]) : null;
  if (!token) return res.status(200).json({ user: null });

  const supabase = supabaseServer();
  const sessionHash = hashToken(token);

  const { data: session } = await supabase.from('sessions').select('id,user_id,expires_at,revoked_at').eq('session_hash', sessionHash).maybeSingle();
  if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
    return res.status(200).json({ user: null });
  }

  const { data: user } = await supabase.from('users').select('id,email,role,email_verified_at').eq('id', session.user_id).maybeSingle();

  return res.status(200).json({ user: user ? { ...user } : null });
}