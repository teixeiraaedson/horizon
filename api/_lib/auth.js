const { createHash, randomBytes } = require("crypto");
const { SignJWT, jwtVerify } = require("jose");
const bcrypt = require("bcryptjs");
const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");
const { parseCookies } = require("./http");

function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

function hashToken(raw) {
  return createHash("sha256").update(raw).digest("hex");
}

function randomSessionToken() {
  return randomBytes(32).toString("hex");
}

function setSessionCookie(res, rawToken, maxAgeSeconds) {
  const expires = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
  const cookie = `hz_session=${rawToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Expires=${expires}; Secure`;
  res.setHeader("Set-Cookie", cookie);
}

function clearSessionCookie(res) {
  const cookie = `hz_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`;
  res.setHeader("Set-Cookie", cookie);
}

function getSessionTokenFromReq(req) {
  const cookies = parseCookies(req);
  return cookies["hz_session"] || null;
}

async function signToken(payload, secret) {
  const key = new TextEncoder().encode(secret);
  return await new SignJWT({ userId: payload.userId, email: payload.email, purpose: payload.purpose })
    .setIssuedAt(payload.iat)
    .setExpirationTime(payload.exp)
    .setProtectedHeader({ alg: "HS256" })
    .sign(key);
}

async function verifyToken(token, secret) {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);
  const iat = typeof payload.iat === "number" ? payload.iat : Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === "number" ? payload.exp : iat + 60;
  return {
    userId: String(payload.userId),
    email: String(payload.email),
    purpose: payload.purpose,
    iat,
    exp,
  };
}

function meetsRules(pw) {
  const minLen = pw.length >= 12;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const num = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return minLen && upper && lower && num && special;
}

async function hashPassword(pw) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pw, salt);
}

async function comparePassword(pw, hash) {
  return await bcrypt.compare(pw, hash);
}

async function sendVerificationEmail(to, token) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const base = process.env.APP_BASE_URL;
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

async function sendResetEmail(to, token) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const base = process.env.APP_BASE_URL;
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

// Simple in-memory rate limiter (best-effort per-key)
const rl = new Map();
function rateLimit(key, cooldownMs = 60_000) {
  const now = Date.now();
  const last = rl.get(key) || 0;
  if (now - last < cooldownMs) return false;
  rl.set(key, now);
  return true;
}

module.exports = {
  supabaseServer,
  hashToken,
  randomSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionTokenFromReq,
  signToken,
  verifyToken,
  meetsRules,
  hashPassword,
  comparePassword,
  sendVerificationEmail,
  sendResetEmail,
  rateLimit,
};