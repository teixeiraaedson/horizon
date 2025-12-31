"use client";

import { AppSidebarLayout } from "@/components/SidebarNav";
import { AppHeader } from "@/components/AppHeader";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppSidebarLayout>
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full">
          {children}
        </div>
      </div>
    </AppSidebarLayout>
  );
};