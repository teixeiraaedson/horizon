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
import { BannerCard } from "@/components/BannerCard";
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

  return (
    <Layout>
      <BannerCard pendingCount={pending.length} onAction={() => navigate("/release-queue")} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="surface-1 card-sheen card-hover glow-green">
          <CardContent className="py-5">
            <ActionCard
              title="Fund"
              description="Add funds to a wallet"
              icon={<Landmark className="h-4 w-4" style={{ color: "var(--green)" }} />}
              accent="green"
              ctaLabel="Fund"
              onClick={() => navigate("/fund")}
            />
          </CardContent>
        </Card>
        <Card className="surface-1 card-sheen card-hover glow-blue">
          <CardContent className="py-5">
            <ActionCard
              title="Send"
              description="Move funds between wallets"
              icon={<ArrowRightLeft className="h-4 w-4" style={{ color: "var(--blue)" }} />}
              accent="blue"
              ctaLabel="Send"
              onClick={() => navigate("/send")}
            />
          </CardContent>
        </Card>
        <Card className="surface-1 card-sheen card-hover glow-orange">
          <CardContent className="py-5">
            <ActionCard
              title="Withdraw"
              description="Convert to bank"
              icon={<WalletIcon className="h-4 w-4" style={{ color: "var(--orange)" }} />}
              accent="orange"
              ctaLabel="Withdraw"
              onClick={() => navigate("/withdraw")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Volume" value={`$${metrics.volume.toLocaleString()}`} icon={<Landmark className="h-4 w-4" style={{ color: "var(--blue)" }} />} accent="blue" />
        <MetricCard label="Avg Settlement" value={`$${metrics.avgSettlement.toLocaleString()}`} icon={<CheckCircle2 className="h-4 w-4" style={{ color: "var(--green)" }} />} accent="green" />
        <MetricCard label="Exceptions Today" value={metrics.exceptionsToday} icon={<AlertTriangle className="h-4 w-4" style={{ color: "var(--orange)" }} />} accent="orange" />
        <MetricCard label="Pending Approvals" value={metrics.pendingCount} icon={<CheckCircle2 className="h-4 w-4" style={{ color: "var(--orange)" }} />} accent="orange" />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Today's Velocity" value={`${metrics.todays} txns`} icon={<ArrowRight className="h-4 w-4" style={{ color: "var(--blue)" }} />} accent="blue" />
        <MetricCard label="Completed Today" value={txs.filter(t=>t.status==="COMPLETED").length} icon={<CheckCircle2 className="h-4 w-4" style={{ color: "var(--green)" }} />} accent="green" />
        <MetricCard label="Failed/Rejected" value={txs.filter(t=>t.status==="FAILED"||t.status==="REJECTED").length} icon={<AlertTriangle className="h-4 w-4" style={{ color: "var(--red)" }} />} accent="orange" />
      </div>

      {/* Recent Transactions */}
      <Card className="surface-1 card-sheen card-hover mt-6">
        <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm text-muted-foreground">Recent Transactions</div>
          <button onClick={() => navigate("/audit")} className="text-[var(--blue)] hover:underline inline-flex items-center gap-1">
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
                    <TableCell>{t.type}</TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell>${t.amount.toLocaleString()}</TableCell>
                    <TableCell><Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(t); }}>View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        </CardContent>
      </Card>

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
    </Layout>
  );
}