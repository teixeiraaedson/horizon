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
  const INVITE_ONLY = String((import.meta as any).env?.VITE_INVITE_ONLY ?? "false").toLowerCase() === "true";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    setError(null);
    if (INVITE_ONLY) return;
    if (!meetsRules(password)) {
      setError("Password does not meet complexity rules.");
      return;
    }
    setLoading(true);
    const res = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (res.error) {
      setError(res.error.message || "Sign up failed.");
      return;
    }
    window.location.href = "/verify";
  };

  const onLogin = async () => {
    setError(null);
    setLoading(true);
    const res = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (res.error) {
      setError(res.error.message || "Login failed.");
      return;
    }
    const { data } = await supabase.auth.getUser();
    const confirmed = !!data.user?.email_confirmed_at;
    window.location.href = confirmed ? "/dashboard" : "/verify";
  };

  const submitDisabled =
    loading ||
    (mode === "signup" ? INVITE_ONLY || !meetsRules(password) : false);

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader><CardTitle>Welcome to Horizon</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={mode === "login" ? "default" : "outline"}
                onClick={() => setMode("login")}
              >
                Log in
              </Button>
              <Button
                variant={mode === "signup" ? "default" : "outline"}
                onClick={() => setMode("signup")}
              >
                Sign up
              </Button>
            </div>

            <Input
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder={mode === "signup" ? "Create a password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {mode === "signup" && (
              <div className="text-xs text-muted-foreground">
                Password must be at least 12 characters with uppercase, lowercase, number, and special.
                {INVITE_ONLY && (
                  <div className="mt-1 text-amber-600">
                    Invites only. Ask the admin for an invite link.
                  </div>
                )}
                <div className="mt-1 text-muted-foreground">
                  Need access? Contact your admin for an invite.
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-500">{error}</div>}

            <div className="flex gap-2">
              {mode === "login" ? (
                <Button onClick={onLogin} disabled={submitDisabled}>Log in</Button>
              ) : (
                <Button variant="outline" onClick={onSignUp} disabled={submitDisabled}>Sign up</Button>
              )}
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