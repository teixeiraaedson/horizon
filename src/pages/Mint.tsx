"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Mint() {
  return (
    <PageShell>
      <CenteredCard maxWidth="2xl">
        <CardHeader>
          <CardTitle>Mint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Destination Wallet</Label>
            <Select>
              <SelectTrigger className="input-dark"><SelectValue placeholder="Select wallet" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="treasury">Treasury</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground">Amount (USD)</Label>
            <Input className="input-dark" type="number" step="1" placeholder="Enter amount" />
          </div>
          <Button disabled className="hover:shadow-[0_0_24px_rgba(56,189,248,0.10)]">Mint (UI only)</Button>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}