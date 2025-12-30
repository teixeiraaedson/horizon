"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { SettingsConfig } from "@/types/core";

const defaultConfig: SettingsConfig = {
  mockMode:
    (import.meta as any).env?.VITE_MOCK_MODE === "false" ? false : true,
  approvalThresholdUSD:
    Number((import.meta as any).env?.VITE_POLICY_APPROVAL_THRESHOLD_USD) ||
    1000,
  dailyLimitUSD:
    Number((import.meta as any).env?.VITE_POLICY_DAILY_LIMIT_USD) || 10000,
  txLimitUSD: Number((import.meta as any).env?.VITE_POLICY_TX_LIMIT_USD) || 5000,
  timelockStart:
    ((import.meta as any).env?.VITE_POLICY_TIMELOCK_START as string) || "22:00",
  timelockEnd:
    ((import.meta as any).env?.VITE_POLICY_TIMELOCK_END as string) || "06:00",
  whitelistEnabled:
    (import.meta as any).env?.VITE_POLICY_WHITELIST_ENABLED === "true"
      ? true
      : false,
  whitelistedWalletIds: [],
};

type SettingsCtx = {
  settings: SettingsConfig;
  setSettings: (u: Partial<SettingsConfig>) => void;
};

const SettingsContext = createContext<SettingsCtx | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

const STORAGE_KEY = "horizon:settings";

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const initial = useMemo<SettingsConfig>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return { ...defaultConfig, ...JSON.parse(raw) };
      } catch {
        // fall through
      }
    }
    return defaultConfig;
  }, []);

  const [settings, setSettingsState] = useState<SettingsConfig>(initial);

  const setSettings = (u: Partial<SettingsConfig>) => {
    const next = { ...settings, ...u };
    setSettingsState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo(() => ({ settings, setSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};