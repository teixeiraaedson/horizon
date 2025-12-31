"use client";

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";

type Props = { children: React.ReactNode };

const AdminRoute: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default AdminRoute;