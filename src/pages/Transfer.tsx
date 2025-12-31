"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMockStore } from "@/mock/store";
import { useNavigate } from "react-router-dom";

type WalletOption = { id: string; name: string };

export default function Transfer() {
  const { toast } = useToast();
  const mock = useMockStore();
  const navigate = useNavigate();

  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [fromWalletId, setFromWalletId] = useState<string>("");
  const [toWalletId, setToWalletId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const res = mock.listWallets();
    const opts = res.data.map((w) => ({ id: w.id, name: `${w.name} (${w.balance.toLocaleString()} USD)` }));
    setWallets(opts);
    // Preselect options if present
    const operating = res.data.find((w) => w.name.toLowerCase().includes("operating"));
    const treasury = res.data.find((w) => w.name.toLowerCase().includes("treasury"));
    if (operating) setFromWalletId(operating.id);
    if (treasury) setToWalletId(treasury.id);
  }, []);

  const notesLimit = 140;
  const isValid = fromWalletId && toWalletId && fromWalletId !== toWalletId && amount > 0 && notes.length <= notesLimit;

  const onSubmit = () => {
    if (!isValid) return;
    const res = mock.createSend({ fromWalletId, toWalletId, amount });
    if ("error" in res) {
      toast({ title: "Policy blocked", description: JSON.stringify(res.error.details ?? res.error.message) });
      return;
    }
    if (res.data.policyDecision === "REQUIRE_APPROVAL") {
      toast({ title: "Release required", description: "Added to Policy Rules queue (approval pending)." });
    } else {
      toast({ title: "Transfer request created", description: `Tx ${res.data.id.slice(0, 8)} for $${amount.toLocaleString()}` });
    }
    // Reset minimal fields
    setAmount(0);
    setNotes("");
  };

  return (
    <PageShell>
      <CenteredCard maxWidth="2xl">
        <CardHeader>
          <div>
            <CardTitle>Transfer Funds</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">Move stablecoin between wallets</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">From Wallet</Label>
            <Select value={fromWalletId} onValueChange={setFromWalletId}>
              <SelectTrigger className="input-dark mt-1">
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-muted-foreground">To Wallet</Label>
            <Select value={toWalletId} onValueChange={setToWalletId}>
              <SelectTrigger className="input-dark mt-1">
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-muted-foreground">Amount (USD)</Label>
            <Input
              className="input-dark mt-1"
              type="number"
              step="1"
              min="0"
              value={Number.isFinite(amount) ? amount : 0}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">Notes (optional, max 140)</Label>
            <Textarea
              className="input-dark mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, notesLimit))}
              placeholder="Add a short note (optional)"
            />
            <div className="mt-1 text-xs text-muted-foreground">{notesLimit - notes.length} characters left</div>
          </div>

          {/* Policy callout */}
          <div className="rounded-md border border-border bg-card/60 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Policy checks will run on submit</div>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  isValid
                    ? "border-[rgba(34,197,94,0.35)] text-[color:var(--hz-green)]"
                    : "border-[rgba(148,163,184,0.28)] text-muted-foreground"
                }`}
              >
                {isValid ? "Ready" : "Incomplete"}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-2 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="button" onClick={onSubmit} disabled={!isValid}>
              Transfer Funds
            </Button>
          </div>
        </CardContent>
      </CenteredCard>
    </PageShell>
  );
}