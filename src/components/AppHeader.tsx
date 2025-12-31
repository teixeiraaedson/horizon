"use client";

import { useAuth } from "@/app/auth/AuthContext";
import { useSettings } from "@/app/settings/SettingsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import logo from "@/assets/horizon-logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchInput } from "@/components/SearchInput";
import { useMockStore } from "@/mock/store";
import { SidebarTrigger } from "@/components/ui/sidebar";

function pageMeta(pathname: string) {
  const base = { title: "Horizon", subtitle: "Treasury Management Suite" };
  if (pathname === "/" || pathname === "/dashboard") return { title: "Dashboard", subtitle: "Treasury operations overview and quick actions" };
  const map: Record<string, { title: string; subtitle: string }> = {
    "/fund": { title: "Fund", subtitle: "Add funds to a wallet" },
    "/send": { title: "Send", subtitle: "Move funds between wallets" },
    "/withdraw": { title: "Withdraw", subtitle: "Withdraw funds to bank" },
    "/release-queue": { title: "Release Queue", subtitle: "Requires a second set of eyes" },
    "/audit": { title: "Audit Trail", subtitle: "Evidence of every decision" },
    "/webhooks": { title: "Webhooks", subtitle: "Issuer simulator and logs" },
    "/wallets": { title: "Wallets", subtitle: "Balances and details" },
    "/settings": { title: "Settings", subtitle: "Configuration and health" },
    "/auth": { title: "Sign in", subtitle: "Demo users" },
  };
  return map[pathname] ?? base;
}

export const AppHeader = () => {
  const { user, switchRole, signOut } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const mock = useMockStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setPendingCount(mock.listPending().data.length);
  }, []);

  const meta = pageMeta(location.pathname);
  const initials = (user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="topbar">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger to open drawer */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <img src={logo} className="h-7 w-auto" alt="Horizon Logo" />
          <div className="leading-tight">
            <div className="font-semibold tracking-wide">Horizon</div>
            <div className="text-xs text-muted-foreground -mt-0.5">Treasury Management Suite</div>
          </div>
          {settings.mockMode && <Badge className="ml-2" variant="secondary">Mock Mode</Badge>}
          <div className="ml-4">
            <div className="text-lg font-semibold">{meta.title}</div>
            <div className="text-xs text-muted-foreground">{meta.subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search transactions..." />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <div className="relative">
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] rounded-full" style={{ backgroundColor: "var(--red)", color: "#0b0f16" }}>
                  {pendingCount}
                </span>
              )}
            </div>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[rgba(148,163,184,0.22)] text-[var(--hz-text)] flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
                <span className="hidden sm:inline">{user?.email ?? "Guest"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => switchRole("user")}>Switch to User</DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole("admin")}>Switch to Admin</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/auth")}>Sign in</DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};