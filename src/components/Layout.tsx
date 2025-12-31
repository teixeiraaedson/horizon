"use client";

import { AppSidebarLayout } from "@/components/SidebarNav";
import { AppHeader } from "@/components/AppHeader";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppSidebarLayout>
      <div className="h-[100vh] w-full max-w-full min-w-0 overflow-y-auto overflow-x-hidden bg-background text-foreground">
        <AppHeader />
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {children}
        </div>
      </div>
    </AppSidebarLayout>
  );
};