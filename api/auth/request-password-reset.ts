import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getEnv, supabaseServer, hashToken, rateLimit } from './_shared';
import { signToken } from '../../src/lib/auth/tokens';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const { email } = req.body || {};
  if (!email) return res.status(200).json({ ok: true, message: 'If an account exists, an email has been sent.' });

  if (!rateLimit(req, `reset:${email}`, 60_000)) {
    return res.status(200).json({ ok: true, message: 'If an account exists, an email has been sent.' });
  }

  const env = getEnv();
  const supabase = supabaseServer();
  const { data: user } = await supabase.from('users').select('id,email').eq('email', email).maybeSingle();
  if (!user) {
    return res.status(200).json({ ok: true, message: 'If an account exists, an email has been sent.' });
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 30 * 60;
  const token = await signToken({ userId: String(user.id), email, purpose: 'reset', iat: now, exp }, env.AUTH_TOKEN_SECRET);
  const tokenHash = hashToken(token);

  await supabase.from('auth_tokens').insert({
    user_id: user.id,
    type: 'reset_password',
    token_hash: tokenHash,
    expires_at: new Date(exp * 1000).toISOString(),
  });

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const resetUrl = `${env.APP_BASE_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Reset your Horizon password',
      html: `<div style="font-family:Inter,system-ui,sans-serif;padding:20px;">
        <h2 style="margin:0 0 12px;color:#0f172a;">Reset your password</h2>
        <p style="color:#334155;">Use the link below to set a new password. This link expires in 30 minutes.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#38BDF8;color:#0f172a;border-radius:8px;text-decoration:none;">Reset Password</a></p>
        <p style="color:#64748b;font-size:12px;">If the button doesn't work, copy and paste this link:</p>
        <p style="color:#64748b;font-size:12px;">${resetUrl}</p>
      </div>`,
      text: `Reset your password: ${resetUrl}`
    });
  } catch (e) {
    console.error('Resend send reset email error', e);
  }

  return res.status(200).json({ ok: true });
}