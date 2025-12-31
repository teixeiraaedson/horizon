"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function AdminSettings() {
  return (
    <PageShell>
      <CenteredCard maxWidth="2xl">
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Maintenance Mode</div>
              <div className="text-sm text-muted-foreground">Put the console into read-only mode.</div>
            </div>
            <Switch />
          </div>
          <div>
            <Label className="text-muted-foreground">Support Email</Label>
            <Input className="input-dark" type="email" placeholder="support@company.com" />
          </div>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}