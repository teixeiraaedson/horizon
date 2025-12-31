"use client";

import React from "react";
import { Card } from "@/components/ui/card";

type Props = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
};

/**
 * CenteredCard renders a Card surface centered within the PageShell.
 * - Full width on mobile with padding; clamped max width on larger screens.
 * - Uses premium card styling via the Card primitive.
 */
export const CenteredCard = ({ children, className, maxWidth = "2xl" }: Props) => {
  const maxMap: Record<Props["maxWidth"], string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  };

  return (
    <div className="w-full flex justify-center">
      <Card className={`w-full ${maxMap[maxWidth]} mx-auto card-sheen card-hover ${className ?? ""}`}>
        {children}
      </Card>
    </div>
  );
};

export default CenteredCard;