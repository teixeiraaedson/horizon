const { sendJson, sendError, requireEnv, supabaseServer, hashToken, clearSessionCookie, getSessionTokenFromReq } = require("../_lib");

module.exports = async function handler(req, res) {
  const envCheck = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  if (!envCheck.ok) {
    return sendError(res, 500, { code: "ENV_MISSING", message: "Missing env vars", details: envCheck.missing });
  }
  if (req.method !== "POST") return sendError(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });

  const token = getSessionTokenFromReq(req);
  if (token) {
    const supabase = supabaseServer();
    const sessionHash = hashToken(token);
    await supabase.from("sessions").update({ revoked_at: new Date().toISOString() }).eq("session_hash", sessionHash);
  }
  clearSessionCookie(res);
  return sendJson(res, 200, { ok: true });
};