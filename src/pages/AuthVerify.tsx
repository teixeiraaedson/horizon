"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthVerify() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const [msg, setMsg] = useState<string>("Verifying your email...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setError("Missing token.");
        setMsg("");
        return;
      }
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body?.error?.message || "Verification link invalid or expired.");
          setMsg("");
          return;
        }
        setMsg("Verified! Redirecting...");
        setTimeout(() => window.location.replace("/dashboard"), 800);
      } catch {
        setError("Unexpected error while verifying.");
        setMsg("");
      }
    };
    run();
  }, [token]);

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader><CardTitle>Email Verification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
            {error && (
              <>
                <div className="text-sm text-red-500">{error}</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.location.replace("/verify")}>Go to Verify</Button>
                  <Button onClick={() => window.location.replace("/auth")}>Back to Login</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}