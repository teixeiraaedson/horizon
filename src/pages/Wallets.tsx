"use client";

import { Layout } from "@/components/Layout";
import { useMockStore } from "@/mock/store";
import { useEffect, useState } from "react";
import type { Wallet } from "@/types/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/utils/csv";
import { DataTable } from "@/components/DataTable";

export default function Wallets() {
  const mock = useMockStore();
  const [rows, setRows] = useState<(Wallet & { balance: number })[]>([]);
  useEffect(() => {
    setRows(mock.listWallets().data);
  }, []);
  return (
    <Layout>
      <div className="flex justify-end mb-2">
        <Button variant="outline" onClick={() => downloadCSV(rows as any, "wallet_balances.csv")}>Export CSV</Button>
      </div>
      <Card className="surface-1 card-sheen card-hover">
        <CardHeader><CardTitle>Wallets</CardTitle></CardHeader>
        <CardContent className="p-0">
          <DataTable>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{w.name}</TableCell>
                    <TableCell>{w.type}</TableCell>
                    <TableCell>${w.balance.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        </CardContent>
      </Card>
    </Layout>
  );
}