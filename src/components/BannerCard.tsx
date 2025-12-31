"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const BannerCard = ({ pendingCount, onAction }: { pendingCount: number; onAction?: () => void }) => {
  const hasPending = pendingCount > 0;

  // Accent-tinted chip background + border
  const chipStyle = hasPending
    ? { backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.28)" }
    : { backgroundColor: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" };

  const iconColor = hasPending ? "var(--hz-orange)" : "var(--hz-green)";

  return (
    <Card className="surface-2 card-sheen card-hover mb-4 h-[72px] w-full">
      <CardContent className="h-full w-full flex items-center gap-3 px-4 py-0">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={chipStyle}>
          {hasPending ? (
            <AlertTriangle className="h-4 w-4" style={{ color: iconColor }} />
          ) : (
            <CheckCircle2 className="h-4 w-4" style={{ color: iconColor }} />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">{hasPending ? "Pending Approvals" : "All clear"}</div>
          <div className="text-sm text-muted-foreground truncate">
            {hasPending ? `There ${pendingCount === 1 ? "is" : "are"} ${pendingCount} item${pendingCount===1?"":"s"} awaiting Release` : "Move with certainty. Arrive with confidence."}
          </div>
        </div>
        {hasPending && onAction && (
          <button onClick={onAction} className="ml-auto inline-flex items-center gap-1 text-[var(--hz-blue)] hover:underline">
            Review now →
          </button>
        )}
      </CardContent>
    </Card>
  );
};