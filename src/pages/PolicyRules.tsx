"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export default function PolicyRules() {
  return (
    <PageShell>
      <CenteredCard maxWidth="2xl">
        <CardHeader>
          <CardTitle>Policy Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Require approval above threshold</div>
              <div className="text-sm text-muted-foreground">Transfers over limit need a second set of eyes.</div>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Approval Threshold (USD)</Label>
              <Input className="input-dark" type="number" placeholder="10000" />
            </div>
            <div>
              <Label className="text-muted-foreground">Daily Limit (USD)</Label>
              <Input className="input-dark" type="number" placeholder="50000" />
            </div>
          </div>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}