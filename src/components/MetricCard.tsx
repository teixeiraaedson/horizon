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
  const chipStyles: Record<NonNullable<Props["accent"]>, React.CSSProperties> = {
    blue:   { backgroundColor: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)" },
    green:  { backgroundColor: "rgba(34,197,94,0.12)",  border: "1px solid rgba(34,197,94,0.25)" },
    orange: { backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.28)" },
    red:    { backgroundColor: "rgba(239,68,68,0.12)",  border: "1px solid rgba(239,68,68,0.28)" },
  };

  const deltaClass =
    delta?.trim().startsWith("-")
      ? "text-[color:var(--hz-red)]"
      : delta?.trim().startsWith("+")
      ? "text-[color:var(--hz-green)]"
      : "text-muted-foreground";

  return (
    <Card className="surface-2 card-sheen card-hover">
      <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-1">
        <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
        {icon && (
          <div className="h-7 w-7 rounded-md flex items-center justify-center" style={chipStyles[accent]}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-semibold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        {delta && <div className={`text-xs mt-1 ${deltaClass}`}>{delta}</div>}
      </CardContent>
    </Card>
  );
};