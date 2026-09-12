import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";

const AdminSecurityPanel = () => {
  const { user } = useAuth();
  const { lang } = useI18n();
  const fr = lang === "fr";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(fr ? "Le nouveau mot de passe doit contenir au moins 8 caractères." : "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(fr ? "Les mots de passe ne correspondent pas." : "Passwords do not match.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      // Cloud may require the current password for signed-in changes
      current_password: currentPassword,
    } as Parameters<typeof supabase.auth.updateUser>[0]);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success(fr ? "Mot de passe administrateur mis à jour." : "Admin password updated.");
  };

  return (
    <div className="max-w-md bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="w-4 h-4 text-primary" />
        <h2 className="font-heading text-lg text-foreground">
          {fr ? "Mot de passe administrateur" : "Admin password"}
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        {user?.email}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cur-pwd" className="block text-xs font-bold mb-1.5 text-foreground">
            {fr ? "Mot de passe actuel" : "Current password"}
          </label>
          <input
            id="cur-pwd" type="password" autoComplete="current-password" required
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="new-pwd" className="block text-xs font-bold mb-1.5 text-foreground">
            {fr ? "Nouveau mot de passe" : "New password"}
          </label>
          <input
            id="new-pwd" type="password" autoComplete="new-password" required
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="cfm-pwd" className="block text-xs font-bold mb-1.5 text-foreground">
            {fr ? "Confirmer le nouveau mot de passe" : "Confirm new password"}
          </label>
          <input
            id="cfm-pwd" type="password" autoComplete="new-password" required
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-bold disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {fr ? "Mettre à jour" : "Update"}
        </button>
      </form>
    </div>
  );
};

export default AdminSecurityPanel;
