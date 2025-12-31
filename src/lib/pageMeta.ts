"use client";

export type PageMeta = { title: string; subtitle: string };

export function pageMeta(pathname: string): PageMeta {
  const base = { title: "Horizon", subtitle: "Treasury Management Suite" };
  if (pathname === "/" || pathname === "/dashboard") {
    return { title: "Dashboard", subtitle: "Treasury operations overview and quick actions" };
  }
  const map: Record<string, PageMeta> = {
    "/mint": { title: "Mint", subtitle: "Issue new tokens to treasury" },
    "/transfer": { title: "Transfer", subtitle: "Move funds between wallets" },
    "/redeem": { title: "Redeem", subtitle: "Convert to bank" },
    "/policy-rules": { title: "Policy Rules", subtitle: "Review and manage controls" },
    "/wallets": { title: "Wallets", subtitle: "Balances and addresses" },
    "/activity-log": { title: "Activity Log", subtitle: "Events and actions" },
    "/webhooks": { title: "Webhooks", subtitle: "Delivery and retries" },
    "/users": { title: "Users", subtitle: "Access management" },
    "/admin-settings": { title: "Admin Settings", subtitle: "Environment and controls" },
    "/settings": { title: "Settings", subtitle: "Preferences" },
    "/auth": { title: "Sign in", subtitle: "Demo users" },
  };
  return map[pathname] ?? base;
}