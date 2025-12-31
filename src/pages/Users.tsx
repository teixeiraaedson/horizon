"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsers, inviteUser, type MockUser } from "@/lib/mockUsers";
import { useToast } from "@/components/ui/use-toast";

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<MockUser[]>([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const onInvite = () => {
    if (!email.trim()) return;
    const u = inviteUser(email.trim(), role);
    setUsers(getUsers());
    toast({ title: "Invite sent", description: `${u.email} (${u.role})` });
    setOpen(false);
    setEmail("");
    setRole("user");
  };

  return (
    <PageShell>
      <CenteredCard maxWidth="2xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Users</CardTitle>
          <Button onClick={() => setOpen(true)}>Invite User</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{u.email}</div>
                <div className="text-sm text-muted-foreground">{u.status}</div>
              </div>
              <Badge variant="outline">{u.role}</Badge>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-sm text-muted-foreground">No users yet</div>
          )}
        </CardContent>
      </CenteredCard>

      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input className="input-dark mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "user")}>
                <SelectTrigger className="input-dark mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onInvite} disabled={!email.trim()}>Invite</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}