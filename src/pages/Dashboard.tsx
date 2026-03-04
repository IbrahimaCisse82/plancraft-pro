import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type BPRow = {
  id: string;
  name: string;
  secteur: string | null;
  statut: "brouillon" | "finalise" | "archive";
  progress: number;
  updated_at: string;
};

const statusConfig = {
  brouillon: { label: "Brouillon", className: "bg-secondary text-muted-foreground" },
  finalise: { label: "Finalisé", className: "bg-success/10 text-success" },
  archive: { label: "Archivé", className: "bg-destructive/10 text-destructive" },
};

const Dashboard = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState<BPRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSecteur, setNewSecteur] = useState("");
  const [newDevise, setNewDevise] = useState("FCFA (XOF)");

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("business_plans")
      .select("id, name, secteur, statut, progress, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Erreur lors du chargement des business plans");
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    setCreating(true);
    const { error } = await supabase.from("business_plans").insert({
      user_id: user.id,
      name: newName.trim(),
      secteur: newSecteur.trim() || null,
      devise: newDevise,
    });
    setCreating(false);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Business plan créé !");
      setShowModal(false);
      setNewName("");
      setNewSecteur("");
      setNewDevise("FCFA (XOF)");
      fetchPlans();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.display_name || user?.email || "Utilisateur";
  const initial = displayName.charAt(0).toUpperCase();

  const stats = {
    total: plans.length,
    finalise: plans.filter((p) => p.statut === "finalise").length,
    draft: plans.filter((p) => p.statut === "brouillon").length,
    avgProgress: plans.length ? Math.round(plans.reduce((s, p) => s + p.progress, 0) / plans.length) : 0,
  };

  return (
    <div className="min-h-screen relative z-10">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_10%,_hsl(43_55%_54%_/_0.06),_transparent)] pointer-events-none" />

      {/* Top bar */}
      <div className="sticky top-0 z-50 h-[58px] bg-card border-b border-border flex items-center px-5 md:px-8 gap-4">
        <Link to="/" className="font-display text-xl font-bold text-[hsl(var(--gold-light))]">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </Link>
        {isAdmin && (
          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[0.6rem] font-bold uppercase tracking-wider">Admin</span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-full text-xs text-secondary-foreground">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.7rem] font-bold">{initial}</div>
            <span className="hidden sm:inline">{displayName}</span>
          </div>
          <Link to="/" className="px-4 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all">
            🏠 Accueil
          </Link>
          <button onClick={handleLogout} className="px-4 py-1.5 bg-secondary border border-destructive/30 rounded-md text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-9">
          <div>
            <h1 className="font-display text-4xl font-bold">Mes Business Plans</h1>
            <p className="text-sm text-secondary-foreground mt-1">Créez, gérez et exportez vos dossiers depuis un seul endroit.</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wide bg-secondary border border-border text-muted-foreground">
              Plan Gratuit
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            + Nouveau Business Plan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { val: stats.total, label: "Business plans" },
            { val: stats.finalise, label: "Finalisés" },
            { val: stats.draft, label: "En cours" },
            { val: `${stats.avgProgress}%`, label: "Progression moy." },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
              <div className="font-display text-3xl font-bold text-[hsl(var(--gold-light))]">{stat.val}</div>
              <div className="text-[0.68rem] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          /* BP Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((bp) => {
              const status = statusConfig[bp.statut];
              return (
                <div
                  key={bp.id}
                  onClick={() => navigate(`/bp/${bp.id}`)}
                  className="group relative bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--gold-dim))] border border-primary/20 flex items-center justify-center text-lg">📋</div>
                  </div>
                  <div className="font-bold text-sm mb-1 truncate">{bp.name}</div>
                  <div className="text-xs text-muted-foreground mb-3.5">{bp.secteur || "—"}</div>
                  <div className="mb-3">
                    <div className="flex justify-between text-[0.65rem] text-muted-foreground mb-1.5">
                      <span>Progression</span>
                      <span>{bp.progress}%</span>
                    </div>
                    <div className="h-[3px] bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-[hsl(var(--gold-light))] rounded-full transition-all duration-500"
                        style={{ width: `${bp.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3.5 border-t border-border">
                    <div className="text-[0.65rem] text-muted-foreground font-mono">
                      {new Date(bp.updated_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wide ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}

            <div
              onClick={() => setShowModal(true)}
              className="border border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-2.5 min-h-[180px] text-muted-foreground cursor-pointer transition-all hover:border-primary hover:text-primary hover:bg-[hsl(var(--gold-dim))]"
            >
              <div className="text-3xl">+</div>
              <div className="text-xs font-semibold">Nouveau business plan</div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/75 z-[200] flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl w-[480px] max-w-[95vw] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            <h3 className="font-display text-2xl font-bold mb-1.5">Nouveau Business Plan</h3>
            <p className="text-xs text-secondary-foreground mb-6">Donnez un nom à votre projet pour commencer.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">Nom du projet *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex : Boulangerie Moderne Dakar"
                  className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">Secteur d'activité</label>
                <select
                  value={newSecteur}
                  onChange={(e) => setNewSecteur(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary transition-colors"
                >
                  <option value="">— Sélectionner un secteur —</option>
                  <option>Agroalimentaire</option>
                  <option>Commerce</option>
                  <option>Services</option>
                  <option>Technologie / IT</option>
                  <option>BTP / Construction</option>
                  <option>Éducation / Formation</option>
                  <option>Santé</option>
                  <option>Transport / Logistique</option>
                  <option>Tourisme / Hôtellerie</option>
                  <option>Agriculture</option>
                  <option>Industrie / Manufacture</option>
                  <option>Énergie</option>
                  <option>Immobilier</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">Devise</label>
                <select
                  value={newDevise}
                  onChange={(e) => setNewDevise(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary transition-colors"
                >
                  <option>FCFA (XOF)</option>
                  <option>MAD (Dirham marocain)</option>
                  <option>EUR (Euro)</option>
                  <option>USD (Dollar US)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-3 bg-secondary border border-border rounded-lg text-sm font-semibold text-secondary-foreground hover:border-destructive hover:text-destructive transition-all">
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="flex-1 py-3 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
              >
                {creating ? "Création…" : "Créer le projet →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
