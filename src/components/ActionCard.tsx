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
    blue: "ring-[rgba(56,189,248,0.35)]",
    green: "ring-[rgba(34,197,94,0.35)]",
    orange: "ring-[rgba(245,158,11,0.35)]",
  };
  return (
    <Card className={`surface-2 card-hover`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg bg-[rgba(148,163,184,0.12)] ring-1 ${accentRing[accent]} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button onClick={onClick} className="mt-2"> {ctaLabel} </Button>
      </CardContent>
    </Card>
  );
};