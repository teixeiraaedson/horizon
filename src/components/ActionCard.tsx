"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  accent?: "blue" | "green" | "orange";
  ctaLabel: string;
  onClick: () => void;
};

export const ActionCard = ({ title, description, icon, accent = "blue", ctaLabel, onClick }: Props) => {
  const accentRing: Record<NonNullable<Props["accent"]>, string> = {
    blue: "ring-[rgba(56,189,248,0.25)]",
    green: "ring-[rgba(34,197,94,0.25)]",
    orange: "ring-[rgba(245,158,11,0.25)]",
  };
  const accentGlow: Record<NonNullable<Props["accent"]>, string> = {
    blue: "shadow-[0_0_0_1px_rgba(56,189,248,0.18),0_0_12px_rgba(56,189,248,0.12)]",
    green: "shadow-[0_0_0_1px_rgba(34,197,94,0.18),0_0_12px_rgba(34,197,94,0.12)]",
    orange: "shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_0_12px_rgba(245,158,11,0.12)]",
  };

  return (
    <Card className={`surface-2 card-hover w-full h-[92px] ${accentGlow[accent]}`}>
      <CardHeader className="px-4 pt-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg bg-[rgba(148,163,184,0.12)] ring-1 ${accentRing[accent]} flex items-center justify-center`}>
              {icon}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{title}</CardTitle>
              {description && <div className="text-xs text-muted-foreground mt-0.5 truncate">{description}</div>}
            </div>
          </div>
          <Button onClick={onClick} variant="ghost" className="hover:bg-[rgba(148,163,184,0.08)]">
            {ctaLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0" />
    </Card>
  );
};