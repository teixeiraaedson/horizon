import { readJson, sendJson, sendError, requireEnv, supabaseServer, verifyToken, hashToken, meetsRules, hashPassword } from "../_lib";

export default async function handler(req: any, res: any) {
  const envCheck = requireEnv(["AUTH_TOKEN_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  if (!("ok" in envCheck) || envCheck.ok === false) {
    return sendError(res, 500, { code: "ENV_MISSING", message: "Missing env vars", details: envCheck.missing });
  }

  if (req.method !== "POST") return sendError(res, 405, { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" });

  const body = await readJson(req);
  const token = String(body?.token || "");
  const newPassword = String(body?.newPassword || "");
  if (!token || !newPassword) return sendError(res, 400, { code: "BAD_REQUEST", message: "Token and newPassword are required." });
  if (!meetsRules(newPassword)) return sendError(res, 400, { code: "WEAK_PASSWORD", message: "Password does not meet complexity rules." });

  let payload;
  try {
    payload = await verifyToken(token, process.env.AUTH_TOKEN_SECRET as string);
  } catch {
    return sendError(res, 400, { code: "INVALID_TOKEN", message: "Invalid or expired token." });
  }
  if (payload.purpose !== "reset") {
    return sendError(res, 400, { code: "INVALID_PURPOSE", message: "Invalid token purpose." });
  }

  const tokenHash = hashToken(token);
  const supabase = supabaseServer();
  const { data: tok } = await supabase
    .from("auth_tokens")
    .select("id,user_id,type,expires_at,used_at")
    .eq("token_hash", tokenHash)
    .eq("type", "reset_password")
    .maybeSingle();

  if (!tok || tok.used_at || new Date(tok.expires_at) < new Date()) {
    return sendError(res, 400, { code: "INVALID_TOKEN", message: "Invalid or expired token." });
  }

  const pwHash = await hashPassword(newPassword);
  await supabase.from("users").update({ password_hash: pwHash }).eq("id", tok.user_id);
  await supabase.from("auth_tokens").update({ used_at: new Date().toISOString() }).eq("id", tok.id);
  await supabase.from("sessions").update({ revoked_at: new Date().toISOString() }).eq("user_id", tok.user_id);

  return sendJson(res, 200, { ok: true });
}