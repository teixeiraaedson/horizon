"use client";

import React from "react";
import { Navigate } from "react-router-dom";
import { useSupabaseSession } from "@/app/auth/SupabaseSessionContext";

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useSupabaseSession();

  if (loading) {
    // While we determine session, render nothing to avoid flicker
    return null;
  }

  if (!user) return <Navigate to="/auth" replace />;

  const isVerified = !!user.email_confirmed_at;
  if (!isVerified) return <Navigate to="/verify" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;