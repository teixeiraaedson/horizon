"use client";

import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/app/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = () => {
    const res = forgotPassword(email.trim());
    if (res.ok) {
      setToken(res.token || null);
      setMsg("Check your email for a reset link (simulated).");
    } else {
      setMsg("Email not found.");
    }
  };

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader><CardTitle>Forgot password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={submit}>Send reset link</Button>
            {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
            {token && (
              <div className="text-xs">
                Dev-only: reset link
                <a href={`/reset-password?token=${token}`} className="ml-1 underline">Open reset page</a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}