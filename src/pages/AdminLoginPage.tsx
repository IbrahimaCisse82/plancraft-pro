import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminLoginPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const fr = lang === "fr";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate("/admin", { replace: true });
  }, [loading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError || !data.user) {
      setError(fr ? "Identifiants invalides." : "Invalid credentials.");
      setSubmitting(false);
      return;
    }
    const { data: adminOk } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    if (!adminOk) {
      await supabase.auth.signOut();
      setError(fr ? "Ce compte n'a pas les droits d'administration." : "This account has no admin rights.");
      setSubmitting(false);
      return;
    }
    toast.success(fr ? "Connexion administrateur réussie" : "Admin sign-in successful");
    navigate("/admin", { replace: true });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-lg">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-heading text-2xl text-foreground">
            {fr ? "Connexion administrateur" : "Admin sign-in"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {fr ? "Accès réservé au back-office PlanCraft Pro." : "Restricted access to the PlanCraft Pro back-office."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold mb-1.5 text-foreground">
              {fr ? "E-mail" : "Email"}
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="admin@plancraftpro.com"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold mb-1.5 text-foreground">
              {fr ? "Mot de passe" : "Password"}
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-destructive font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-bold disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {fr ? "Se connecter" : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => navigate("/auth")}
          className="mt-5 w-full text-center text-xs text-muted-foreground underline hover:text-foreground"
        >
          {fr ? "Connexion utilisateur standard" : "Standard user sign-in"}
        </button>
      </div>
    </main>
  );
};

export default AdminLoginPage;
