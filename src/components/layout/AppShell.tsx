"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import { AppSidebarLayout } from "@/components/SidebarNav";
import { AppHeader } from "@/components/AppHeader";

const AppShell = () => {
  return (
    <div className="h-screen overflow-hidden">
      <AppSidebarLayout>
        <div className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
          <AppHeader />
          <div className="px-4 sm:px-6 lg:px-8 py-2 border-b" style={{ borderBottomColor: "rgba(148,163,184,0.08)" }}>
            <div className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs"
              style={{ borderColor: "rgba(245,158,11,0.28)", backgroundColor: "rgba(245,158,11,0.10)" }}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "var(--hz-orange)" }} />
              <span>Sandbox Mode — simulated assets, no real funds</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>
        </div>
      </AppSidebarLayout>
    </div>
  );
};

export default AppShell;