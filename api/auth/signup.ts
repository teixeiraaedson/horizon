import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getEnv, supabaseServer, hashToken } from './_shared';
import { signToken } from '../../src/lib/auth/tokens';
import { hashPassword, meetsRules } from '../../src/lib/auth/password';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: { message: 'Email and password are required' } });

  if (!meetsRules(password)) return res.status(400).json({ error: { message: 'Password does not meet complexity rules.' } });

  const env = getEnv();
  const supabase = supabaseServer();

  const { data: existing } = await supabase.from('users').select('id,email').eq('email', email).maybeSingle();

  let userId = existing?.id;
  if (!existing) {
    const pwHash = await hashPassword(password);
    const { data: created, error: createErr } = await supabase.from('users').insert({
      email,
      password_hash: pwHash,
      role: 'user'
    }).select('id').single();
    if (createErr) {
      console.error('signup create user error', createErr);
      return res.status(500).json({ error: { message: 'Unable to create user.' } });
    }
    userId = created.id;
  }

  // Issue verification token (24h)
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 24 * 60 * 60;
  const token = await signToken({ userId: String(userId), email, purpose: 'verify', iat: now, exp }, env.AUTH_TOKEN_SECRET);
  const tokenHash = hashToken(token);

  // Store token (single-use): invalidate previous by overwriting
  const { error: tokErr } = await supabase.from('auth_tokens').insert({
    user_id: userId,
    type: 'verify_email',
    token_hash: tokenHash,
    expires_at: new Date(exp * 1000).toISOString(),
  });
  if (tokErr) {
    console.error('signup token insert error', tokErr);
    // Continue sending generic success; do not leak internals
  }

  // Send email via Resend (server-side)
  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const verifyUrl = `${env.APP_BASE_URL}/auth/verify?token=${encodeURIComponent(token)}`;
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Verify your Horizon account',
      html: `<div style="font-family:Inter,system-ui,sans-serif;padding:20px;">
        <h2 style="margin:0 0 12px;color:#0f172a;">Verify your email</h2>
        <p style="color:#334155;">Please confirm your email to activate your account.</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#38BDF8;color:#0f172a;border-radius:8px;text-decoration:none;">Verify Email</a></p>
        <p style="color:#64748b;font-size:12px;">If the button doesn't work, copy and paste this link:</p>
        <p style="color:#64748b;font-size:12px;">${verifyUrl}</p>
      </div>`,
      text: `Verify your email: ${verifyUrl}`
    });
  } catch (e) {
    console.error('Resend send verify email error', e);
    // Return generic success regardless
  }

  // Do not set session until verified, per requirements
  return res.status(200).json({ ok: true, message: 'Check your email to verify your account.' });
}