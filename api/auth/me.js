const { sendJson, sendError, requireEnv, supabaseServer, hashToken, getSessionTokenFromReq } = require("../_lib");

module.exports = async function handler(req, res) {
  try {
    const envCheck = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
    if (!envCheck.ok) {
      res.setHeader("x-hz-auth-me", "env_missing");
      return sendError(res, 500, { code: "ENV_MISSING", message: "Server misconfigured", details: { missing: envCheck.missing } });
    }

    if (req.method !== "GET") {
      res.setHeader("x-hz-auth-me", "method_not_allowed");
      return sendError(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });
    }

    const token = getSessionTokenFromReq(req);
    if (!token) {
      res.setHeader("x-hz-auth-me", "no_cookie");
      return sendJson(res, 401, { user: null });
    }

    const supabase = supabaseServer();
    const sessionHash = hashToken(token);
    const { data: session, error: sessionErr } = await supabase
      .from("sessions")
      .select("id,user_id,expires_at,revoked_at")
      .eq("session_hash", sessionHash)
      .maybeSingle();

    if (sessionErr) {
      console.error("[auth/me] session query error:", sessionErr);
      res.setHeader("x-hz-auth-me", "db_error");
      return sendError(res, 500, { code: "DB_ERROR", message: "Database error", details: sessionErr.message });
    }

    if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
      res.setHeader("x-hz-auth-me", "no_session");
      return sendJson(res, 401, { user: null });
    }

    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id,email,role,email_verified_at")
      .eq("id", session.user_id)
      .maybeSingle();

    if (userErr) {
      console.error("[auth/me] user query error:", userErr);
      res.setHeader("x-hz-auth-me", "db_error");
      return sendError(res, 500, { code: "DB_ERROR", message: "Database error", details: userErr.message });
    }

    if (!user) {
      res.setHeader("x-hz-auth-me", "no_session");
      return sendJson(res, 401, { user: null });
    }

    res.setHeader("x-hz-auth-me", "ok");
    return sendJson(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: !!user.email_verified_at,
        emailVerifiedAt: user.email_verified_at || null,
      },
    });
  } catch (err) {
    console.error("[auth/me]", err && (err.stack || err));
    res.setHeader("x-hz-auth-me", "internal_error");
    return sendError(res, 500, { code: "INTERNAL", message: "Unexpected server error" });
  }
}