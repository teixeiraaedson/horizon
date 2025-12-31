"use client";

import React from "react";

type PageCenterProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "xl" | "2xl" | "3xl";
};

/**
 * PageCenter centers its children horizontally within the main content area.
 * - Adds top padding (pt-10) and responsive horizontal padding.
 * - Uses max width (default: max-w-2xl) without fixed positioning.
 * - The parent layout (AppShell) handles scrolling via overflow-y.
 */
const PageCenter = ({ children, className, maxWidth = "2xl" }: PageCenterProps) => {
  const maxMap: Record<NonNullable<PageCenterProps["maxWidth"]>, string> = {
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  };

  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 pt-10 flex justify-center ${className ?? ""}`}>
      <div className={`w-full ${maxMap[maxWidth]} min-w-0`}>{children}</div>
    </div>
  );
};

export default PageCenter;