"use client";

import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/types/core";

export const StatusBadge = ({ status }: { status: Transaction["status"] }) => {
  const map: Record<Transaction["status"], string> = {
    COMPLETED: "badge-completed",
    PENDING_APPROVAL: "badge-pending",
    APPROVED: "badge-approved",
    REJECTED: "badge-rejected",
    FAILED: "badge-rejected",
    CREATED: "badge-created",
  };
  return (
    <Badge className={`border ${map[status]} uppercase tracking-wide`} variant="outline">
      {status}
    </Badge>
  );
};