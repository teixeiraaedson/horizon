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
  sendJson(res, code, { error });
}

module.exports = { readJson, sendJson, sendError };