"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMockStore } from "@/mock/store";
import type { UUID } from "@/types/core";

type RuleKind = "LIMIT" | "APPROVAL" | "VELOCITY";
type PolicyRule = {
  id: UUID;
  name: string;
  kind: RuleKind;
  description?: string;
  enabled: boolean;
  updatedAt: string;
};

// Helpers for mock persistence
function rid(): UUID {
  return crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) as UUID);
}
function now(): string {
  return new Date().toISOString();
}

export default function PolicyRules() {
  const { toast } = useToast();
  const mock = useMockStore();

  // Ensure mock DB exists so we can append to Activity Log
  useEffect(() => {
    mock.seed();
  }, []);

  // Load rules from a window-scoped mock store
  const [rules, setRules] = useState<PolicyRule[]>([]);
  useEffect(() => {
    const store = (window as any).__horizon_policy_rules || { rules: [] as PolicyRule[] };
    (window as any).__horizon_policy_rules = store;
    setRules(store.rules);
  }, []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PolicyRule | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [kind, setKind] = useState<RuleKind>("LIMIT");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);

  const isValid = useMemo(() => !!name.trim(), [name]);

  const resetForm = () => {
    setName("");
    setKind("LIMIT");
    setDescription("");
    setEnabled(true);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (r: PolicyRule) => {
    setEditing(r);
    setName(r.name);
    setKind(r.kind);
    setDescription(r.description || "");
    setEnabled(r.enabled);
    setOpen(true);
  };

  const saveRule = () => {
    if (!isValid) return;
    const store = (window as any).__horizon_policy_rules;
    const updatedAt = now();

    if (editing) {
      const updated: PolicyRule = { ...editing, name, kind, description, enabled, updatedAt };
      store.rules = store.rules.map((r: PolicyRule) => (r.id === editing.id ? updated : r));
      setRules(store.rules);
      toast({ title: "Rule updated", description: `${updated.name} saved.` });
      appendAudit("POLICY_EVALUATED", {
        event: "policy_rule_updated",
        name: updated.name,
        kind: updated.kind,
        enabled: updated.enabled,
      });
    } else {
      const created: PolicyRule = {
        id: rid(),
        name,
        kind,
        description,
        enabled,
        updatedAt,
      };
      store.rules.push(created);
      setRules([...store.rules]);
      toast({ title: "Rule created", description: `${created.name} added.` });
      appendAudit("POLICY_EVALUATED", {
        event: "policy_rule_created",
        name: created.name,
        kind: created.kind,
        enabled: created.enabled,
      });
    }

    setOpen(false);
    resetForm();
  };

  // Append an activity log entry to the mock DB
  function appendAudit(action: "POLICY_EVALUATED", payload: Record<string, unknown>) {
    const db = (window as any).__horizon_db;
    if (!db) return;
    db.audit.push({
      id: rid(),
      actorId: null,
      actorEmail: null,
      action,
      resource: "balance",
      resourceId: rid(),
      policyVersion: null,
      reasonCodes: [],
      payload,
      createdAt: now(),
    });
  }

  return (
    <PageShell>
      <CenteredCard maxWidth="3xl">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Policy Rules</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">Control limits and approvals for movements</div>
          </div>
          <Button onClick={openCreate}>Create Rule</Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No policy rules yet
                    </TableCell>
                  </TableRow>
                )}
                {rules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{r.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {r.kind === "LIMIT" ? "Limit" : r.kind === "APPROVAL" ? "Approval" : "Velocity"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{r.enabled ? "Enabled" : "Disabled"}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(r.updatedAt).toLocaleString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toast({ title: r.name, description: r.description || "No description." })
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </CenteredCard>

      <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Rule" : "Create Rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <Input
                className="input-dark mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Daily Transfer Limit"
              />
            </div>

            <div>
              <Label className="text-muted-foreground">Type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as RuleKind)}>
                <SelectTrigger className="input-dark mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIMIT">Limit</SelectItem>
                  <SelectItem value="APPROVAL">Approval</SelectItem>
                  <SelectItem value="VELOCITY">Velocity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-muted-foreground">Description</Label>
              <Textarea
                className="input-dark mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of the rule"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-muted-foreground">Enabled</Label>
                <div className="text-xs text-muted-foreground">Toggle to activate or deactivate the rule</div>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={saveRule} disabled={!isValid}>
                {editing ? "Save Changes" : "Save Rule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}