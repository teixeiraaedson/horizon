import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export type TokenPurpose = "verify" | "reset";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  purpose: TokenPurpose;
  iat: number; // seconds
  exp: number; // seconds
};

export function supabaseServer() {
  const url = process.env.SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function randomSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function setSessionCookie(res: any, rawToken: string, maxAgeSeconds: number) {
  const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
  const cookie = `session_token=${rawToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Expires=${expires}; Secure`;
  res.setHeader("Set-Cookie", cookie);
}

export function clearSessionCookie(res: any) {
  const cookie = `session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`;
  res.setHeader("Set-Cookie", cookie);
}

export function getSessionTokenFromReq(req: any): string | null {
  const raw = req.headers?.cookie || "";
  const match = raw.match(/(?:^|;\s*)session_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function signToken(payload: AuthTokenPayload, secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return await new SignJWT({ userId: payload.userId, email: payload.email, purpose: payload.purpose })
    .setIssuedAt(payload.iat)
    .setExpirationTime(payload.exp)
    .setProtectedHeader({ alg: "HS256" })
    .sign(key);
}

export async function verifyToken(token: string, secret: string): Promise<AuthTokenPayload> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);
  const iat = typeof payload.iat === "number" ? payload.iat : Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === "number" ? payload.exp : iat + 60;
  return {
    userId: String(payload.userId),
    email: String(payload.email),
    purpose: payload.purpose as TokenPurpose,
    iat,
    exp,
  };
}

export function meetsRules(pw: string): boolean {
  const minLen = pw.length >= 12;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const num = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return minLen && upper && lower && num && special;
}

export async function hashPassword(pw: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pw, salt);
}

export async function comparePassword(pw: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(pw, hash);
}

export async function sendVerificationEmail(to: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY as string;
  const from = process.env.RESEND_FROM_EMAIL as string;
  const base = process.env.APP_BASE_URL as string;
  const resend = new Resend(apiKey);
  const verifyUrl = `${base}/auth/verify?token=${encodeURIComponent(token)}`;
  await resend.emails.send({
    from,
    to,
    subject: "Verify your Horizon account",
    html: `<div style="font-family:Inter,system-ui,sans-serif;padding:20px;">
      <h2 style="margin:0 0 12px;color:#0f172a;">Verify your email</h2>
      <p style="color:#334155;">Please confirm your email to activate your account.</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#38BDF8;color:#0f172a;border-radius:8px;text-decoration:none;">Verify Email</a></p>
      <p style="color:#64748b;font-size:12px;">If the button doesn't work, copy and paste this link:</p>
      <p style="color:#64748b;font-size:12px;">${verifyUrl}</p>
    </div>`,
    text: `Verify your email: ${verifyUrl}`,
  });
}

export async function sendResetEmail(to: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY as string;
  const from = process.env.RESEND_FROM_EMAIL as string;
  const base = process.env.APP_BASE_URL as string;
  const resend = new Resend(apiKey);
  const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;
  await resend.emails.send({
    from,
    to,
    subject: "Reset your Horizon password",
    html: `<div style="font-family:Inter,system-ui,sans-serif;padding:20px;">
      <h2 style="margin:0 0 12px;color:#0f172a;">Reset your password</h2>
      <p style="color:#334155;">Use the link below to set a new password. This link expires in 30 minutes.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#38BDF8;color:#0f172a;border-radius:8px;text-decoration:none;">Reset Password</a></p>
      <p style="color:#64748b;font-size:12px;">If the button doesn't work, copy and paste this link:</p>
      <p style="color:#64748b;font-size:12px;">${resetUrl}</p>
    </div>`,
    text: `Reset your password: ${resetUrl}`,
  });
}

// Simple in-memory rate limiter (best-effort per-IP/email)
const rl = new Map<string, number>();
export function rateLimit(key: string, cooldownMs = 60_000): boolean {
  const now = Date.now();
  const last = rl.get(key) || 0;
  if (now - last < cooldownMs) return false;
  rl.set(key, now);
  return true;
}