"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { AppUser, AppUserRole } from "@/types/core";

type AuthCtx = {
  user: AppUser | null;
  signInMock: (email: string, role?: AppUserRole) => void;
  signOut: () => void;
  switchRole: (role: AppUserRole) => void;

  // New helpers
  signUp: (email: string, password: string, role?: AppUserRole) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  verify: (email: string) => void;
  forgotPassword: (email: string) => { ok: boolean; token?: string };
  resetPassword: (token: string, newPassword: string) => { ok: boolean; error?: string };
};

const AuthContext = createContext<AuthCtx | null>(null);

const STORAGE_KEY = "horizon:auth";
const USERS_KEY = "horizon:auth_users";
const RESET_KEY = "horizon:reset_tokens";
const DEV_VERIFY_SIMULATE = (import.meta as any).env?.VITE_DEV_VERIFY_SIMULATE ?? "true";

function newId() {
  return crypto.randomUUID();
}

function getUsers(): Record<string, { id: string; email: string; role: AppUserRole; verified: boolean; password: string }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setUsers(users: Record<string, any>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(u: AppUser | null) {
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(STORAGE_KEY);
}

function passwordMeetsRules(pw: string): boolean {
  const minLen = pw.length >= 12;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const num = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return minLen && upper && lower && num && special;
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
    // Default demo user (verified)
    const demo: AppUser = {
      id: newId(),
      email: "user@demo.horizon",
      role: "user",
      verified: true,
    } as AppUser;
    setCurrentUser(demo);
    const users = getUsers();
    users[demo.email] = { id: demo.id, email: demo.email, role: "user", verified: true, password: "DemoPassw0rd!" };
    setUsers(users);
    return demo;
  });

  const signInMock = (email: string, role: AppUserRole = "user") => {
    const users = getUsers();
    const existing = users[email];
    const uRec = existing ?? { id: newId(), email, role, verified: true, password: "DemoPassw0rd!" };
    users[email] = uRec;
    setUsers(users);
    const u: AppUser = { id: uRec.id, email: uRec.email, role: uRec.role, verified: uRec.verified } as AppUser;
    setCurrentUser(u);
    setUser(u);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const switchRole = (role: AppUserRole) => {
    if (!user) return;
    const next = { ...user, role };
    setCurrentUser(next);
    setUser(next);
    const users = getUsers();
    const rec = users[user.email];
    if (rec) {
      rec.role = role;
      users[user.email] = rec;
      setUsers(users);
    }
  };

  const signUp = (email: string, password: string, role: AppUserRole = "user") => {
    if (!passwordMeetsRules(password)) {
      return { ok: false, error: "Password does not meet complexity rules." };
    }
    const users = getUsers();
    if (users[email]) {
      return { ok: false, error: "User already exists." };
    }
    const rec = { id: newId(), email, role, verified: false, password };
    users[email] = rec;
    setUsers(users);
    // Set current user (unverified)
    const u: AppUser = { id: rec.id, email: rec.email, role: rec.role, verified: false } as AppUser;
    setCurrentUser(u);
    setUser(u);
    return { ok: true };
  };

  const login = (email: string, password: string) => {
    const users = getUsers();
    const rec = users[email];
    if (!rec) return { ok: false, error: "User not found." };
    if (rec.password !== password) return { ok: false, error: "Invalid credentials." };
    const u: AppUser = { id: rec.id, email: rec.email, role: rec.role, verified: rec.verified } as AppUser;
    setCurrentUser(u);
    setUser(u);
    return { ok: true };
  };

  const verify = (email: string) => {
    const users = getUsers();
    const rec = users[email];
    if (!rec) return;
    rec.verified = true;
    users[email] = rec;
    setUsers(users);
    if (user && user.email === email) {
      const u: AppUser = { ...user, verified: true } as AppUser;
      setCurrentUser(u);
      setUser(u);
    }
  };

  const forgotPassword = (email: string) => {
    const users = getUsers();
    const rec = users[email];
    if (!rec) return { ok: false };
    const token = crypto.randomUUID();
    const tokensRaw = localStorage.getItem(RESET_KEY);
    const tokens = tokensRaw ? JSON.parse(tokensRaw) : {};
    tokens[token] = email;
    localStorage.setItem(RESET_KEY, JSON.stringify(tokens));
    return { ok: true, token };
  };

  const resetPassword = (token: string, newPassword: string) => {
    if (!passwordMeetsRules(newPassword)) {
      return { ok: false, error: "Password does not meet complexity rules." };
    }
    const tokensRaw = localStorage.getItem(RESET_KEY);
    const tokens = tokensRaw ? JSON.parse(tokensRaw) : {};
    const email = tokens[token];
    if (!email) return { ok: false, error: "Invalid reset token." };
    const users = getUsers();
    const rec = users[email];
    if (!rec) return { ok: false, error: "User not found." };
    rec.password = newPassword;
    users[email] = rec;
    setUsers(users);
    delete tokens[token];
    localStorage.setItem(RESET_KEY, JSON.stringify(tokens));
    return { ok: true };
  };

  const value = useMemo(
    () => ({ user, signInMock, signOut, switchRole, signUp, login, verify, forgotPassword, resetPassword }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};