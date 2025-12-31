"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ActivityLog() {
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
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No events yet</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}