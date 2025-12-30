"use client";

import { AppSidebarLayout } from "@/components/SidebarNav";
import { AppHeader } from "@/components/AppHeader";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppSidebarLayout>
      <AppHeader />
      <div className="p-4">
        {children}
      </div>
    </AppSidebarLayout>
  );
};