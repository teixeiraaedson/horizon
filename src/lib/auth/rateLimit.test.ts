"use client";

import { describe, it, expect } from "vitest";
import { canSend } from "./rateLimit";

describe("rate limiting", () => {
  it("allows first request", () => {
    const ok = canSend("email:e@example.com", 1000);
    expect(ok).toBe(true);
  });
  it("blocks immediate subsequent request", () => {
    void canSend("email:e@example.com", 1000);
    const ok = canSend("email:e@example.com", 1000);
    expect(ok).toBe(false);
  });
});