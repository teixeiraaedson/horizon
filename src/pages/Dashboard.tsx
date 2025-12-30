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
import { CheckCircle2, AlertTriangle, Landmark, ArrowRightLeft, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    return { volume, avgSettlement, exceptionsToday, pendingCount: pending.length };
  }, [txs, pending]);

  const bannerAccent = pending.length > 0 ? "orange" : "green";

  return (
    <Layout>
      {/* Pending Approvals banner */}
      <Card className="surface-2 card-hover mb-4">
        <CardContent className="flex items-center gap-3 py-3">
          {pending.length > 0 ? (
            <>
              <AlertTriangle className="h-5 w-5 text-[var(--orange)]" />
              <div>
                <div className="font-medium">Release Queue has {pending.length} item(s)</div>
                <div className="text-sm text-muted-foreground">Release requires a second set of eyes.</div>
              </div>
              <div className="ml-auto">
                <Button variant="outline" onClick={() => navigate("/release-queue")}>Review now</Button>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 text-[var(--green)]" />
              <div>
                <div className="font-medium">All clear</div>
                <div className="text-sm text-muted-foreground">Move with certainty. Arrive with confidence.</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Fund"
          description="Add funds to a wallet"
          icon={<Landmark className="h-4 w-4 text-[var(--green)]" />}
          accent="green"
          ctaLabel="Fund"
          onClick={() => navigate("/fund")}
        />
        <ActionCard
          title="Send"
          description="Move funds between wallets"
          icon={<ArrowRightLeft className="h-4 w-4 text-[var(--blue)]" />}
          accent="blue"
          ctaLabel="Send"
          onClick={() => navigate("/send")}
        />
        <ActionCard
          title="Withdraw"
          description="Withdraw to bank"
          icon={<Wallet className="h-4 w-4 text-[var(--orange)]" />}
          accent="orange"
          ctaLabel="Withdraw"
          onClick={() => navigate("/withdraw")}
        />
      </div>

      {/* Key Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Volume" value={`$${metrics.volume.toLocaleString()}`} icon={<Landmark className="h-4 w-4 text-[var(--blue)]" />} accent="blue" />
        <MetricCard label="Avg Settlement" value={`$${metrics.avgSettlement.toLocaleString()}`} icon={<CheckCircle2 className="h-4 w-4 text-[var(--green)]" />} accent="green" />
        <MetricCard label="Exceptions Today" value={metrics.exceptionsToday} icon={<AlertTriangle className="h-4 w-4 text-[var(--orange)]" />} accent="orange" />
        <MetricCard label="Pending Approvals" value={metrics.pendingCount} icon={<ShieldIcon />} accent="orange" />
      </div>

      {/* Recent Movements */}
      <div className="mt-6 surface-2 card-hover rounded-md">
        <div className="px-4 py-3 border-b border-[var(--border-soft)]">
          <div className="text-sm text-muted-foreground">Recent Movements</div>
        </div>
        <div className="overflow-x-auto">
          <Table className="table-modern w-full">
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
        </div>
      </div>

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

const ShieldIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" className="text-[var(--orange)]"><path fill="currentColor" d="M12 2l7 4v6c0 5-3.4 9.3-7 10c-3.6-.7-7-5-7-10V6l7-4z"/></svg>;