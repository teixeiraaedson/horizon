"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMockStore } from "@/mock/store";
import type { Transaction } from "@/types/core";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/MetricCard";
import { ActionCard } from "@/components/ActionCard";
import { CheckCircle2, AlertTriangle, Landmark, ArrowRightLeft, Wallet as WalletIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";

export default function Dashboard() {
  const mock = useMockStore();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [pending, setPending] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const navigate = useNavigate();

  const refresh = () => {
    setTxs(mock.listTransactions().data);
    setPending(mock.listPending().data);
  };
  useEffect(() => {
    mock.seed();
    refresh();
  }, []);

  const metrics = useMemo(() => {
    const volume = txs.reduce((sum, t) => sum + t.amount, 0);
    const completed = txs.filter((t) => t.status === "COMPLETED");
    const avgSettlement = completed.length ? Math.round(completed.reduce((s, t) => s + t.amount, 0) / completed.length) : 0;
    const exceptionsToday = txs.filter((t) => {
      const d = new Date(t.updatedAt).toISOString().slice(0,10);
      const today = new Date().toISOString().slice(0,10);
      return (t.status === "REJECTED" || t.status === "FAILED") && d === today;
    }).length;
    const todays = txs.filter((t) => new Date(t.updatedAt).toDateString() === new Date().toDateString()).length;
    return { volume, avgSettlement, exceptionsToday, pendingCount: pending.length, todays };
  }, [txs, pending]);

  const hasPending = pending.length > 0;

  return (
    <Layout>
      {/* Dark token wrapper + premium spacing */}
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">

        {/* Premium status banner with subtle top gradient */}
        <Card className="relative mb-4 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[hsl(var(--card))] to-transparent" />
          <CardContent className="flex items-center gap-3 py-4 px-4">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: hasPending ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)",
                border: hasPending ? "1px solid rgba(245,158,11,0.28)" : "1px solid rgba(34,197,94,0.25)",
              }}
            >
              {hasPending ? (
                <AlertTriangle className="h-4 w-4" style={{ color: "var(--hz-orange)" }} />
              ) : (
                <CheckCircle2 className="h-4 w-4" style={{ color: "var(--hz-green)" }} />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{hasPending ? "Pending Approvals" : "All clear"}</div>
              <div className="text-xs text-muted-foreground truncate">
                {hasPending
                  ? `There ${pending.length === 1 ? "is" : "are"} ${pending.length} item${pending.length === 1 ? "" : "s"} awaiting Release`
                  : "Move with certainty. Arrive with confidence."}
              </div>
            </div>
            {hasPending && (
              <button
                onClick={() => navigate("/release-queue")}
                className="ml-auto inline-flex items-center gap-1 text-[color:var(--hz-blue)] hover:underline"
              >
                Review now →
              </button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions: fully clickable horizontal bars using ActionCard (Link wrapper inside) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Fund"
            description="Add funds to a wallet"
            icon={<Landmark className="h-4 w-4" style={{ color: "var(--hz-green)" }} />}
            accent="green"
            ctaLabel="Fund"
            to="/fund"
          />
          <ActionCard
            title="Send"
            description="Move funds between wallets"
            icon={<ArrowRightLeft className="h-4 w-4" style={{ color: "var(--hz-blue)" }} />}
            accent="blue"
            ctaLabel="Send"
            to="/send"
          />
          <ActionCard
            title="Withdraw"
            description="Convert to bank"
            icon={<WalletIcon className="h-4 w-4" style={{ color: "var(--hz-orange)" }} />}
            accent="orange"
            ctaLabel="Withdraw"
            to="/withdraw"
          />
        </div>

        {/* Key Metrics */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Volume" value={`$${metrics.volume.toLocaleString()}`} icon={<Landmark className="h-4 w-4" style={{ color: "var(--hz-blue)" }} />} accent="blue" />
          <MetricCard label="Avg Settlement" value={`$${metrics.avgSettlement.toLocaleString()}`} icon={<CheckCircle2 className="h-4 w-4" style={{ color: "var(--hz-green)" }} />} accent="green" />
          <MetricCard label="Exceptions Today" value={metrics.exceptionsToday} icon={<AlertTriangle className="h-4 w-4" style={{ color: "var(--hz-orange)" }} />} accent="orange" />
          <MetricCard label="Pending Approvals" value={metrics.pendingCount} icon={<CheckCircle2 className="h-4 w-4" style={{ color: "var(--hz-orange)" }} />} accent="orange" />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Today's Velocity" value={`${metrics.todays} txns`} icon={<ArrowRight className="h-4 w-4" style={{ color: "var(--hz-blue)" }} />} accent="blue" />
          <MetricCard label="Completed Today" value={txs.filter(t=>t.status==="COMPLETED").length} icon={<CheckCircle2 className="h-4 w-4" style={{ color: "var(--hz-green)" }} />} accent="green" />
          <MetricCard label="Failed/Rejected" value={txs.filter(t=>t.status==="FAILED"||t.status==="REJECTED").length} icon={<AlertTriangle className="h-4 w-4" style={{ color: "var(--hz-red)" }} />} accent="red" />
        </div>

        {/* Recent Transactions: deep, rounded container; no grid-paper outlines */}
        <Card className="mt-6 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="text-sm text-muted-foreground">Recent Transactions</div>
            <button onClick={() => navigate("/audit")} className="text-[color:var(--hz-blue)] hover:underline inline-flex items-center gap-1">
              View All →
            </button>
          </div>
          <CardContent className="p-0">
            <DataTable>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txs.slice(0,10).map((t) => (
                    <TableRow key={t.id} className="cursor-pointer" onClick={() => setSelected(t)}>
                      <TableCell className="whitespace-nowrap">{t.type}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="whitespace-nowrap">${t.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(t); }}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!txs.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DataTable>
          </CardContent>
        </Card>

        {/* Drawer unchanged */}
        <Drawer open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Transaction Details</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-2">
              {selected && (
                <>
                  <div className="text-sm"><span className="font-medium">ID:</span> <span className="font-mono">{selected.id}</span></div>
                  <div className="text-sm"><span className="font-medium">Type:</span> {selected.type}</div>
                  <div className="text-sm"><span className="font-medium">Status:</span> <StatusBadge status={selected.status} /></div>
                  <div className="text-sm"><span className="font-medium">Amount:</span> ${selected.amount.toLocaleString()}</div>
                  <div className="text-sm"><span className="font-medium">Reason Codes:</span> {selected.reasonCodes.join(", ") || "—"}</div>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </Layout>
  );
}