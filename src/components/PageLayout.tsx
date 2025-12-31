"use client";

import React from "react";

type PageLayoutProps = {
  variant?: "center" | "wide";
  children: React.ReactNode;
  className?: string;
};

/**
 * PageLayout centers forms (center) or provides a wide content shell (wide).
 * - center: outer flex justify-center; inner max-w-2xl; top padding.
 * - wide: max-w-6xl container centered; responsive padding.
 */
const PageLayout = ({ variant = "center", children, className }: PageLayoutProps) => {
  if (variant === "wide") {
    return (
      <div className={`w-full px-4 sm:px-6 lg:px-8 pt-6 ${className ?? ""}`}>
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </div>
    );
  }
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 pt-8 flex justify-center ${className ?? ""}`}>
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
};

export default PageLayout;