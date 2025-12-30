"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const BannerCard = ({ pendingCount, onAction }: { pendingCount: number; onAction?: () => void }) => {
  const hasPending = pendingCount > 0;
  return (
    <Card className="surface-1 card-sheen card-hover mb-4">
      <CardContent className="flex items-center gap-3 py-4">
        {hasPending ? (
          <AlertTriangle className="h-5 w-5" style={{ color: "var(--orange)" }} />
        ) : (
          <CheckCircle2 className="h-5 w-5" style={{ color: "var(--green)" }} />
        )}
        <div>
          <div className="font-medium">{hasPending ? `Pending Approvals` : "All clear"}</div>
          <div className="text-sm text-muted-foreground">
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