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
  const chipStyles: Record<NonNullable<Props["accent"]>, React.CSSProperties> = {
    blue:   { backgroundColor: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)" },
    green:  { backgroundColor: "rgba(34,197,94,0.12)",  border: "1px solid rgba(34,197,94,0.25)" },
    orange: { backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.28)" },
  };

  const accentGlow: Record<NonNullable<Props["accent"]>, string> = {
    blue: "glow-blue",
    green: "glow-green",
    orange: "glow-orange",
  };

  return (
    <Card className={`surface-2 card-sheen card-hover w-full h-[90px] ${accentGlow[accent]}`}>
      <CardHeader className="px-4 pt-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={chipStyles[accent]}>
              {icon}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold truncate">{title}</CardTitle>
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