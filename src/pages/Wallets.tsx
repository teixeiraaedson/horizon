"use client";

import { Layout } from "@/components/Layout";
import { useMockStore } from "@/mock/store";
import { useEffect, useState } from "react";
import type { Wallet } from "@/types/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/utils/csv";

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
      <Card>
        <CardHeader><CardTitle>Wallets</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
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
        </CardContent>
      </Card>
    </Layout>
  );
}