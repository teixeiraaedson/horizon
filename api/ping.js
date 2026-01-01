module.exports = async function handler(req, res) {
  try {
    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json");
    }
    const payload = { ok: true, ts: Date.now(), node: process.version };
    if (typeof res.status === "function") res.status(200);
    return res.end(JSON.stringify(payload));
  } catch (err) {
    console.error("[api/ping]", err && (err.stack || err));
    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json");
    }
    if (typeof res.status === "function") res.status(500);
    return res.end(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Ping failed" } }));
  }
}