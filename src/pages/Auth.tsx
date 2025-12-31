"use client";

import { Layout } from "@/components/Layout";
import { useAuth } from "@/app/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function meetsRules(pw: string) {
  const minLen = pw.length >= 12;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const num = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return minLen && upper && lower && num && special;
}

export default function Auth() {
  const { signUp, login } = useAuth();
  const [email, setEmail] = useState("user@demo.horizon");
  const [password, setPassword] = useState("DemoPassw0rd!");
  const [error, setError] = useState<string | null>(null);

  const onSignUp = () => {
    setError(null);
    const res = signUp(email.trim(), password);
    if (!res.ok) {
      setError(res.error || "Sign up failed.");
      return;
    }
    window.location.href = "/verify";
  };

  const onLogin = () => {
    setError(null);
    const res = login(email.trim(), password);
    if (!res.ok) {
      setError(res.error || "Login failed.");
      return;
    }
    window.location.href = "/dashboard";
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