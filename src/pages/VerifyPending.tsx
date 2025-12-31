"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/app/auth/SupabaseSessionContext";

export default function VerifyPending() {
  const { user } = useSupabaseSession();
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [sent, setSent] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const resend = async () => {
    setSent(false);
    setStatusMsg(null);
    const target = email.trim();
    if (!target) {
      setStatusMsg("Please enter your email to resend the verification message.");
      return;
    }
    const res = await supabase.auth.resend({ type: "signup", email: target });
    if (res.error) {
      setStatusMsg(res.error.message || "Failed to resend verification email.");
      return;
    }
    setSent(true);
    setStatusMsg("Verification email sent. Please check your inbox.");
  };

  const refreshStatus = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      setStatusMsg(error.message);
      return;
    }
    const confirmed = !!data.user?.email_confirmed_at;
    if (confirmed) {
      setStatusMsg("Email verified! Redirecting...");
      setTimeout(() => window.location.replace("/dashboard"), 500);
    } else {
      setStatusMsg("Still pending confirmation. Refresh again after clicking the email link.");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.replace("/auth");
  };

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {user?.email ? `Signed up as ${user.email}` : "Signed up: check your email for a verification link"}
            </div>
            <div className="text-sm">
              Check your email to verify. You must verify before accessing the app.
            </div>
            <div className="space-y-2">
              <Input
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={resend}>Resend verification email</Button>
                <Button variant="outline" onClick={refreshStatus}>Refresh status</Button>
                <Button variant="outline" onClick={signOut}>Sign out</Button>
              </div>
            </div>
            {sent && <div className="text-xs text-muted-foreground">Verification email sent</div>}
            {statusMsg && <div className="text-xs text-muted-foreground">{statusMsg}</div>}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}