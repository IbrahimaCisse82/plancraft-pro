import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  const [aalOk, setAalOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setAalOk(null); return; }
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      setAalOk(!(data?.nextLevel === "aal2" && data?.currentLevel !== "aal2"));
    });
  }, [user]);

  if (loading || (user && aalOk === null)) return <FullPageSpinner />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  if (!aalOk) return <Navigate to="/admin/login?mfa=1" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
