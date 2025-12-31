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
  const { user, signOut } = useAuth();
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
    <div className="sticky top-0 z-30 border-b bg-[rgba(11,18,32,0.65)] backdrop-blur-md" style={{ borderBottomColor: "rgba(148,163,184,0.08)" }}>
      <div className="h-14 sm:h-16 px-4 flex items-center justify-between py-2">
        {/* Left: page title + subtitle only (no logo) */}
        <div className="flex items-center min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate">{meta.title}</h1>
            <div className="text-xs text-muted-foreground truncate">{meta.subtitle}</div>
          </div>
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
            <DropdownMenuContent align="end" className="bg-card border border-border p-2 min-w-[200px]">
              <DropdownMenuItem className="hover:bg-muted/20" onClick={() => navigate("/users")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-muted/20" onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-muted/20 text-red-500" onClick={() => signOut()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};