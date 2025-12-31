"use client";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { signToken, verifyToken } from "./tokens";
import { meetsRules, hashPassword, comparePassword } from "./password";

const secret = "test_secret_32_chars_minimum_for_hmac_token";

describe("password helpers", () => {
  it("validates strong passwords", () => {
    expect(meetsRules("Weak")).toBe(false);
    expect(meetsRules("DemoPassw0rd!")).toBe(true);
  });
  it("hash and compare", async () => {
    const hash = await hashPassword("DemoPassw0rd!");
    const ok = await comparePassword("DemoPassw0rd!", hash);
    expect(ok).toBe(true);
  });
});

describe("token roundtrip", () => {
  it("signs and verifies payload correctly", async () => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 120;
    const token = await signToken({ userId: "u99", email: "a@b.c", purpose: "verify", iat: now, exp }, secret);
    const payload = await verifyToken(token, secret);
    expect(payload.userId).toBe("u99");
    expect(payload.purpose).toBe("verify");
  });
});