"use client";

import { Layout } from "@/components/Layout";
import { useAuth } from "@/app/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Auth() {
  const { signInMock } = useAuth();
  const [email, setEmail] = useState("user@demo.horizon");

  return (
    <Layout>
      <div className="max-w-md">
        <Card>
          <CardHeader><CardTitle>Sign in</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => signInMock(email, "user")}>Sign in as User</Button>
              <Button variant="outline" onClick={() => signInMock(email, "admin")}>Sign in as Admin</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}