"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useMockStore } from "@/mock/store";
import { useAuth } from "@/app/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PROJECT_ID = "vbofqbuztblknzialrdp";
const RECEIVER_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/webhook-receiver`;
const SIMULATOR_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/webhook-simulator`;

type EventType =
  | "settlement.completed"
  | "transfer.completed"
  | "withdraw.completed"
  | "settlement.failed"
  | "transfer.failed"
  | "withdraw.failed";

export default function Webhooks() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [transactionId, setTransactionId] = useState("");
  const [eventType, setEventType] = useState<EventType>("settlement.completed");

  const isAdmin = (user?.role ?? "user") === "admin";

  const refresh = async () => {
    const { data, error } = await supabase
      .from("webhook_events")
      .select("*")
      .order("received_at", { ascending: false });

    if (error) {
      toast({ title: "Load error", description: error.message });
      return;
    }
    setRows(data ?? []);
  };

  useEffect(() => {
    refresh();
    // Realtime subscription to webhook_events inserts
    const channel = supabase
      .channel("webhook-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "webhook_events" },
        (_payload) => {
          // Fetch latest list on new insert
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const simulate = async () => {
    if (!isAdmin) {
      toast({ title: "Forbidden", description: "Admin only." });
      return;
    }
    if (!transactionId || !eventType) {
      toast({ title: "Missing fields", description: "Provide transaction and event type." });
      return;
    }
    const res = await fetch(SIMULATOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Minimal Authorization marker; in a real app, pass JWT
        "Authorization": "Bearer admin",
      },
      body: JSON.stringify({ transaction_id: transactionId, event_type: eventType }),
    });
    const body = await res.json();
    if (res.ok) {
      toast({ title: "Simulated", description: `Event ${eventType} sent.` });
      refresh();
    } else {
      toast({ title: "Simulation failed", description: body?.error?.message ?? "Unknown error" });
    }
  };

  const replay = async (row: any) => {
    if (!isAdmin) {
      toast({ title: "Forbidden", description: "Admin only." });
      return;
    }
    const txId = row?.payload?.data?.transaction_id;
    const type = row?.event_type ?? row?.eventType;
    if (!txId || !type) {
      toast({ title: "Invalid event", description: "Missing transaction or event type." });
      return;
    }
    const res = await fetch(SIMULATOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer admin",
      },
      body: JSON.stringify({ transaction_id: txId, event_type: type }),
    });
    const body = await res.json();
    if (res.ok) {
      toast({ title: "Replayed", description: `Event ${type} reprocessed.` });
      refresh();
    } else {
      toast({ title: "Replay failed", description: body?.error?.message ?? "Unknown error" });
    }
  };

  return (
    <PageShell>
      <CenteredCard maxWidth="3xl">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">Event-driven settlement simulation</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simulator (Admin only) */}
          <div className="rounded-md border border-border p-3">
            <div className="mb-2 text-sm font-medium">Simulate Event (Admin)</div>
            <div className="flex items-center gap-2">
              <Input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Transaction ID" className="input-dark flex-1" />
              <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
                <SelectTrigger className="input-dark w-56">
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="settlement.completed">settlement.completed</SelectItem>
                  <SelectItem value="transfer.completed">transfer.completed</SelectItem>
                  <SelectItem value="withdraw.completed">withdraw.completed</SelectItem>
                  <SelectItem value="settlement.failed">settlement.failed</SelectItem>
                  <SelectItem value="transfer.failed">transfer.failed</SelectItem>
                  <SelectItem value="withdraw.failed">withdraw.failed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={simulate} disabled={!isAdmin}>Simulate Event</Button>
            </div>
          </div>

          {/* Events table */}
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Received</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No events yet</TableCell>
                  </TableRow>
                )}
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{new Date(row.received_at ?? row.created_at).toLocaleString()}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.event_type}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.payload?.data?.transaction_id ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.status}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => replay(row)} disabled={!isAdmin}>Replay</Button>
                      <Button variant="ghost" size="sm" onClick={() => toast({ title: "Payload", description: JSON.stringify(row.payload ?? {}, null, 2) })}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}