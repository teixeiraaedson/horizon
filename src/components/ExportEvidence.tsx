"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMockStore } from "@/mock/store";

function toCSV(rows: Record<string, any>[], columns: string[]) {
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(",");
  const body = rows.map(r => columns.map(c => escape(r[c])).join(",")).join("\n");
  return header + "\n" + body;
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const ExportEvidence: React.FC = () => {
  const store = useMockStore();

  const exportTransactions = () => {
    const txs = store.listTransactions().data;
    const cols = [
      "id","type","status","amount","currency",
      "fromWalletId","toWalletId","actorId",
      "requiresApproval","approvedBy","approvedAt","approvalReason","rejectionReason",
      "policyVersion","reasonCodes","createdAt","updatedAt"
    ];
    const rows = txs.map(t => ({
      ...t,
      reasonCodes: (t.reasonCodes || []).join("|"),
    }));
    const csv = toCSV(rows as any[], cols);
    downloadCSV("transactions.csv", csv);
  };

  const exportBalances = () => {
    const wallets = store.listWallets().data;
    const cols = ["id","name","balance","ownerId","type","createdAt"];
    const csv = toCSV(wallets as any[], cols);
    downloadCSV("balances.csv", csv);
  };

  const exportWebhooks = () => {
    const wh = store.listWebhooks().data;
    const rows = wh.map(w => ({
      id: w.id,
      provider: w.provider,
      eventType: w.eventType,
      status: w.status,
      receivedAt: w.receivedAt,
      createdAt: w.createdAt,
      payloadHash: w.payloadHash,
      transactionId: (w.payload as any)?.data?.transaction_id ?? ""
    }));
    const cols = ["id","provider","eventType","status","receivedAt","createdAt","payloadHash","transactionId"];
    const csv = toCSV(rows, cols);
    downloadCSV("webhook_events.csv", csv);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-xs sm:text-sm">Export Evidence</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border border-border p-2 min-w-[220px]">
        <DropdownMenuItem className="hover:bg-muted/20" onClick={exportTransactions}>
          Export Transactions CSV
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-muted/20" onClick={exportBalances}>
          Export Balances CSV
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-muted/20" onClick={exportWebhooks}>
          Export Webhook Events CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportEvidence;