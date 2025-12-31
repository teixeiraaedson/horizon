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
    "/redeem": { title: "Redeem", subtitle: "Convert to fiat / withdraw to bank" },
    "/policy-rules": { title: "Policy Rules", subtitle: "Constraints and approvals for movements" },
    "/activity-log": { title: "Activity Log", subtitle: "System actions and changes" },
    "/webhooks": { title: "Webhooks", subtitle: "Issuer simulator and logs" },
    "/wallets": { title: "Wallets", subtitle: "Balances and details" },
    "/users": { title: "Users", subtitle: "Accounts and roles" },
    "/admin-settings": { title: "Admin Settings", subtitle: "Administrative configuration" },
    "/settings": { title: "Settings", subtitle: "Console configuration and health" },
    "/auth": { title: "Sign in", subtitle: "Demo users" },
  };
  return map[pathname] ?? base;
}