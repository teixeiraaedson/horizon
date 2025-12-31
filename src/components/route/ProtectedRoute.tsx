"use client";

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseSession } from "@/app/auth/SupabaseSessionContext";

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useSupabaseSession();
  const location = useLocation();

  // Allowlist: guard should never redirect these routes
  const allowlist = [
    /^\/auth(\/.*)?$/,
    /^\/verify$/,
    /^\/reset-password$/,
    /^\/invite(\/.*)?$/,
  ];
  const isAllowedRoute = allowlist.some((re) => re.test(location.pathname));
  if (isAllowedRoute) return <>{children}</>;

  if (loading) {
    return null;
  }

  if (!user) return <Navigate to="/auth" replace />;

  const isVerified = !!user.email_confirmed_at;
  if (!isVerified) return <Navigate to="/verify" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;