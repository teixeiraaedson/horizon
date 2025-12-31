"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ProbeStatus = "green" | "yellow" | "red";

export default function ConnectivityProbe() {
  const [status, setStatus] = useState<ProbeStatus | null>(null);

  const runProbe = () => {
    // Simulated internal probe: deterministic based on current minute
    const minute = new Date().getMinutes();
    const s: ProbeStatus = minute % 10 < 6 ? "green" : minute % 10 < 8 ? "yellow" : "red";
    setStatus(s);
  };

  const label =
    status === "green" ? "Operational"
    : status === "yellow" ? "Degraded"
    : status === "red" ? "Unavailable"
    : "Not run";

  const chipStyle = status === "green"
    ? { backgroundColor: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }
    : status === "yellow"
    ? { backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.28)" }
    : { backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.28)" };

  return (
    <PageShell>
      <CenteredCard maxWidth="2xl">
        <CardHeader>
          <div>
            <CardTitle>Connectivity Probe</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">Sandbox issuer probe (internal simulation)</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 px-3 rounded-lg inline-flex items-center gap-2" style={status ? chipStyle : {}}>
              <span className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: status === "green" ? "var(--hz-green)" : status === "yellow" ? "var(--hz-orange)" : "var(--hz-red)" }} />
              <span className="text-sm">{label}</span>
            </div>
            <Button onClick={runProbe}>Run Probe</Button>
          </div>
          <div className="text-xs text-muted-foreground">
            This probe is internal and does not call any external vendors. It simulates health states for the demo.
          </div>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}