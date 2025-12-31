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
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>
        </div>
      </AppSidebarLayout>
    </div>
  );
};

export default AppShell;