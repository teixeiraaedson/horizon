"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyPending() {
  const [email, setEmail] = useState<string>("");
  const [sent, setSent] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const pending = localStorage.getItem("pendingEmail") || "";
    if (pending) setEmail(pending);
  }, []);

  const resend = async () => {
    setSent(false);
    setStatusMsg(null);
    const target = email.trim();
    if (!target) {
      setStatusMsg("Please enter your email to resend the verification message.");
      return;
    }
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: target }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatusMsg(body?.error?.message || "Failed to resend verification email.");
      return;
    }
    setSent(true);
    setStatusMsg("Verification email sent. Please check your inbox.");
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
              {email ? `Pending verification for ${email}` : "Enter your email to resend the verification link."}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={resend}>Resend verification email</Button>
                <Button variant="outline" onClick={() => window.location.replace("/auth")}>Back to login</Button>
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