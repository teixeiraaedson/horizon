"use client";

import { Layout } from "@/components/Layout";
import { useMockStore } from "@/mock/store";
import { useEffect, useState } from "react";
import type { Transaction } from "@/types/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";

export default function ReleaseQueue() {
  const mock = useMockStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [reason, setReason] = useState("");

  const refresh = () => setItems(mock.listPending().data);
  useEffect(() => {
    refresh();
  }, []);

  const approve = (decision: "APPROVE" | "REJECT") => {
    if (!selected || !user) return;
    const res = mock.approveTransaction({
      transactionId: selected.id,
      decision,
      reason,
      approverId: user.id,
    });
    if ("error" in res) {
      toast({ title: "Error", description: res.error.message });
    } else {
      toast({ title: decision === "APPROVE" ? "Approved" : "Rejected", description: `Tx ${selected.id.slice(0,8)}` });
      setSelected(null);
      setReason("");
      refresh();
    }
  };

  return (
    <Layout>
      <Card className="surface-1 card-sheen card-hover">
        <CardHeader><CardTitle>Release Queue</CardTitle></CardHeader>
        <CardContent className="p-0">
          <DataTable>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Tx</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell>${t.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="sm" className="mr-2" onClick={() => { setSelected(t); }}>Decide</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!items.length && (
                  <TableRow><TableCell colSpan={4} className="text-muted-foreground">Nothing to release</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </DataTable>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Decision for {selected?.id.slice(0,8)}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex gap-2">
              <Button disabled={!reason} onClick={() => approve("APPROVE")}>Approve</Button>
              <Button variant="destructive" disabled={!reason} onClick={() => approve("REJECT")}>Reject</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}