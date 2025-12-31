import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Webhooks from "./pages/Webhooks";
import Wallets from "./pages/Wallets";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import { SettingsProvider } from "./app/settings/SettingsContext";
import { AuthProvider } from "./app/auth/AuthContext";
import Mint from "./pages/Mint";
import Transfer from "./pages/Transfer";
import Redeem from "./pages/Redeem";
import Fund from "./pages/Fund";
import Send from "./pages/Send";
import Withdraw from "./pages/Withdraw";
import PolicyRules from "./pages/PolicyRules";
import ActivityLog from "./pages/ActivityLog";
import Users from "./pages/Users";
import AdminSettings from "./pages/AdminSettings";
import AuditTrail from "./pages/AuditTrail";
import AppShell from "./components/layout/AppShell";
import ConnectivityProbe from "./pages/ConnectivityProbe";
import VerifyPending from "./pages/VerifyPending";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/route/ProtectedRoute";
import AdminRoute from "./components/route/AdminRoute";

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
              {/* Public auth-related routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify" element={<VerifyPending />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* App shell and protected routes */}
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected app pages */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/mint" element={<ProtectedRoute><Fund /></ProtectedRoute>} />
                <Route path="/transfer" element={<ProtectedRoute><Send /></ProtectedRoute>} />
                <Route path="/redeem" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
                <Route path="/policy-rules" element={<ProtectedRoute><PolicyRules /></ProtectedRoute>} />
                <Route path="/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
                <Route path="/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
                <Route path="/wallets" element={<ProtectedRoute><Wallets /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/connectivity-probe" element={<ProtectedRoute><ConnectivityProbe /></ProtectedRoute>} />

                {/* Admin-only */}
                <Route path="/users" element={<ProtectedRoute><AdminRoute><Users /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin-settings" element={<ProtectedRoute><AdminRoute><AdminSettings /></AdminRoute></ProtectedRoute>} />

                {/* Legacy redirects */}
                <Route path="/fund" element={<Navigate to="/mint" replace />} />
                <Route path="/send" element={<Navigate to="/transfer" replace />} />
                <Route path="/withdraw" element={<Navigate to="/redeem" replace />} />
                <Route path="/audit-trail" element={<Navigate to="/activity-log" replace />} />
                <Route path="/release-queue" element={<Navigate to="/policy-rules" replace />} />
                <Route path="/audit" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
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