"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent, Card } from "@/components/ui/card";
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

const PROJECT_ID = "vbofqbuztblknzialrdp";
const INVITES_CREATE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/invites-create`;
const INVITES_LIST_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/invites-list`;
const INVITES_EXPIRE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/invites-expire`;

export default function AdminSettings() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();

  const [requireApprovals, setRequireApprovals] = useState<boolean>(true);
  const [velocityThreshold, setVelocityThreshold] = useState<number>(10000);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "readonly">("user");
  const [invites, setInvites] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const mock = getAdminMock();
    setRequireApprovals(mock.requireApprovals);
    setVelocityThreshold(mock.velocityThreshold);
    // Load invites
    refreshInvites();
  }, []);

  const refreshInvites = async () => {
    const res = await fetch(INVITES_LIST_URL, {
      headers: { "Authorization": "Bearer admin" }
    });
    const body = await res.json();
    if (res.ok) setInvites(body.data || []);
  };

  const onSave = () => {
    const mock = getAdminMock();
    mock.requireApprovals = requireApprovals;
    mock.velocityThreshold = velocityThreshold;
    setSettings({ mockMode: settings.mockMode });
    toast({ title: "Settings saved", description: "Admin settings updated." });
    addActivity({
      actor: "admin",
      action: "Admin Settings Updated",
      entity: "settings",
      status: `approvals=${requireApprovals}, velocity=${velocityThreshold}`,
    });
  };

  const createInvite = async () => {
    if (!email.trim()) {
      toast({ title: "Missing email", description: "Enter an email to invite." });
      return;
    }
    setCreating(true);
    const res = await fetch(INVITES_CREATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer admin" },
      body: JSON.stringify({ email: email.trim(), role, created_by: "admin" })
    });
    setCreating(false);
    const body = await res.json();
    if (!res.ok) {
      toast({ title: "Invite failed", description: body?.error?.message || "Unknown error" });
      return;
    }
    const link = body.inviteLink as string;
    toast({ title: "Invite created", description: "Copy and share the invite link." });
    await navigator.clipboard.writeText(link);
    setEmail("");
    refreshInvites();
  };

  const expireInvite = async (id: string) => {
    const res = await fetch(INVITES_EXPIRE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer admin" },
      body: JSON.stringify({ invite_id: id })
    });
    if (res.ok) {
      toast({ title: "Invite expired", description: "The invite is now expired." });
      refreshInvites();
    }
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
            <Input className="input-dark mt-1" type="number" value={velocityThreshold} onChange={(e) => setVelocityThreshold(Number(e.target.value))} />
          </div>

          {/* Invites section */}
          <Card className="mt-6">
            <CardHeader><CardTitle>Invites</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input placeholder="Invite email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <select className="input-dark rounded-md px-2 py-1" value={role} onChange={(e) => setRole(e.target.value as any)}>
                  <option value="user">User</option>
                  <option value="readonly">ReadOnly</option>
                </select>
                <Button onClick={createInvite} disabled={creating}>Create Invite</Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Single-use invite expires in 24 hours. If email sending isn't configured, the link is copied to your clipboard.
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Expires</th>
                      <th className="text-left py-2">Used</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((inv) => (
                      <tr key={inv.id} className="border-t border-border">
                        <td className="py-2">{inv.email}</td>
                        <td className="py-2">{inv.role}</td>
                        <td className="py-2">{new Date(inv.expires_at).toLocaleString()}</td>
                        <td className="py-2">{inv.used_at ? new Date(inv.used_at).toLocaleString() : "—"}</td>
                        <td className="py-2">
                          <Button variant="outline" size="sm" onClick={() => expireInvite(inv.id)}>Expire Now</Button>
                        </td>
                      </tr>
                    ))}
                    {invites.length === 0 && (
                      <tr><td className="py-3 text-muted-foreground" colSpan={5}>No invites yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}