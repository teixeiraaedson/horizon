"use client";

import React, { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/app/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function meetsRules(pw: string) {
  const minLen = pw.length >= 12;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const num = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return { minLen, upper, lower, num, special, ok: minLen && upper && lower && num && special };
}

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const rules = useMemo(() => meetsRules(pw), [pw]);

  const submit = () => {
    const res = resetPassword(token, pw);
    if (res.ok) {
      setMsg("Password reset successful. You can now log in.");
      setTimeout(() => { window.location.href = "/auth"; }, 1200);
    } else {
      setMsg(res.error || "Reset failed.");
    }
  };

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader><CardTitle>Reset password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <div className="text-xs text-muted-foreground">
              Must be 12+ chars, include uppercase, lowercase, number, and special.
              <div className="mt-1">
                <span className={rules.minLen ? "text-green-500" : "text-red-500"}>Length</span>{" · "}
                <span className={rules.upper ? "text-green-500" : "text-red-500"}>Upper</span>{" · "}
                <span className={rules.lower ? "text-green-500" : "text-red-500"}>Lower</span>{" · "}
                <span className={rules.num ? "text-green-500" : "text-red-500"}>Number</span>{" · "}
                <span className={rules.special ? "text-green-500" : "text-red-500"}>Special</span>
              </div>
            </div>
            <Button onClick={submit} disabled={!rules.ok}>Reset</Button>
            {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}