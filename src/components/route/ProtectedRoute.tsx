"use client";

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if ((user as any).verified === false) return <Navigate to="/verify" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;