"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * PageShell centers page content in the main area next to the sidebar.
 * - Responsive padding
 * - Max width like Lovable (3–4xl)
 * - mx-auto to center horizontally
 */
export const PageShell = ({ children, className }: Props) => {
  return (
    <main className={`min-h-screen bg-background text-foreground w-full px-4 sm:px-6 lg:px-8 py-4 ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-4xl">
        {children}
      </div>
    </main>
  );
};

export default PageShell;