"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const PROJECT_ID = "vbofqbuztblknzialrdp";
const ACCEPT_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/invites-accept`;

export default function InviteAccept() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const { signInMock, switchRole } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<"idle"|"ok"|"error">("idle");
  const [role, setRole] = useState<string>("user");
  const [message, setMessage] = useState<string>("");

  const accept = async () => {
    setMessage("");
    const res = await fetch(ACCEPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email })
    });
    const body = await res.json();
    if (res.ok) {
      const r = body.role || "user";
      setRole(r);
      // Create local mock user with the assigned role; mark as unverified for email verification flow
      signInMock(email, r);
      toast({ title: "Invite accepted", description: `Role assigned: ${r}. Please verify your email.` });
      setState("ok");
      window.location.href = "/verify";
    } else {
      setMessage(body?.error?.message || "Invite invalid or expired.");
      setState("error");
    }
  };

  useEffect(() => {
    if (token && email) {
      accept();
    } else {
      setState("error");
      setMessage("Missing token or email.");
    }
  }, []);

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader><CardTitle>Accept Invite</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {state === "idle" && <div className="text-sm">Processing...</div>}
            {state === "ok" && <div className="text-sm">Invite accepted. Redirecting…</div>}
            {state === "error" && <div className="text-sm text-red-500">{message}</div>}
            <Button onClick={() => window.location.href = "/auth"} variant="outline">Back to Auth</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}