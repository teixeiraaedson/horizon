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

type CollapseToggleProps = { collapsed: boolean; onToggle: () => void };

function CollapseToggle({ collapsed, onToggle }: CollapseToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-auto flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-accent/10"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <ChevronRight className="h-[18px] w-[18px]" /> : <ChevronLeft className="h-[18px] w-[18px]" />}
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

// NavLink that only closes mobile drawer on click; desktop remains unchanged
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

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-[var(--hz-surface0)] text-[var(--hz-text)] border-r border-[var(--hz-border)] h-[100vh] overflow-y-auto min-w-0 p-2">
        <SidebarHeader className="px-2 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <circle cx="9" cy="9" r="7" fill="rgba(56,189,248,0.22)" />
                <circle cx="9" cy="9" r="4" fill="rgba(56,189,248,0.35)" />
              </svg>
              <div>
                <SidebarGroupLabel className="font-semibold leading-tight tracking-tight">Horizon</SidebarGroupLabel>
                <div className="text-[11px] text-[color:var(--hz-muted)]">Treasury Management Suite</div>
              </div>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          {navSections.map((section, idx) => (
            <React.Fragment key={section.id}>
              <SidebarGroup className={cn(idx !== 0 && "mt-1")}>
                <SidebarGroupLabel className="text-xs text-[color:var(--hz-muted)]">{section.label}</SidebarGroupLabel>
                <SidebarMenu>
                  {section.items.map((it) => {
                    const active = location.pathname === it.to;
                    return (
                      <SidebarMenuItem key={it.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={it.label}
                          className={cn(
                            "gap-2 text-sm", // compact labels + tight spacing
                            active ? "sidebar-link-active" : "sidebar-link"
                          )}
                        >
                          <NavItemLink to={it.to}>
                            {React.cloneElement(it.icon as React.ReactElement, { className: "h-[18px] w-[18px] text-inherit" })}
                            <span className="text-inherit group-data-[collapsible=icon]:hidden">{it.label}</span>
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
            {/* Sandbox Mode pill */}
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs"
                 style={{ borderColor: "rgba(245,158,11,0.28)", backgroundColor: "rgba(245,158,11,0.10)" }}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "var(--hz-orange)" }} />
              <span className="text-[color:var(--hz-text)]">Sandbox Mode</span>
            </div>

            <div className="mt-1 text-xs text-[color:var(--hz-muted)] space-y-2">
              <div className="flex items-center justify-between">
                <span>Signed in as</span>
                <Badge variant="outline">Admin</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate">{user?.email ?? "guest@horizon.local"}</span>
                <button
                  className="inline-flex items-center gap-1 text-[color:var(--hz-muted)] hover:text-[color:var(--hz-text)]"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-[18px] w-[18px]" />
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