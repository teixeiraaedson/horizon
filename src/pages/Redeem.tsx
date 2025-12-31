"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Redeem() {
  return (
    <PageShell>
      <CenteredCard maxWidth="2xl">
        <CardHeader>
          <CardTitle>Redeem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Wallet</Label>
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
          <div>
            <Label className="text-muted-foreground">Bank Reference</Label>
            <Input className="input-dark" type="text" placeholder="Optional note" />
          </div>
          <Button disabled className="hover:shadow-[0_0_24px_rgba(245,158,11,0.10)]">Redeem (UI only)</Button>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}