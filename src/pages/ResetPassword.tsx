"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

function meetsRules(pw: string) {
  const minLen = pw.length >= 12;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const num = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return { minLen, upper, lower, num, special, ok: minLen && upper && lower && num && special };
}

export default function ResetPassword() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(true);
  const [exchangeOk, setExchangeOk] = useState(false);
  const [updating, setUpdating] = useState(false);
  const rules = useMemo(() => meetsRules(pw), [pw]);

  useEffect(() => {
    const run = async () => {
      try {
        const url = window.location.href;
        const res = await supabase.auth.exchangeCodeForSession(url);
        console.log("[reset.exchangeCodeForSession] result:", res);
        if (res.error) {
          setError("Reset link invalid or expired. Please request a new link.");
          setExchangeOk(false);
        } else {
          setExchangeOk(true);
        }
      } catch (e) {
        console.error("ResetPassword exchange error:", e);
        setError("Unexpected error while validating reset link.");
        setExchangeOk(false);
      } finally {
        setExchanging(false);
      }
    };
    run();
  }, []);

  const submit = async () => {
    setMsg(null);
    setError(null);
    if (!exchangeOk) {
      setError("Reset link invalid or expired.");
      return;
    }
    if (!rules.ok) {
      setError("Password does not meet complexity requirements.");
      return;
    }
    if (pw !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setUpdating(true);
    const res = await supabase.auth.updateUser({ password: pw });
    setUpdating(false);
    if (res.error) {
      setError(res.error.message || "Failed to update password.");
      return;
    }
    setMsg("Password reset successful! Redirecting to your dashboard...");
    setTimeout(() => { window.location.replace("/dashboard"); }, 1000);
  };

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader><CardTitle>Reset password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {exchanging && (
              <div className="text-sm text-muted-foreground">Validating reset link...</div>
            )}
            {!exchanging && !exchangeOk && (
              <div className="space-y-2">
                <div className="text-sm text-red-500">{error}</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.location.replace("/forgot-password")}>Request new link</Button>
                  <Button onClick={() => window.location.replace("/auth")}>Go to login</Button>
                </div>
              </div>
            )}
            {!exchanging && exchangeOk && (
              <>
                <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
                <Input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                <div className="text-xs text-muted-foreground">
                  Must be 12+ chars, include uppercase, lowercase, number, and special.
                  <div className="mt-1">
                    <span className={rules.minLen ? "text-green-500" : "text-red-500"}>Length</span>{" · "}
                    <span className={rules.upper ? "text-green-500" : "text-red-500"}>Upper</span>{" · "}
                    <span className={rules.lower ? "text-green-500" : "text-red-500"}>Lower</span>{" · "}
                    <span className={rules.num ? "text-green-500" : "text-red-500"}>Number</span>{" · "}
                    <span className={rules.special ? "text-green-500" : "text-red-500"}>Special</span>
                  </div>
                </div>
                <Button onClick={submit} disabled={!rules.ok || updating}>Reset password</Button>
              </>
            )}
            {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
            {error && exchangeOk && <div className="text-sm text-red-500">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}