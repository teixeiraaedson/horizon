"use client";

import { Layout } from "@/components/Layout";
import { useSettings } from "@/app/settings/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { settings, setSettings } = useSettings();

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="surface-2 card-hover">
          <CardHeader><CardTitle>Mode</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Mock Mode</div>
                <div className="text-sm text-muted-foreground">Run without Supabase backend</div>
              </div>
              <Switch checked={settings.mockMode} onCheckedChange={(v) => setSettings({ mockMode: v })} />
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--orange)" }}></span>
              WEBHOOK_SECRET configured: <span className="font-semibold">Unknown (mock)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-2 card-hover">
          <CardHeader><CardTitle>Policy</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground">Approval Threshold (USD)</Label>
                <Input type="number" value={settings.approvalThresholdUSD} onChange={(e) => setSettings({ approvalThresholdUSD: Number(e.target.value) })} className="input-dark" />
              </div>
              <div>
                <Label className="text-muted-foreground">Per-Transaction Limit (USD)</Label>
                <Input type="number" value={settings.txLimitUSD} onChange={(e) => setSettings({ txLimitUSD: Number(e.target.value) })} className="input-dark" />
              </div>
              <div>
                <Label className="text-muted-foreground">Daily Limit (USD)</Label>
                <Input type="number" value={settings.dailyLimitUSD} onChange={(e) => setSettings({ dailyLimitUSD: Number(e.target.value) })} className="input-dark" />
              </div>
              <div>
                <Label className="text-muted-foreground">Timelock Start (UTC)</Label>
                <Input value={settings.timelockStart} onChange={(e) => setSettings({ timelockStart: e.target.value })} className="input-dark" />
              </div>
              <div>
                <Label className="text-muted-foreground">Timelock End (UTC)</Label>
                <Input value={settings.timelockEnd} onChange={(e) => setSettings({ timelockEnd: e.target.value })} className="input-dark" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}