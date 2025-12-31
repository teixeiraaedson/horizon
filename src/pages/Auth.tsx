"use client";

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function meetsRules(pw: string) {
  const minLen = pw.length >= 12;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const num = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return minLen && upper && lower && num && special;
}

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSignUp = async () => {
    setError(null);
    const res = await supabase.auth.signUp({ email: email.trim(), password });
    if (res.error) {
      setError(res.error.message || "Sign up failed.");
      return;
    }
    // Navigate to verify page to instruct the user
    window.location.href = "/verify";
  };

  const onLogin = async () => {
    setError(null);
    const res = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (res.error) {
      setError(res.error.message || "Login failed.");
      return;
    }
    const { data } = await supabase.auth.getUser();
    const confirmed = !!data.user?.email_confirmed_at;
    window.location.href = confirmed ? "/dashboard" : "/verify";
  };

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader><CardTitle>Welcome to Horizon</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="text-xs text-muted-foreground">
              Password must be at least 12 characters with uppercase, lowercase, number, and special.
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <div className="flex gap-2">
              <Button onClick={onLogin}>Log in</Button>
              <Button variant="outline" onClick={onSignUp} disabled={!meetsRules(password)}>Sign up</Button>
            </div>
            <div className="text-xs">
              <a href="/forgot-password" className="underline">Forgot password?</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}