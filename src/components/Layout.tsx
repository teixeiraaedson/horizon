"use client";

import { AppSidebarLayout } from "@/components/SidebarNav";
import { AppHeader } from "@/components/AppHeader";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppSidebarLayout>
      <div className="min-h-screen w-full bg-background text-foreground">
        <div className="flex min-h-screen">
          {/* Sidebar is rendered by AppSidebarLayout; this is the main column */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header stays at the top of the column */}
            <AppHeader />
            {/* Scrollable main content area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="px-4 sm:px-6 lg:px-8 py-4">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSidebarLayout>
  );
};