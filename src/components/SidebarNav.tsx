"use client";

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/app/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { navSections } from "@/components/sidebar/nav";
import logo from "@/assets/horizon-logo.png";

// Collapse toggle (compact)
type CollapseToggleProps = { collapsed: boolean; onToggle: () => void };
function CollapseToggle({ collapsed, onToggle }: CollapseToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12px] text-foreground hover:bg-accent/10"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      <span className={collapsed ? "sr-only" : ""}>Collapse</span>
    </button>
  );
}

function SidebarFooterControls() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const onToggle = () => {
    try {
      localStorage.setItem("sidebarCollapsed", collapsed ? "false" : "true");
    } catch {}
    toggleSidebar();
  };
  return <CollapseToggle collapsed={collapsed} onToggle={onToggle} />;
}

// NavLink closes mobile drawer on click; desktop remains unchanged
function NavItemLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <NavLink
      to={to}
      onClick={() => {
        if (isMobile) setOpenMobile(false);
      }}
    >
      {children}
    </NavLink>
  );
}

export const AppSidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Compact item sizing and active styles
  const itemBase = "px-3 py-2 rounded-lg gap-2 text-sm leading-5";
  const itemActive = "bg-slate-800/40 border border-slate-700/40";
  const itemInactive = "border border-transparent hover:bg-slate-900/40 hover:border-slate-700/40";

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="bg-[var(--hz-surface0)] text-[var(--hz-text)] h-[100vh] overflow-y-auto min-w-0 p-2 thin-scrollbar"
        style={{ borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "rgba(148,163,184,0.08)" }}
      >
        <SidebarHeader className="px-2 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Horizon" className="h-5 w-auto" />
              <div className="min-w-0">
                <SidebarGroupLabel className="font-semibold leading-tight tracking-tight">Horizon</SidebarGroupLabel>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Treasury Management Suite</div>
              </div>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarSeparator className="bg-transparent" />
        <SidebarContent>
          {navSections.map((section, idx) => (
            <React.Fragment key={section.id}>
              <SidebarGroup className={cn("mt-1")}>
                <SidebarGroupLabel className="mt-4 mb-2 text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                  {section.label}
                </SidebarGroupLabel>
                <SidebarMenu>
                  {section.items.map((it) => {
                    const active = location.pathname === it.to;
                    return (
                      <SidebarMenuItem key={it.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={it.label}
                          className={cn(itemBase, active ? itemActive : itemInactive)}
                        >
                          <NavItemLink to={it.to}>
                            {React.cloneElement(it.icon as React.ReactElement, { className: "h-4 w-4 text-slate-300" })}
                            <span className="text-[13px] leading-5 font-medium text-slate-200/90 group-data-[collapsible=icon]:hidden">
                              {it.label}
                            </span>
                          </NavItemLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
              {idx < navSections.length - 1 && (
                <div className="px-2 my-2">
                  <SidebarSeparator />
                </div>
              )}
            </React.Fragment>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t border-[color:var(--hz-border)]">
          <div className="p-2 space-y-2">
            {/* Sandbox Mode pill (compact) */}
            <div
              className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[12px]"
              style={{ borderColor: "rgba(245,158,11,0.28)", backgroundColor: "rgba(245,158,11,0.10)" }}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "var(--hz-orange)" }} />
              <span className="text-[color:var(--hz-text)]">Sandbox Mode</span>
            </div>

            <div className="text-xs text-slate-400/80 space-y-2">
              <div className="flex items-center justify-between">
                <span>Signed in as</span>
                <Badge variant="outline">Admin</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate text-slate-200/90">{user?.email ?? "guest@horizon.local"}</span>
                <button
                  className="inline-flex items-center gap-1 text-slate-400/80 hover:text-slate-200/90"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>

            <SidebarFooterControls />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-transparent">{children}</SidebarInset>
    </SidebarProvider>
  );
};