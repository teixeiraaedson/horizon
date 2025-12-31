"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type SupabaseSessionCtx = {
  user: User | null;
  loading: boolean;
};

const Ctx = createContext<SupabaseSessionCtx | null>(null);

export const SupabaseSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("supabase.auth.getUser error", error);
      }
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[auth:onAuthStateChange]", event, { hasSession: !!session });
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useSupabaseSession = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSupabaseSession must be used within SupabaseSessionProvider");
  return ctx;
};