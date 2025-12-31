"use client";

import { ReactNode } from "react";

export const DataTable = ({ children }: { children: ReactNode }) => {
  return (
    <div className="overflow-x-auto rounded-xl overflow-hidden">
      <div className="data-table">{children}</div>
    </div>
  );
};