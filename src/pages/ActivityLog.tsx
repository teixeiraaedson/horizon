"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getActivity, type ActivityEntry } from "@/lib/mockActivity";

export default function ActivityLog() {
  const [rows, setRows] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    setRows(getActivity());
  }, []);

  return (
    <PageShell>
      <CenteredCard maxWidth="3xl">
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No events yet</TableCell>
                  </TableRow>
                )}
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{new Date(r.time).toLocaleString()}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.actor}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.action}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.entity}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.status}</TableCell>
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