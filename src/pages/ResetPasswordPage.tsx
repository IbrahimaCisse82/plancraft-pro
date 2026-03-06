import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { updatePassword, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mot de passe mis à jour avec succès !");
      navigate("/dashboard", { replace: true });
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold mb-2 text-center">Nouveau mot de passe</h1>
        <p className="text-xs text-muted-foreground text-center mb-8">
          Choisissez un nouveau mot de passe sécurisé.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary-foreground mb-1.5">
              Nouveau mot de passe *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary-foreground mb-1.5">
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting ? "Mise à jour…" : "Mettre à jour le mot de passe →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
