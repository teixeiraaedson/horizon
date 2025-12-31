"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

type Props = {
  label: string;
  value: string | number;
  delta?: string;
  icon?: ReactNode;
  accent?: "blue" | "green" | "orange" | "red";
};

export const MetricCard = ({ label, value, delta, icon, accent = "blue" }: Props) => {
  const accents: Record<NonNullable<Props["accent"]>, string> = {
    blue: "shadow-[0_0_24px_rgba(56,189,248,0.10)] ring-[rgba(56,189,248,0.35)]",
    green: "shadow-[0_0_24px_rgba(34,197,94,0.10)] ring-[rgba(34,197,94,0.35)]",
    orange: "shadow-[0_0_24px_rgba(245,158,11,0.10)] ring-[rgba(245,158,11,0.35)]",
    red: "shadow-[0_0_24px_rgba(239,68,68,0.10)] ring-[rgba(239,68,68,0.35)]",
  };
  return (
    <Card className={`surface-2 card-hover`}>
      <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-1">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        {icon && (
          <div className={`h-7 w-7 rounded-md bg-[rgba(148,163,184,0.12)] ring-1 ${accents[accent].split(" ")[1]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-semibold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        {delta && <div className="text-xs text-muted-foreground mt-1">{delta}</div>}
      </CardContent>
    </Card>
  );
};