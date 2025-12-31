"use client";

import { ReactNode } from "react";
import {
  LayoutDashboard,
  Landmark,
  ArrowRightLeft,
  Wallet,
  ShieldCheck,
  FileText,
  Webhook,
  Users,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

export type NavSection = {
  id: "core" | "ops" | "admin";
  label: string;
  items: NavItem[];
};

/**
 * Lovable-style sections and items.
 * Routes are aliased to existing pages:
 * - Mint -> /fund
 * - Transfer -> /send
 * - Redeem -> /withdraw
 * - Policy Rules -> /release-queue
 * - Activity Log -> /audit
 * - Users -> /auth
 * - Admin Settings -> /settings
 */
export const navSections: NavSection[] = [
  {
    id: "core",
    label: "Core",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: "Mint", to: "/fund", icon: <Landmark className="h-4 w-4" /> },
      { label: "Transfer", to: "/send", icon: <ArrowRightLeft className="h-4 w-4" /> },
      { label: "Redeem", to: "/withdraw", icon: <ArrowRightLeft className="h-4 w-4 rotate-90" /> },
      { label: "Policy Rules", to: "/release-queue", icon: <ShieldCheck className="h-4 w-4" /> },
    ],
  },
  {
    id: "ops",
    label: "Ops",
    items: [
      { label: "Wallets", to: "/wallets", icon: <Wallet className="h-4 w-4" /> },
      { label: "Activity Log", to: "/audit", icon: <FileText className="h-4 w-4" /> },
      { label: "Webhooks", to: "/webhooks", icon: <Webhook className="h-4 w-4" /> },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { label: "Users", to: "/auth", icon: <Users className="h-4 w-4" /> },
      { label: "Admin Settings", to: "/settings", icon: <Settings className="h-4 w-4" /> },
      { label: "Settings", to: "/settings", icon: <Settings className="h-4 w-4" /> },
    ],
  },
];