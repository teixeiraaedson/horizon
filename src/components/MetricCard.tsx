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
    blue: "shadow-[0_0_24px_rgba(56,189,248,0.10)]",
    green: "shadow-[0_0_24px_rgba(34,197,94,0.10)]",
    orange: "shadow-[0_0_24px_rgba(245,158,11,0.10)]",
    red: "shadow-[0_0_24px_rgba(239,68,68,0.10)]",
  };
  return (
    <Card className={`surface-2 card-hover ${accents[accent]}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        {delta && <div className="text-xs text-muted-foreground mt-1">{delta}</div>}
      </CardContent>
    </Card>
  );
};