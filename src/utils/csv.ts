export function downloadCSV<T extends Record<string, any>>(rows: T[], filename: string) {
  if (!rows.length) return;
  const cols = Array.from(
    rows.reduce<Set<string>>((s, r) => {
      Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, new Set<string>())
  );
  const escape = (v: any) => {
    if (v == null) return "";
    const s = String(typeof v === "object" ? JSON.stringify(v) : v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => escape(r[c])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Pure CSV generator for tests and internal use
export function toCSV(rows: Record<string, any>[], columns: string[]) {
  const escape = (v: any) => {
    if (v == null) return "";
    const s = String(typeof v === "object" ? JSON.stringify(v) : v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.join(",");
  const body = rows.map(r => columns.map(c => escape(r[c])).join(",")).join("\n");
  return header + "\n" + body;
}