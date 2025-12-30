"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { AppUser, AppUserRole } from "@/types/core";

type AuthCtx = {
  user: AppUser | null;
  signInMock: (email: string, role?: AppUserRole) => void;
  signOut: () => void;
  switchRole: (role: AppUserRole) => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

const STORAGE_KEY = "horizon:auth";

function newId() {
  return crypto.randomUUID();
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as AppUser;
      } catch {
        return null;
      }
    }
    // Default demo user
    const demo: AppUser = {
      id: newId(),
      email: "user@demo.horizon",
      role: "user",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    return demo;
  });

  const signInMock = (email: string, role: AppUserRole = "user") => {
    const u: AppUser = { id: newId(), email, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const switchRole = (role: AppUserRole) => {
    if (!user) return;
    const next = { ...user, role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  };

  const value = useMemo(() => ({ user, signInMock, signOut, switchRole }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};