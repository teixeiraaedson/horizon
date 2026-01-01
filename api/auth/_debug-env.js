const { sendJson, requireEnv } = require("../_lib");

module.exports = async function handler(req, res) {
  const keys = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "APP_BASE_URL",
    "AUTH_TOKEN_SECRET",
  ];
  const check = requireEnv(keys);
  if (check.ok) {
    return sendJson(res, 200, { ok: true });
  } else {
    return sendJson(res, 200, { ok: false, missing: check.missing });
  }
}