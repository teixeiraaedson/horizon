"use client";

import type { UUID } from "@/types/core";
import { addActivity } from "@/lib/mockActivity";

export type MockUser = {
  id: UUID;
  email: string;
  role: "admin" | "user";
  status: "active" | "invited";
};

function rid(): UUID {
  return (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2) as UUID;
}

type StoreShape = { users: MockUser[] };
function ensureStore(): StoreShape {
  const w = window as any;
  if (!w.__horizon_users) {
    w.__horizon_users = {
      users: [
        { id: rid(), email: "admin@horizon.local", role: "admin", status: "active" },
        { id: rid(), email: "user@horizon.local", role: "user", status: "active" },
      ],
    } as StoreShape;
  }
  return w.__horizon_users as StoreShape;
}

export function getUsers(): MockUser[] {
  return ensureStore().users;
}

export function inviteUser(email: string, role: "admin" | "user"): MockUser {
  const store = ensureStore();
  const u: MockUser = { id: rid(), email, role, status: "invited" };
  store.users.push(u);
  addActivity({ actor: email, action: "User Invited", entity: "users", status: "invited" });
  return u;
}