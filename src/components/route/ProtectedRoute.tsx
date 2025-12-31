"use client";

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useHttpSession } from "@/app/auth/HttpSessionContext";

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useHttpSession();
  const location = useLocation();

  const allowlist = [
    /^\/auth(\/.*)?$/,
    /^\/verify$/,
  ];
  const isAllowedRoute = allowlist.some((re) => re.test(location.pathname));
  if (isAllowedRoute) return <>{children}</>;

  if (loading) {
    return null;
  }

  if (!user) return <Navigate to="/auth" replace />;

  const isVerified = !!user.email_verified_at;
  if (!isVerified) return <Navigate to="/verify" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;