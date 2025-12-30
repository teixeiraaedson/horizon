import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fund" element={<Fund />} />
              <Route path="/send" element={<Send />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/release-queue" element={<ReleaseQueue />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/webhooks" element={<Webhooks />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;