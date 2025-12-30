"use client";

import { Layout } from "@/components/Layout";
import { useMockStore } from "@/mock/store";
import { useEffect, useState } from "react";
import type { AuditEvent } from "@/types/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/utils/csv";
import { DataTable } from "@/components/DataTable";

export default function AuditTrail() {
  const mock = useMockStore();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const refresh = () => setEvents(mock.listAudit().data);
  useEffect(() => {
    refresh();
  }, []);
  return (
    <Layout>
      <div className="flex justify-end mb-2">
        <Button variant="outline" onClick={() => downloadCSV(events as any, "audit_events.csv")}>Export CSV</Button>
      </div>
      <Card className="surface-1 card-sheen card-hover">
        <CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader>
        <CardContent className="p-0">
          <DataTable>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Reason Codes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs">{new Date(e.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{e.action}</TableCell>
                    <TableCell>{e.resource}</TableCell>
                    <TableCell className="text-xs">{e.reasonCodes?.join(", ")}</TableCell>
                  </TableRow>
                ))}
                {!events.length && <TableRow><TableCell colSpan={4} className="text-muted-foreground">No events</TableCell></TableRow>}
              </TableBody>
            </Table>
          </DataTable>
        </CardContent>
      </Card>
    </Layout>
  );
}