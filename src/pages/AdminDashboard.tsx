import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, FileText, Eye, Trash2 } from "lucide-react";
import TopBar from "@/components/shared/TopBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type UserRow = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type BPRow = {
  id: string;
  name: string;
  secteur: string | null;
  statut: string;
  progress: number;
  user_id: string;
  created_at: string;
};

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [plans, setPlans] = useState<BPRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "plans">("plans");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    const fetch = async () => {
      const [usersRes, plansRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url, created_at").order("created_at", { ascending: false }),
        supabase.from("business_plans").select("id, name, secteur, statut, progress, user_id, created_at").order("created_at", { ascending: false }),
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (plansRes.data) setPlans(plansRes.data);
      setLoading(false);
    };
    fetch();
  }, [isAdmin, navigate]);

  const handleDeletePlan = async (id: string) => {
    const { error } = await supabase.from("business_plans").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      setPlans(plans.filter((p) => p.id !== id));
      toast.success("Supprimé");
    }
    setDeleteId(null);
  };

  const getUserName = (userId: string) => {
    const u = users.find((u) => u.user_id === userId);
    return u?.display_name || userId.slice(0, 8);
  };

  const statusColors: Record<string, string> = {
    brouillon: "bg-secondary text-muted-foreground",
    finalise: "bg-success/10 text-success",
    archive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="min-h-screen">
      <TopBar showAdmin showDashboard />

      <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-10">
        <h1 className="font-display text-4xl font-bold mb-2">Administration</h1>
        <p className="text-sm text-muted-foreground mb-8">Vue globale de tous les utilisateurs et business plans.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { val: users.length, label: "Utilisateurs", icon: <Users className="w-4 h-4" /> },
            { val: plans.length, label: "Business plans", icon: <FileText className="w-4 h-4" /> },
            { val: plans.filter((p) => p.statut === "finalise").length, label: "Finalisés" },
            { val: plans.filter((p) => p.statut === "brouillon").length, label: "En cours" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
              <div className="font-display text-3xl font-bold text-[hsl(var(--gold-light))]">{stat.val}</div>
              <div className="text-[0.68rem] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary p-1 rounded-lg w-fit">
          <button onClick={() => setTab("plans")} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${tab === "plans" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <FileText className="w-3.5 h-3.5 inline mr-1.5" />Business Plans
          </button>
          <button onClick={() => setTab("users")} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${tab === "users" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <Users className="w-3.5 h-3.5 inline mr-1.5" />Utilisateurs
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner /></div>
        ) : tab === "plans" ? (
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Nom</th>
                  <th className="text-left px-4 py-3">Utilisateur</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Secteur</th>
                  <th className="text-center px-4 py-3">Progrès</th>
                  <th className="text-center px-4 py-3">Statut</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((bp) => (
                  <tr key={bp.id} className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{bp.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{getUserName(bp.user_id)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{bp.secteur || "—"}</td>
                    <td className="px-4 py-3 text-center text-xs">{bp.progress}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${statusColors[bp.statut] || ""}`}>
                        {bp.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => navigate(`/bp/${bp.id}`)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors" aria-label="Voir le business plan">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(bp.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Supprimer le business plan">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Nom</th>
                  <th className="text-left px-4 py-3">Date d'inscription</th>
                  <th className="text-center px-4 py-3">Business Plans</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.6rem] font-bold shrink-0">
                        {(u.display_name || "?").charAt(0).toUpperCase()}
                      </div>
                      {u.display_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      {plans.filter((p) => p.user_id === u.user_id).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Supprimer ce business plan ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={() => { if (deleteId) handleDeletePlan(deleteId); }}
      />
    </div>
  );
};

export default AdminDashboard;
