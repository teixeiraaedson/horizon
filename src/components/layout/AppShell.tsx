"use client";

import React from "react";
import { Outlet } from "react-router-dom";

const AppShell = () => {
  // Pages already wrap themselves with Layout, so we just provide a layout route boundary here.
  return <Outlet />;
};

export default AppShell;