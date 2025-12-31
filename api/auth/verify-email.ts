import { sendJson, sendError, requireEnv, supabaseServer, hashToken, verifyToken, setSessionCookie, randomSessionToken } from "../_lib";

export default async function handler(req: any, res: any) {
  const envCheck = requireEnv(["AUTH_TOKEN_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  if (!("ok" in envCheck) || envCheck.ok === false) {
    return sendError(res, 500, { code: "ENV_MISSING", message: "Missing env vars", details: envCheck.missing });
  }

  if (req.method !== "GET") return sendError(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });

  const token =
    (req.query?.token as string) ||
    ((() => {
      try {
        const u = new URL(req.url || "", "http://localhost");
        return u.searchParams.get("token") || "";
      } catch {
        return "";
      }
    })());

  if (!token) return sendError(res, 400, { code: "BAD_REQUEST", message: "Missing token" });

  let payload;
  try {
    payload = await verifyToken(token, process.env.AUTH_TOKEN_SECRET as string);
  } catch {
    return sendError(res, 400, { code: "INVALID_TOKEN", message: "Invalid or expired token." });
  }
  if (payload.purpose !== "verify") {
    return sendError(res, 400, { code: "INVALID_PURPOSE", message: "Invalid token purpose." });
  }

  const tokenHash = hashToken(token);
  const supabase = supabaseServer();
  const { data: tok } = await supabase
    .from("auth_tokens")
    .select("id,user_id,type,expires_at,used_at")
    .eq("token_hash", tokenHash)
    .eq("type", "verify_email")
    .maybeSingle();

  if (!tok || tok.used_at || new Date(tok.expires_at) < new Date()) {
    return sendError(res, 400, { code: "INVALID_TOKEN", message: "Invalid or expired token." });
  }

  await supabase.from("auth_tokens").update({ used_at: new Date().toISOString() }).eq("id", tok.id);
  await supabase.from("users").update({ email_verified_at: new Date().toISOString() }).eq("id", tok.user_id);

  const rawSession = randomSessionToken();
  const sessionHash = hashToken(rawSession);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("sessions").insert({ user_id: tok.user_id, session_hash: sessionHash, expires_at: expiresAt });
  setSessionCookie(res, rawSession, 7 * 24 * 60 * 60);

  return sendJson(res, 200, { ok: true });
}