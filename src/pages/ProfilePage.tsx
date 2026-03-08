import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TopBar from "@/components/shared/TopBar";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { profileSchema } from "@/lib/validation";

const ProfilePage = () => {
  const { user, profile, refreshProfile, loading } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sync display name when profile loads after mount
  useEffect(() => {
    if (profile?.display_name && !displayName) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  if (loading) return <FullPageSpinner />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const result = profileSchema.safeParse({ displayName });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    
    if (!user) return;
    setSaving(true);
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ display_name: result.data.displayName })
      .eq("user_id", user.id);
    setSaving(false);
    if (dbError) {
      toast.error("Erreur : " + dbError.message);
    } else {
      toast.success("Profil mis à jour !");
      await refreshProfile();
    }
  };

  const initial = (displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen">
      <TopBar showHome showDashboard />

      <div className="max-w-lg mx-auto px-5 py-12">
        <h1 className="font-display text-3xl font-bold mb-8">Mon Profil</h1>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
            {initial}
          </div>
          <div>
            <div className="font-bold">{profile?.display_name || "—"}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary-foreground mb-1.5">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setError(""); }}
              placeholder="Votre nom"
              maxLength={100}
              className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-3.5 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[0.65rem] text-muted-foreground mt-1">L'email ne peut pas être modifié.</p>
          </div>

          <button
            type="submit"
            disabled={saving || !displayName.trim()}
            className="px-6 py-2.5 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
