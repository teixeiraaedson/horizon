"use client";

import { ReactNode } from "react";

export const DataTable = ({ children }: { children: ReactNode }) => {
  return <div className="overflow-x-auto"><div className="data-table min-w-[720px]">{children}</div></div>;
};