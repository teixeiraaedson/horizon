"use client";

import { AppSidebarLayout } from "@/components/SidebarNav";
import { AppHeader } from "@/components/AppHeader";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppSidebarLayout>
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="p-4">
          {children}
        </div>
      </div>
    </AppSidebarLayout>
  );
};