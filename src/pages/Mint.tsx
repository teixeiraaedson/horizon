"use client";

import React, { useEffect, useState } from "react";
import PageCenter from "@/components/PageCenter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMockStore } from "@/mock/store";
import { useNavigate } from "react-router-dom";

type WalletOption = { id: string; name: string };

export default function Mint() {
  const { toast } = useToast();
  const mock = useMockStore();
  const navigate = useNavigate();

  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [walletId, setWalletId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const res = mock.listWallets();
    const opts = res.data.map((w) => ({ id: w.id, name: `${w.name} (${w.balance.toLocaleString()} USD)` }));
    setWallets(opts);
    // Preselect "Treasury" if present
    const treasury = res.data.find((w) => w.type === "treasury");
    if (treasury) setWalletId(treasury.id);
  }, []);

  const notesLimit = 140;
  const notesLeft = notesLimit - notes.length;
  const isValid = walletId && amount > 0 && notes.length <= notesLimit;

  const onSubmit = () => {
    if (!isValid) return;
    const res = mock.createFund({ walletId, amount });
    if ("error" in res) {
      toast({ title: "Policy blocked", description: res.error.message });
      return;
    }
    toast({ title: "Mint request created", description: `Tx ${res.data.id.slice(0, 8)} for $${amount.toLocaleString()}` });
    // Reset form
    setAmount(0);
    setNotes("");
  };

  return (
    <PageCenter maxWidth="2xl">
      <Card className="w-full rounded-2xl card-sheen">
        <CardHeader>
          <div>
            <CardTitle>Mint USDP</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">Issue new stablecoin tokens to treasury</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
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
            <Label className="text-muted-foreground">Counterparty</Label>
            <Select value={walletId} onValueChange={setWalletId}>
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
            <Label className="text-muted-foreground">Notes (optional, max 140)</Label>
            <Textarea
              className="input-dark mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, notesLimit))}
              placeholder="Add a short note (optional)"
            />
            <div className="mt-1 text-xs text-muted-foreground">{notesLeft} characters left</div>
          </div>

          {/* Policy check callout */}
          <div className="rounded-md border border-border bg-card/60 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Policy checks will run on submit</div>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  isValid
                    ? "border-[rgba(34,197,94,0.35)] text-[color:var(--hz-green)]"
                    : "border-[rgba(148,163,184,0.28)] text-muted-foreground"
                }`}
                aria-label={isValid ? "Form complete" : "Form incomplete"}
              >
                {isValid ? "Ready" : "Incomplete"}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!isValid}
              className="bg-[color:var(--hz-green)] text-[color:#0b0f16] hover:brightness-[1.05]"
              aria-label="Mint USDP"
            >
              Mint USDP
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageCenter>
  );
}