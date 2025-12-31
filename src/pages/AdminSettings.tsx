"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/app/settings/SettingsContext";
import { useToast } from "@/components/ui/use-toast";
import { addActivity } from "@/lib/mockActivity";

type AdminMockConfig = {
  requireApprovals: boolean;
  velocityThreshold: number;
};

function getAdminMock(): AdminMockConfig {
  const w = window as any;
  if (!w.__horizon_admin) {
    w.__horizon_admin = { requireApprovals: true, velocityThreshold: 10000 } as AdminMockConfig;
  }
  return w.__horizon_admin as AdminMockConfig;
}

export default function AdminSettings() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();

  const [requireApprovals, setRequireApprovals] = useState<boolean>(true);
  const [velocityThreshold, setVelocityThreshold] = useState<number>(10000);

  useEffect(() => {
    const mock = getAdminMock();
    setRequireApprovals(mock.requireApprovals);
    setVelocityThreshold(mock.velocityThreshold);
  }, []);

  const onSave = () => {
    const mock = getAdminMock();
    mock.requireApprovals = requireApprovals;
    mock.velocityThreshold = velocityThreshold;
    // Keep mock mode in SettingsContext consistent
    setSettings({ mockMode: settings.mockMode });
    toast({ title: "Settings saved", description: "Admin settings updated." });
    addActivity({
      actor: "admin",
      action: "Admin Settings Updated",
      entity: "settings",
      status: `approvals=${requireApprovals}, velocity=${velocityThreshold}`,
    });
  };

  return (
    <PageShell>
      <CenteredCard maxWidth="2xl">
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Mock Mode</div>
              <div className="text-sm text-muted-foreground">Run without backend (visible in header)</div>
            </div>
            <Switch checked={settings.mockMode} onCheckedChange={(v) => setSettings({ mockMode: v })} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Require Approvals</div>
              <div className="text-sm text-muted-foreground">Movements may require a second set of eyes</div>
            </div>
            <Switch checked={requireApprovals} onCheckedChange={setRequireApprovals} />
          </div>

          <div>
            <Label className="text-muted-foreground">Velocity Threshold (USD)</Label>
            <Input
              className="input-dark mt-1"
              type="number"
              value={velocityThreshold}
              onChange={(e) => setVelocityThreshold(Number(e.target.value))}
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <Button variant="outline">Cancel</Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}