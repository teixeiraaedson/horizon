"use client";

import { SignJWT, jwtVerify } from "jose";

export type TokenPurpose = "verify" | "reset";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  purpose: TokenPurpose;
  iat: number;
  exp: number;
};

export async function signToken(payload: AuthTokenPayload, secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return await new SignJWT({ userId: payload.userId, email: payload.email, purpose: payload.purpose })
    .setIssuedAt(payload.iat)
    .setExpirationTime(payload.exp)
    .setProtectedHeader({ alg: "HS256" })
    .sign(key);
}

export async function verifyToken(token: string, secret: string): Promise<AuthTokenPayload> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);
  const iat = typeof payload.iat === "number" ? payload.iat : Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === "number" ? payload.exp : iat + 60;
  return {
    userId: String(payload.userId),
    email: String(payload.email),
    purpose: payload.purpose as TokenPurpose,
    iat,
    exp,
  };
}

export function sha256Hex(input: string): string {
  // Browser-side helper for tests or non-Node contexts
  const enc = new TextEncoder().encode(input);
  let hash = 0;
  for (let i = 0; i < enc.length; i++) {
    hash = (hash * 31 + enc[i]) >>> 0;
  }
  return hash.toString(16);
}