"use client";

import { useAuth } from "@/app/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchInput } from "@/components/SearchInput";
import { useMockStore } from "@/mock/store";
import { pageMeta } from "@/lib/pageMeta";

export const AppHeader = () => {
  const { user, switchRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const mock = useMockStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setPendingCount(mock.listPending().data.length);
  }, []);

  const meta = pageMeta(location.pathname);
  const initials = (user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="sticky top-0 z-20 bg-gradient-to-b from-[rgba(11,18,32,0.86)] to-[rgba(11,18,32,0.62)] border-b border-[var(--hz-border)]">
      <div className="h-14 sm:h-16 px-4 flex items-center justify-between">
        {/* Left: page title + subtitle */}
        <div className="min-w-0">
          <div className="text-lg sm:text-xl font-semibold tracking-tight truncate">{meta.title}</div>
          <div className="text-xs text-muted-foreground truncate">{meta.subtitle}</div>
        </div>

        {/* Right: search, bell, avatar */}
        <div className="flex items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search..." />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <div className="relative">
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] rounded-full"
                  style={{ backgroundColor: "var(--hz-orange)", color: "#0b0f16" }}
                >
                  {pendingCount}
                </span>
              )}
            </div>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[rgba(148,163,184,0.22)] text-[var(--hz-text)] flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
                <span className="hidden sm:inline truncate max-w-[160px]">{user?.email ?? "Guest"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => switchRole("user")}>Switch to User</DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole("admin")}>Switch to Admin</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/auth")}>Sign in</DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};