"use client";

import React from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Users() {
  return (
    <PageShell>
      <CenteredCard maxWidth="2xl">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Admin</div>
              <div className="text-sm text-muted-foreground">admin@horizon.local</div>
            </div>
            <Badge variant="outline">Admin</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">User</div>
              <div className="text-sm text-muted-foreground">user@horizon.local</div>
            </div>
            <Badge variant="outline">User</Badge>
          </div>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}