"use client";

import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setMsg(null);
    setError(null);
    const target = email.trim();
    if (!target) {
      setError("Please enter your email.");
      return;
    }
    setSending(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const res = await supabase.auth.resetPasswordForEmail(target, { redirectTo });
    setSending(false);
    if (res.error) {
      setError(res.error.message || "Failed to send reset email.");
      return;
    }
    setMsg("Check your email for a password reset link.");
  };

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader><CardTitle>Forgot password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={submit} disabled={sending}>Send reset link</Button>
            {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}