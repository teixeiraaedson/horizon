"use client";

const map = new Map<string, number>();

export function canSend(key: string, cooldownMs = 60_000): boolean {
  const now = Date.now();
  const last = map.get(key) || 0;
  if (now - last < cooldownMs) return false;
  map.set(key, now);
  return true;
}