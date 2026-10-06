import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import ProtectedRoute, { AdminRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import GlobalOverlays from "@/components/shared/GlobalOverlays";

// Lazy loaded pages
const Index = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const EmailConfirmationPage = lazy(() => import("./pages/EmailConfirmationPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BusinessPlanEditor = lazy(() => import("./pages/BusinessPlanEditor"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CGUPage = lazy(() => import("./pages/CGUPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const SharedPlanPage = lazy(() => import("./pages/SharedPlanPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const GuidePage = lazy(() => import("./pages/GuidePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <I18nProvider>
          <ErrorBoundary>
            <Suspense fallback={<FullPageSpinner />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/bp/:id" element={
                  <ProtectedRoute><BusinessPlanEditor /></ProtectedRoute>
                } />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={
                  <AdminRoute><AdminDashboard /></AdminRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />
                <Route path="/clients" element={
                  <ProtectedRoute><ClientsPage /></ProtectedRoute>
                } />
                <Route path="/cgu" element={<CGUPage />} />
                <Route path="/confidentialite" element={<PrivacyPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/share/:token" element={<SharedPlanPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <GlobalOverlays />
            </Suspense>
          </ErrorBoundary>
          </I18nProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
