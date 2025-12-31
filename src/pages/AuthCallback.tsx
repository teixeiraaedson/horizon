"use client";

import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const [status, setStatus] = useState<"working" | "success" | "error">("working");
  const [message, setMessage] = useState<string>("Completing verification...");

  useEffect(() => {
    const run = async () => {
      try {
        const url = window.location.href;
        const res = await supabase.auth.exchangeCodeForSession(url);
        console.log("[auth.exchangeCodeForSession] result:", res);
        if (res.error) {
          setStatus("error");
          setMessage("Could not complete verification. Please try refreshing or resend the email.");
          return;
        }
        // After exchanging, check verification status
        const { data } = await supabase.auth.getUser();
        const confirmed = !!data.user?.email_confirmed_at;
        if (confirmed) {
          setStatus("success");
          setMessage("Verification complete! Redirecting to your dashboard...");
          setTimeout(() => {
            window.location.replace("/dashboard");
          }, 800);
        } else {
          setStatus("success");
          setMessage("Session established, but email still pending confirmation. You can refresh status on the Verify page.");
          setTimeout(() => {
            window.location.replace("/verify");
          }, 1200);
        }
      } catch (e) {
        console.error("AuthCallback error:", e);
        setStatus("error");
        setMessage("Unexpected error while completing verification.");
      }
    };
    run();
  }, []);

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
          </CardHeader>
        </Card>
        <Card className="mt-3">
          <CardContent className="space-y-4">
            <div className="text-sm">
              {message}
            </div>
            {status !== "working" && (
              <div className="flex gap-2">
                <Button onClick={() => window.location.replace("/dashboard")}>Go to Dashboard</Button>
                <Button variant="outline" onClick={() => window.location.replace("/verify")}>Go to Verify</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}