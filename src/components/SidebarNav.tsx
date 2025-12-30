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
      <Sidebar collapsible="icon" className="bg-[var(--surface-1)] border-r border-[var(--border-soft)]">
        <SidebarHeader className="flex items-center justify-between">
          <SidebarGroupLabel className="font-semibold">Horizon</SidebarGroupLabel>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
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
        <SidebarFooter className="border-t border-[var(--border-soft)]">
          <div className="p-2 text-xs text-muted-foreground">
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
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-[var(--bg)]">{children}</SidebarInset>
    </SidebarProvider>
  );
};