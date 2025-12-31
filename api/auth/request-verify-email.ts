import { readJson, sendJson, sendError, requireEnv, supabaseServer, signToken, hashToken, rateLimit, sendVerificationEmail } from "../_lib";

export default async function handler(req: any, res: any) {
  const envCheck = requireEnv([
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "APP_BASE_URL",
    "AUTH_TOKEN_SECRET",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);
  if (!("ok" in envCheck) || envCheck.ok === false) {
    return sendError(res, 500, { code: "ENV_MISSING", message: "Missing env vars", details: envCheck.missing });
  }

  if (req.method !== "POST") return sendError(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });

  const body = await readJson(req);
  const email = String(body?.email || "").trim();
  if (!email) return sendJson(res, 200, { ok: true, message: "If an account exists, an email has been sent." });

  if (!rateLimit(`verify:${email}`, 60_000)) {
    return sendJson(res, 200, { ok: true, message: "If an account exists, an email has been sent." });
  }

  const supabase = supabaseServer();
  const { data: existing } = await supabase.from("users").select("id,email").eq("email", email).maybeSingle();
  if (!existing) {
    return sendJson(res, 200, { ok: true, message: "If an account exists, an email has been sent." });
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 24 * 60 * 60;
  const token = await signToken({ userId: String(existing.id), email, purpose: "verify", iat: now, exp }, process.env.AUTH_TOKEN_SECRET as string);
  const tokenHash = hashToken(token);

  await supabase.from("auth_tokens").insert({
    user_id: existing.id,
    type: "verify_email",
    token_hash: tokenHash,
    expires_at: new Date(exp * 1000).toISOString(),
  });

  try {
    await sendVerificationEmail(email, token);
  } catch (e) {
    console.error("Resend send verify email error", e);
  }

  return sendJson(res, 200, { ok: true });
}