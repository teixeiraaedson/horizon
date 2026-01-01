module.exports = async function handler(req, res) {
  try {
    const hasResend = (() => {
      try {
        require.resolve("resend");
        return true;
      } catch {
        return false;
      }
    })();

    const envPresent = {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: !!process.env.RESEND_FROM_EMAIL,
      APP_BASE_URL: !!process.env.APP_BASE_URL,
    };

    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json");
    }
    const payload = {
      ok: true,
      node: process.version,
      apiModuleType: "commonjs",
      hasResend,
      envPresent
    };
    return res.end(JSON.stringify(payload));
  } catch (err) {
    console.error("[auth/_debug-runtime]", err && (err.stack || err));
    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json");
    }
    res.status?.(500);
    return res.end(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Runtime debug failed" } }));
  }
}