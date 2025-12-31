import { describe, it, expect } from "vitest";
import { toCSV } from "@/utils/csv";

describe("CSV export utility", () => {
  it("preserves column order", () => {
    const rows = [{ a: 1, b: 2 }, { a: 3, b: 4 }];
    const csv = toCSV(rows, ["b", "a"]);
    const [header, ...body] = csv.split("\n");
    expect(header).toBe("b,a");
    expect(body[0]).toBe("2,1");
    expect(body[1]).toBe("4,3");
  });

  it("escapes commas, quotes, and newlines", () => {
    const rows = [{ msg: 'Hello, "World"\nNext' }];
    const csv = toCSV(rows, ["msg"]);
    const [header, line] = csv.split("\n");
    expect(header).toBe("msg");
    expect(line).toBe('"Hello, ""World""\nNext"');
  });

  it("handles empty values", () => {
    const rows = [{ a: null, b: undefined, c: "" }];
    const csv = toCSV(rows, ["a", "b", "c"]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("a,b,c");
    expect(lines[1]).toBe(",,");
  });
});