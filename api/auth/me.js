const { sendJson, sendError, requireEnv, supabaseServer, hashToken, getSessionTokenFromReq } = require("../_lib");

module.exports = async function handler(req, res) {
  const envCheck = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  if (!envCheck.ok) {
    return sendError(res, 500, { code: "ENV_MISSING", message: "Missing env vars", details: envCheck.missing });
  }
  if (req.method !== "GET") return sendError(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });

  const token = getSessionTokenFromReq(req);
  if (!token) return sendJson(res, 200, { user: null });

  const supabase = supabaseServer();
  const sessionHash = hashToken(token);
  const { data: session } = await supabase
    .from("sessions")
    .select("id,user_id,expires_at,revoked_at")
    .eq("session_hash", sessionHash)
    .maybeSingle();
  if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
    return sendJson(res, 200, { user: null });
  }

  const { data: user } = await supabase.from("users").select("id,email,role,email_verified_at").eq("id", session.user_id).maybeSingle();
  return sendJson(res, 200, { user: user ? { ...user } : null });
};