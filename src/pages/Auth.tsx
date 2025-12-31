"use client";

import { Layout } from "@/components/Layout";
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
  const INVITE_ONLY = String((import.meta as any).env?.VITE_INVITE_ONLY ?? "false").toLowerCase() === "true";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const [showResetRequest, setShowResetRequest] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const onSignUp = async () => {
    setError(null);
    setResendMsg(null);
    setSignupSuccess(false);

    if (INVITE_ONLY) return;
    if (!meetsRules(password)) {
      setError("Password does not meet complexity rules.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim(), password }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error?.message || "Sign up failed.");
      return;
    }
    setSignupSuccess(true);
    localStorage.setItem("pendingEmail", email.trim());
  };

  const onLogin = async () => {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim(), password }),
    });
    setLoading(false);
    if (!res.ok) {
      let code = "";
      try {
        const body = await res.json();
        code = body?.error?.code || "";
      } catch {}
      if (res.status === 403 && code === "EMAIL_NOT_VERIFIED") {
        localStorage.setItem("pendingEmail", email.trim());
        window.location.replace("/verify");
        return;
      }
      setError("Login failed.");
      return;
    }
    window.location.replace("/dashboard");
  };

  const resendVerification = async () => {
    setResendMsg(null);
    const target = email.trim() || localStorage.getItem("pendingEmail") || "";
    if (!target) {
      setResendMsg("Please enter your email to resend the verification message.");
      return;
    }
    const res = await fetch("/api/auth/request-verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: target }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setResendMsg(body?.error?.message || "Failed to resend verification email.");
      return;
    }
    setResendMsg("Verification email sent. Please check your inbox.");
  };

  const requestPasswordReset = async () => {
    setResetMsg(null);
    const target = email.trim();
    if (!target) {
      setResetMsg("Enter your email to request a reset link.");
      return;
    }
    const res = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: target }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setResetMsg(body?.error?.message || "If an account exists, a reset email has been sent.");
      return;
    }
    setResetMsg("If an account exists, a reset email has been sent.");
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
                onClick={() => { setMode("login"); setError(null); }}
              >
                Log in
              </Button>
              <Button
                variant={mode === "signup" ? "default" : "outline"}
                onClick={() => { setMode("signup"); setError(null); }}
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

            {mode === "signup" && signupSuccess && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Check your email to verify your account.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resendVerification}>Resend verification email</Button>
                  <Button onClick={() => window.location.replace("/verify")}>Go to Verify</Button>
                </div>
                {resendMsg && <div className="text-xs text-muted-foreground">{resendMsg}</div>}
              </div>
            )}

            <div className="text-xs">
              <button className="underline" onClick={() => setShowResetRequest((s) => !s)}>Forgot password?</button>
            </div>

            {showResetRequest && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Enter your email and we'll send a password reset link.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={requestPasswordReset}>Send reset link</Button>
                  <Button onClick={() => window.location.replace("/auth/reset-password")}>I have a token</Button>
                </div>
                {resetMsg && <div className="text-xs text-muted-foreground">{resetMsg}</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}