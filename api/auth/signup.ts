import { readJson, sendJson, sendError, requireEnv, supabaseServer, signToken, hashToken, meetsRules, hashPassword, sendVerificationEmail } from "../_lib";

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
  const password = String(body?.password || "");

  if (!email || !password) return sendError(res, 400, { code: "BAD_REQUEST", message: "Email and password are required" });
  if (!meetsRules(password)) return sendError(res, 400, { code: "WEAK_PASSWORD", message: "Password does not meet complexity rules." });

  const supabase = supabaseServer();
  const { data: existing } = await supabase.from("users").select("id,email").eq("email", email).maybeSingle();

  let userId = existing?.id as string | undefined;
  if (!existing) {
    const pwHash = await hashPassword(password);
    const { data: created, error: createErr } = await supabase
      .from("users")
      .insert({ email, password_hash: pwHash, role: "user" })
      .select("id")
      .single();
    if (createErr) {
      console.error("signup create user error", createErr);
      return sendError(res, 500, { code: "INTERNAL", message: "Unable to create user." });
    }
    userId = created.id;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 24 * 60 * 60;
  const token = await signToken({ userId: String(userId), email, purpose: "verify", iat: now, exp }, process.env.AUTH_TOKEN_SECRET as string);
  const tokenHash = hashToken(token);

  const { error: tokErr } = await supabase
    .from("auth_tokens")
    .insert({ user_id: userId, type: "verify_email", token_hash: tokenHash, expires_at: new Date(exp * 1000).toISOString() });

  if (tokErr) console.error("signup token insert error", tokErr);

  try {
    await sendVerificationEmail(email, token);
  } catch (e) {
    console.error("Resend send verify email error", e);
  }

  return sendJson(res, 200, { ok: true, message: "Check your email to verify your account." });
}