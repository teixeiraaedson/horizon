"use client";

import { AppSidebarLayout } from "@/components/SidebarNav";
import { AppHeader } from "@/components/AppHeader";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppSidebarLayout>
      <div className="h-[100vh] overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0 bg-background text-foreground">
        <AppHeader />
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </AppSidebarLayout>
  );
};