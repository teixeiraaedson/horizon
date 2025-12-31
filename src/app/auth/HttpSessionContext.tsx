"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ApiUser = {
  id: string;
  email: string;
  role: "user" | "admin";
  email_verified_at: string | null;
};

type HttpSessionCtx = {
  user: ApiUser | null;
  loading: boolean;
};

const Ctx = createContext<HttpSessionCtx | null>(null);

export const HttpSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!mounted) return;
        if (res.ok) {
          const body = await res.json();
          setUser(body?.user ?? null);
        } else {
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useHttpSession = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useHttpSession must be used within HttpSessionProvider");
  return ctx;
};