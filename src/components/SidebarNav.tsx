"use client";

import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
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
import { LayoutDashboard, Landmark, ArrowRightLeft, Wallet, ShieldCheck, FileText, Webhook, Settings } from "lucide-react";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

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
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-between">
          <SidebarGroupLabel className="font-semibold">Horizon</SidebarGroupLabel>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.to}>
                  <SidebarMenuButton asChild isActive={location.pathname === it.to}>
                    <NavLink to={it.to}>
                      {it.icon}
                      <span>{it.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};