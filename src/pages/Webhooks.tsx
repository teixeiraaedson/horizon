"use client";

import { Layout } from "@/components/Layout";
import { useMockStore } from "@/mock/store";
import { useEffect, useState } from "react";
import type { WebhookEvent, UUID } from "@/types/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { downloadCSV } from "@/utils/csv";
import { DataTable } from "@/components/DataTable";

export default function Webhooks() {
  const mock = useMockStore();
  const { toast } = useToast();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [txId, setTxId] = useState("");

  const refresh = () => setEvents(mock.listWebhooks().data);
  useEffect(() => {
    refresh();
  }, []);

  const simulate = () => {
    if (!txId) return;
    const res = mock.simulateWebhook({ transactionId: txId as UUID, eventType: "settlement.completed" });
    toast({ title: res.data.deduped ? "Deduped" : "Simulated", description: "Webhook processed" });
    refresh();
  };

  const replay = (e: WebhookEvent) => {
    // Replay by sending exact same payload -> will dedupe
    const res = mock.simulateWebhook({ transactionId: e.payload.data.transaction_id as UUID, eventType: e.eventType });
    toast({ title: res.data.deduped ? "Deduped" : "Replayed", description: "Processed" });
    refresh();
  };

  return (
    <Layout>
      <div className="flex items-end gap-2 mb-4">
        <div className="flex-1 max-w-sm">
          <label className="block text-sm mb-1 text-muted-foreground">Transaction ID</label>
          <Input value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="Enter transaction id" className="input-dark" />
        </div>
        <Button onClick={simulate} className="hover:shadow-[0_0_24px_rgba(56,189,248,0.10)]">Simulate Event</Button>
        <Button variant="outline" onClick={() => downloadCSV(events as any, "webhook_events.csv")}>Export CSV</Button>
      </div>
      <Card className="surface-1 card-sheen card-hover">
        <CardHeader><CardTitle>Webhook Events</CardTitle></CardHeader>
        <CardContent className="p-0">
          <DataTable>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payload Hash</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.id}</TableCell>
                    <TableCell>{e.eventType}</TableCell>
                    <TableCell>{e.status}</TableCell>
                    <TableCell className="font-mono text-xs">{e.payloadHash}</TableCell>
                    <TableCell>{new Date(e.receivedAt).toLocaleString()}</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => replay(e)}>Replay</Button></TableCell>
                  </TableRow>
                ))}
                {!events.length && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No events</TableCell></TableRow>}
              </TableBody>
            </Table>
          </DataTable>
        </CardContent>
      </Card>
    </Layout>
  );
}