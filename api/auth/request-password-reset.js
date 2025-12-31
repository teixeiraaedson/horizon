const { readJson, sendJson, sendError, requireEnv, supabaseServer, signToken, hashToken, rateLimit, sendResetEmail } = require("../_lib");

module.exports = async function handler(req, res) {
  const envCheck = requireEnv([
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "APP_BASE_URL",
    "AUTH_TOKEN_SECRET",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);
  if (!envCheck.ok) {
    return sendError(res, 500, { code: "ENV_MISSING", message: "Missing env vars", details: envCheck.missing });
  }
  if (req.method !== "POST") return sendError(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });

  const body = await readJson(req);
  const email = String(body?.email || "").trim();
  if (!email) return sendJson(res, 200, { ok: true, message: "If an account exists, an email has been sent." });

  if (!rateLimit(`reset:${email}`, 60_000)) {
    return sendJson(res, 200, { ok: true, message: "If an account exists, an email has been sent." });
  }

  const supabase = supabaseServer();
  const { data: user } = await supabase.from("users").select("id,email").eq("email", email).maybeSingle();
  if (!user) return sendJson(res, 200, { ok: true, message: "If an account exists, an email has been sent." });

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 30 * 60;
  const token = await signToken({ userId: String(user.id), email, purpose: "reset", iat: now, exp }, process.env.AUTH_TOKEN_SECRET);
  const tokenHash = hashToken(token);

  await supabase.from("auth_tokens").insert({
    user_id: user.id,
    type: "reset_password",
    token_hash: tokenHash,
    expires_at: new Date(exp * 1000).toISOString(),
  });

  try {
    await sendResetEmail(email, token);
  } catch (e) {
    console.error("Resend send reset email error", e);
  }

  return sendJson(res, 200, { ok: true });
};