"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMockStore } from "@/mock/store";
import type { Transaction } from "@/types/core";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const StatusBadge = ({ s }: { s: Transaction["status"] }) => {
  const color =
    s === "COMPLETED"
      ? "bg-green-100 text-green-800"
      : s === "PENDING_APPROVAL"
      ? "bg-yellow-100 text-yellow-800"
      : s === "REJECTED" || s === "FAILED"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";
  return <span className={`px-2 py-0.5 rounded text-xs ${color}`}>{s}</span>;
};

export default function Dashboard() {
  const mock = useMockStore();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [pending, setPending] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const refresh = () => {
    setTxs(mock.listTransactions().data);
    setPending(mock.listPending().data);
  };
  useEffect(() => {
    mock.seed();
    refresh();
  }, []);

  const kpis = useMemo(() => {
    const byStatus = txs.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});
    const volume = txs.reduce((sum, t) => sum + t.amount, 0);
    return { byStatus, volume };
  }, [txs]);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Volume</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">${kpis.volume.toLocaleString()}</CardContent>
        </Card>
        {["CREATED","PENDING_APPROVAL","APPROVED","REJECTED","COMPLETED","FAILED"].slice(0,3).map((k) => (
          <Card key={k}>
            <CardHeader>
              <CardTitle>{k}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{kpis.byStatus[k] || 0}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending Release</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer" onClick={() => setSelected(t)}>
                    <TableCell className="font-mono text-xs">{t.id.slice(0,8)}</TableCell>
                    <TableCell>${t.amount.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{t.fromWalletId?.slice(0,6)}</TableCell>
                    <TableCell className="font-mono text-xs">{t.toWalletId?.slice(0,6)}</TableCell>
                  </TableRow>
                ))}
                {!pending.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">No items</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
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
                  <TableRow key={t.id}>
                    <TableCell>{t.type}</TableCell>
                    <TableCell><StatusBadge s={t.status} /></TableCell>
                    <TableCell>${t.amount.toLocaleString()}</TableCell>
                    <TableCell><Button variant="outline" size="sm" onClick={() => setSelected(t)}>View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Transaction Details</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-2">
            {selected && (
              <>
                <div className="text-sm"><span className="font-medium">ID:</span> <span className="font-mono">{selected.id}</span></div>
                <div className="text-sm"><span className="font-medium">Type:</span> {selected.type}</div>
                <div className="text-sm"><span className="font-medium">Status:</span> {selected.status}</div>
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