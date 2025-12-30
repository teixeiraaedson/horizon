"use client";

import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Landmark, ArrowRightLeft, Wallet, ShieldCheck, FileText, Webhook, Settings, LogOut } from "lucide-react";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { Badge } from "@/components/ui/badge";

type Item = { to: string; label: string; icon: ReactNode };

const items: Item[] = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/fund", label: "Fund", icon: <Landmark className="h-4 w-4" /> },
  { to: "/send", label: "Send", icon: <ArrowRightLeft className="h-4 w-4" /> },
  { to: "/withdraw", label: "Withdraw", icon: <ArrowRightLeft className="h-4 w-4 rotate-90" /> },
  { to: "/release-queue", label: "Release Queue", icon: <ShieldCheck className="h-4 w-4" /> },
  { to: "/audit", label: "Audit Trail", icon: <FileText className="h-4 w-4" /> },
  { to: "/webhooks", label: "Webhooks", icon: <Webhook className="h-4 w-4" /> },
  { to: "/wallets", label: "Wallets", icon: <Wallet className="h-4 w-4" /> },
  { to: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export const AppSidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-[var(--surface0)] border-r border-[var(--border)]">
        <SidebarHeader className="px-2 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <SidebarGroupLabel className="font-semibold leading-tight">Horizon</SidebarGroupLabel>
              <div className="text-[11px] text-muted-foreground">Treasury Management Suite</div>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup className="mt-1">
            <SidebarMenu>
              {items.map((it) => {
                const active = location.pathname === it.to;
                return (
                  <SidebarMenuItem key={it.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={active ? "nav-pill-active" : ""}
                    >
                      <NavLink to={it.to}>
                        {it.icon}
                        <span>{it.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-[var(--border)]">
          <div className="p-2">
            <button className="w-full text-left text-[12px] px-3 py-2 rounded-md border border-[var(--border)] hover:border-[var(--borderHover)] card-sheen" style={{ color: "var(--orange)" }}>
              • Sandbox Mode
            </button>
            <div className="mt-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Signed in as</span>
                <Badge variant="outline">{user?.role ?? "guest"}</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="truncate">{user?.email ?? "guest"}</span>
                <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-transparent">{children}</SidebarInset>
    </SidebarProvider>
  );
};