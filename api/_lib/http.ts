export type ApiReq = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, any>;
  body?: any;
  url?: string;
};

export type ApiRes = {
  status: (code: number) => ApiRes;
  json: (data: any) => void;
  setHeader: (k: string, v: any) => void;
  end: (body?: any) => void;
};

export async function readJson(req: any): Promise<any> {
  if (req && typeof req.body === "object" && req.body !== null) {
    return req.body;
  }
  return new Promise((resolve) => {
    let data = "";
    try {
      req.on("data", (chunk: any) => {
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

export function sendJson(res: any, code: number, payload: any) {
  try {
    res.status(code);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
  } catch {
    // Fallback if res.status doesn't exist
    res.setHeader?.("Content-Type", "application/json");
    res.end?.(JSON.stringify(payload));
  }
}

export function sendError(res: any, code: number, error: { code: string; message: string; details?: any }) {
  sendJson(res, code, { error });
}