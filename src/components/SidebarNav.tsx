"use client";

import React from "react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { LogOut, PanelLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { navSections } from "@/components/sidebar/nav";

export const AppSidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { state, toggleSidebar } = useSidebar();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-[var(--hz-surface0)] text-[var(--hz-text)] border-r border-[var(--hz-border)] h-[100vh] overflow-y-auto min-w-0 p-2">
        <SidebarHeader className="px-2 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Inline brand mark */}
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
                          className={cn(active ? "sidebar-link-active" : "sidebar-link")}
                        >
                          <NavLink to={it.to}>
                            {React.cloneElement(it.icon as React.ReactElement, { className: "h-4 w-4 text-inherit" })}
                            <span className="text-inherit group-data-[collapsible=icon]:hidden">{it.label}</span>
                          </NavLink>
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
            {/* Collapse toggle */}
            <button
              onClick={() => {
                const collapsedNext = state === "expanded";
                // Persist collapsed state in localStorage for UX parity
                try {
                  localStorage.setItem("sidebarCollapsed", collapsedNext ? "true" : "false");
                } catch {}
                toggleSidebar();
              }}
              className="w-full text-left text-[12px] px-3 py-2 rounded-lg border border-[color:var(--hz-border)] bg-[rgba(148,163,184,0.08)] hover:border-[color:var(--hz-border-strong)] card-sheen inline-flex items-center gap-2"
            >
              <PanelLeft className="h-4 w-4" />
              <span>Collapse</span>
            </button>

            {/* Signed in block */}
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