const { readJson, sendJson, sendError, requireEnv, supabaseServer, comparePassword, hashToken, setSessionCookie, randomSessionToken } = require("../_lib");

module.exports = async function handler(req, res) {
  const envCheck = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  if (!envCheck.ok) {
    return sendError(res, 500, { code: "ENV_MISSING", message: "Missing env vars", details: envCheck.missing });
  }
  if (req.method !== "POST") return sendError(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });

  const body = await readJson(req);
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "");
  if (!email || !password) return sendError(res, 400, { code: "BAD_REQUEST", message: "Email and password are required" });

  const supabase = supabaseServer();
  const { data: user } = await supabase
    .from("users")
    .select("id,email,password_hash,email_verified_at,role")
    .eq("email", email)
    .maybeSingle();

  if (!user) return sendError(res, 401, { code: "INVALID_CREDENTIALS", message: "Invalid credentials." });
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) return sendError(res, 401, { code: "INVALID_CREDENTIALS", message: "Invalid credentials." });

  if (!user.email_verified_at) {
    return sendError(res, 403, { code: "EMAIL_NOT_VERIFIED", message: "Email not verified." });
  }

  const rawSession = randomSessionToken();
  const sessionHash = hashToken(rawSession);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("sessions").insert({ user_id: user.id, session_hash: sessionHash, expires_at: expiresAt });
  setSessionCookie(res, rawSession, 7 * 24 * 60 * 60);

  return sendJson(res, 200, { ok: true });
};