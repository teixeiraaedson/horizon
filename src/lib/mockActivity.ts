"use client";

import type { UUID, AuditEvent } from "@/types/core";

export type ActivityEntry = {
  id: UUID;
  time: string;
  actor: string;
  action: string;
  entity: string;
  status: string;
};

// Helpers
function rid(): UUID {
  // crypto.randomUUID is widely available; fallback for older browsers
  return (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2) as UUID;
}
function now(): string {
  return new Date().toISOString();
}

type StoreShape = { entries: ActivityEntry[] };
function ensureStore(): StoreShape {
  const w = window as any;
  if (!w.__horizon_activity) {
    w.__horizon_activity = { entries: [] } as StoreShape;
  }
  return w.__horizon_activity as StoreShape;
}

// Map mock store audit events into ActivityEntry for display
function mapAuditToEntry(ev: AuditEvent): ActivityEntry {
  const actionMap: Record<AuditEvent["action"], string> = {
    TX_CREATED: "Transaction Created",
    POLICY_EVALUATED: "Policy Evaluated",
    TX_APPROVED: "Transaction Approved",
    TX_REJECTED: "Transaction Rejected",
    WEBHOOK_INGESTED: "Webhook Ingested",
    BALANCE_UPDATED: "Balance Updated",
  };
  // Derive a basic status label
  const status =
    ev.action === "TX_APPROVED" ? "approved" :
    ev.action === "TX_REJECTED" ? "rejected" :
    ev.action === "TX_CREATED" ? "created" :
    ev.action === "WEBHOOK_INGESTED" ? "ingested" :
    ev.action === "BALANCE_UPDATED" ? "updated" :
    "policy";
  return {
    id: ev.id,
    time: ev.createdAt,
    actor: ev.actorEmail || ev.actorId || "system",
    action: actionMap[ev.action],
    entity: ev.resource,
    status,
  };
}

// Public API
export function getActivity(): ActivityEntry[] {
  const local = ensureStore().entries;
  const db = (window as any).__horizon_db;
  const audit: ActivityEntry[] = Array.isArray(db?.audit)
    ? (db.audit as AuditEvent[]).map(mapAuditToEntry)
    : [];
  // merge and sort newest first
  return [...local, ...audit].sort((a, b) => (a.time < b.time ? 1 : -1));
}

export function addActivity(entry: Omit<ActivityEntry, "id" | "time">): ActivityEntry {
  const store = ensureStore();
  const newEntry: ActivityEntry = { id: rid(), time: now(), ...entry };
  store.entries.push(newEntry);
  return newEntry;
}

// Convenience helpers
export function logLogin(actor: string) {
  addActivity({ actor, action: "Login", entity: "auth", status: "success" });
}