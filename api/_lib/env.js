function requireEnv(keys) {
  const missing = keys.filter((k) => !process.env[k] || String(process.env[k]).trim() === "");
  if (missing.length) return { ok: false, missing };
  return { ok: true };
}

module.exports = { requireEnv };