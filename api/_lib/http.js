function readJson(req) {
  if (req && typeof req.body === "object" && req.body !== null) {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve) => {
    let data = "";
    try {
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        if (!data) return resolve({});
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch {
          resolve({});
        }
      });
    } catch {
      resolve({});
    }
  });
}

function parseCookies(req) {
  try {
    const header = (req && req.headers && req.headers.cookie) || "";
    if (!header) return {};
    const parts = header.split(";").map((v) => v.trim()).filter(Boolean);
    const out = {};
    for (const part of parts) {
      const idx = part.indexOf("=");
      if (idx === -1) continue;
      const k = part.slice(0, idx);
      const v = part.slice(idx + 1);
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function sendJson(res, code, payload) {
  try {
    if (typeof res.status === "function") res.status(code);
    if (typeof res.setHeader === "function") res.setHeader("Content-Type", "application/json");
    if (typeof res.end === "function") res.end(JSON.stringify(payload));
  } catch {
    // Best-effort fallback
    try { res.setHeader("Content-Type", "application/json"); } catch {}
    try { res.end(JSON.stringify(payload)); } catch {}
  }
}

function sendError(res, code, error) {
  // ALWAYS JSON
  sendJson(res, code, { error });
}

module.exports = { readJson, parseCookies, sendJson, sendError };