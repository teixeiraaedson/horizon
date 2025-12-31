import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Fund from "./pages/Fund";
import Send from "./pages/Send";
import Withdraw from "./pages/Withdraw";
import ReleaseQueue from "./pages/ReleaseQueue";
import AuditTrail from "./pages/AuditTrail";
import Webhooks from "./pages/Webhooks";
import Wallets from "./pages/Wallets";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import { SettingsProvider } from "./app/settings/SettingsContext";
import { AuthProvider } from "./app/auth/AuthContext";

// New pages
import Mint from "./pages/Mint";
import Transfer from "./pages/Transfer";
import Redeem from "./pages/Redeem";
import PolicyRules from "./pages/PolicyRules";
import ActivityLog from "./pages/ActivityLog";
import Users from "./pages/Users";
import AdminSettings from "./pages/AdminSettings";
import AppShell from "./components/layout/AppShell";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* New Lovable-style routes */}
                <Route path="/mint" element={<Mint />} />
                <Route path="/transfer" element={<Transfer />} />
                <Route path="/redeem" element={<Redeem />} />
                <Route path="/policy-rules" element={<PolicyRules />} />
                <Route path="/activity-log" element={<ActivityLog />} />
                <Route path="/webhooks" element={<Webhooks />} />
                <Route path="/wallets" element={<Wallets />} />
                <Route path="/users" element={<Users />} />
                <Route path="/admin-settings" element={<AdminSettings />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/auth" element={<Auth />} />

                {/* Legacy redirects to new pages */}
                <Route path="/fund" element={<Navigate to="/mint" replace />} />
                <Route path="/send" element={<Navigate to="/transfer" replace />} />
                <Route path="/withdraw" element={<Navigate to="/redeem" replace />} />
                <Route path="/audit-trail" element={<Navigate to="/activity-log" replace />} />
                <Route path="/release-queue" element={<Navigate to="/policy-rules" replace />} />

                {/* Existing pages retained (if navigated directly) */}
                <Route path="/audit" element={<AuditTrail />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;