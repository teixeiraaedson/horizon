"use client";

import { Layout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { withdrawSchema } from "@/schemas/transactions";
import { z } from "zod";
import { useMockStore } from "@/mock/store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PageShell } from "@/components/layout/PageShell";
import { CenteredCard } from "@/components/layout/CenteredCard";

type FormValues = z.infer<typeof withdrawSchema>;

export default function Withdraw() {
  const { toast } = useToast();
  const mock = useMockStore();
  const [wallets, setWallets] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    setWallets(mock.listWallets().data.map((w) => ({ id: w.id, name: `${w.name} (${w.balance.toLocaleString()} USD)` })));
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { walletId: "", amount: 500, bankReference: "" },
  });

  const onSubmit = (values: FormValues) => {
    const res = mock.createWithdraw(values);
    if ("error" in res) {
      toast({ title: "Policy blocked", description: JSON.stringify(res.error.details) });
    } else {
      toast({ title: "Withdrawal completed", description: `Transaction ${res.data.id.slice(0,8)} completed.` });
      form.reset({ walletId: "", amount: 500, bankReference: "" });
    }
  };

  return (
    <Layout>
      <PageShell>
        <CenteredCard maxWidth="2xl">
          <CardHeader>
            <CardTitle>Withdraw</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">From Wallet</label>
                <Select onValueChange={(v) => form.setValue("walletId", v)} value={form.watch("walletId")}>
                  <SelectTrigger className="input-dark"><SelectValue placeholder="Select wallet" /></SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (<SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Amount (USD)</label>
                <Input className="input-dark" type="number" step="1" {...form.register("amount", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">Bank Reference</label>
                <Input className="input-dark" type="text" {...form.register("bankReference")} placeholder="Optional note" />
              </div>
              <Button type="submit" className="hover:shadow-[0_0_24px_rgba(56,189,248,0.10)]">Withdraw</Button>
            </form>
          </CardContent>
        </CenteredCard>
      </PageShell>
    </Layout>
  );
}