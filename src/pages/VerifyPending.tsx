"use client";

import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/auth/AuthContext";

export default function VerifyPending() {
  const { user, verify } = useAuth();
  const [sent, setSent] = useState(false);

  const resend = () => {
    setSent(true);
  };

  const iVerified = () => {
    if (user) verify(user.email);
    window.location.href = "/dashboard";
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
              {user?.email ? `Signed up as ${user.email}` : "Signed up"}
            </div>
            <div className="text-sm">
              Check your email to verify. You must verify before accessing the app.
            </div>
            <div className="flex gap-2">
              <Button onClick={resend}>Resend verification email</Button>
              <Button variant="outline" onClick={iVerified}>I verified</Button>
            </div>
            {sent && <div className="text-xs text-muted-foreground">Verification email sent (simulated)</div>}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}