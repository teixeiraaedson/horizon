"use client";

import { useAuth } from "@/app/auth/AuthContext";
import { useSettings } from "@/app/settings/SettingsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export const AppHeader = () => {
  const { user, switchRole } = useAuth();
  const { settings } = useSettings();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <img src="/src/assets/horizon-logo.png" className="h-7 w-auto" alt="Horizon Logo" />
        <div className="leading-tight">
          <div className="font-semibold">Horizon</div>
          <div className="text-xs text-muted-foreground -mt-0.5">Treasury Management Suite</div>
        </div>
        {settings.mockMode && <Badge className="ml-3" variant="secondary">Mock Mode</Badge>}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden sm:inline-flex">Role: {user?.role}</Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {user?.email ?? "Guest"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => switchRole("user")}>Switch to User</DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole("admin")}>Switch to Admin</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};