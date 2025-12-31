"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const BannerCard = ({ pendingCount, onAction }: { pendingCount: number; onAction?: () => void }) => {
  const hasPending = pendingCount > 0;
  const accentRing = hasPending ? "ring-[rgba(245,158,11,0.35)]" : "ring-[rgba(34,197,94,0.35)]";
  const iconColor = hasPending ? "var(--orange)" : "var(--green)";

  return (
    <Card className="surface-1 card-sheen card-hover mb-4 h-[72px] w-full">
      <CardContent className="h-full w-full flex items-center gap-3 px-4 py-0">
        <div className={`h-8 w-8 rounded-lg bg-[rgba(148,163,184,0.12)] ring-1 ${accentRing} flex items-center justify-center`}>
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
          <button onClick={onAction} className="ml-auto inline-flex items-center gap-1 text-[var(--blue)] hover:underline">
            Review now →
          </button>
        )}
      </CardContent>
    </Card>
  );
};