import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SystemProvider } from "@/contexts/SystemContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Approvals from "./pages/Approvals";
import Activity from "./pages/Activity";
import Safety from "./pages/Safety";
import Incidents from "./pages/Incidents";
import Customers from "./pages/Customers";
import Subscriptions from "./pages/Subscriptions";
import ConnectedApps from "./pages/ConnectedApps";
import Advanced from "./pages/Advanced";
import LLMOpsDesk from "./pages/LLMOpsDesk";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <SystemProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Approvals />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Activity />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/safety"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Safety />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/incidents"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Incidents />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Customers />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Subscriptions />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/connected-apps"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ConnectedApps />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advanced"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Advanced />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/llm-ops-desk"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <LLMOpsDesk />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SystemProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
