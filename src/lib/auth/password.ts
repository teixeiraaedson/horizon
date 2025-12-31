"use client";

import bcrypt from "bcryptjs";

export function meetsRules(pw: string): boolean {
  const minLen = pw.length >= 12;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const num = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return minLen && upper && lower && num && special;
}

export async function hashPassword(pw: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pw, salt);
}

export async function comparePassword(pw: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(pw, hash);
}