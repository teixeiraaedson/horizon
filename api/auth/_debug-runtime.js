module.exports = async function handler(req, res) {
  try {
    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json");
    }
    const env = process.env || {};
    const payload = {
      ok: true,
      node: process.version,
      hasEnv: {
        RESEND_API_KEY: !!env.RESEND_API_KEY,
        RESEND_FROM_EMAIL: !!env.RESEND_FROM_EMAIL,
        APP_BASE_URL: !!env.APP_BASE_URL,
        SUPABASE_URL: !!env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!env.SUPABASE_SERVICE_ROLE_KEY,
        DATABASE_URL: !!env.DATABASE_URL
      }
    };
    if (typeof res.status === "function") res.status(200);
    return res.end(JSON.stringify(payload));
  } catch (err) {
    console.error("[auth/_debug-runtime]", err && (err.stack || err));
    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json");
    }
    if (typeof res.status === "function") res.status(500);
    return res.end(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Runtime debug failed" } }));
  }
}