"use client";

import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "./tokens";

const secret = "test_secret_32_chars_minimum_for_hmac_token";

describe("auth tokens", () => {
  it("signs and verifies a verification token", async () => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60;
    const token = await signToken({ userId: "u1", email: "e@example.com", purpose: "verify", iat: now, exp }, secret);
    const payload = await verifyToken(token, secret);
    expect(payload.userId).toBe("u1");
    expect(payload.email).toBe("e@example.com");
    expect(payload.purpose).toBe("verify");
  });

  it("fails verification when secret mismatches", async () => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60;
    const token = await signToken({ userId: "u2", email: "x@example.com", purpose: "reset", iat: now, exp }, secret);
    await expect(verifyToken(token, "wrong_secret")).rejects.toBeDefined();
  });

  it("expires based on exp claim", async () => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now - 1; // already expired
    const token = await signToken({ userId: "u3", email: "t@example.com", purpose: "verify", iat: now, exp }, secret);
    await expect(verifyToken(token, secret)).rejects.toBeDefined();
  });
});