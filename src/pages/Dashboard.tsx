import { Link } from "react-router-dom";
import { useState } from "react";

const mockPlans = [
  { id: "1", name: "Boulangerie Moderne Dakar", secteur: "Agroalimentaire", statut: "brouillon" as const, progress: 45, updated_at: "2025-02-28" },
  { id: "2", name: "Startup Tech Abidjan", secteur: "Technologies", statut: "finalise" as const, progress: 100, updated_at: "2025-02-25" },
  { id: "3", name: "Ferme Avicole Thiès", secteur: "Agriculture", statut: "brouillon" as const, progress: 20, updated_at: "2025-02-20" },
];

const statusConfig = {
  brouillon: { label: "Brouillon", className: "bg-surface-2 text-muted-foreground" },
  finalise: { label: "Finalisé", className: "bg-success/10 text-success" },
  archive: { label: "Archivé", className: "bg-destructive/10 text-destructive" },
};

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const plans = mockPlans;

  const stats = {
    total: plans.length,
    finalise: plans.filter((p) => p.statut === "finalise").length,
    draft: plans.filter((p) => p.statut === "brouillon").length,
    avgProgress: plans.length ? Math.round(plans.reduce((s, p) => s + p.progress, 0) / plans.length) : 0,
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_10%,_hsl(43_55%_54%_/_0.06),_transparent)] pointer-events-none" />

      {/* Top bar */}
      <div className="sticky top-0 z-50 h-[58px] bg-card border-b border-border flex items-center px-5 md:px-8 gap-4">
        <Link to="/" className="font-display text-xl font-bold text-gold-light">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-border rounded-full text-xs text-secondary-foreground">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.7rem] font-bold">M</div>
            <span>Moussa Diop</span>
          </div>
          <Link to="/" className="px-4 py-1.5 bg-surface-2 border border-border-strong rounded-md text-xs font-semibold text-secondary-foreground hover:border-gold hover:text-gold transition-all">
            🏠 Accueil
          </Link>
          <button className="px-4 py-1.5 bg-surface-2 border border-destructive/30 rounded-md text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all">
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
            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wide bg-surface-2 border border-border text-muted-foreground">
              Plan Gratuit
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:bg-gold-light hover:-translate-y-0.5 transition-all"
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
              <div className="font-display text-3xl font-bold text-gold-light">{stat.val}</div>
              <div className="text-[0.68rem] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* BP Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((bp) => {
            const status = statusConfig[bp.statut];
            return (
              <div
                key={bp.id}
                className="group relative bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:border-gold/30 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gold-dim border border-gold/20 flex items-center justify-center text-lg">📋</div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors text-lg px-2">⋯</button>
                </div>

                <div className="font-bold text-sm mb-1 truncate">{bp.name}</div>
                <div className="text-xs text-muted-foreground mb-3.5">{bp.secteur}</div>

                <div className="mb-3">
                  <div className="flex justify-between text-[0.65rem] text-muted-foreground mb-1.5">
                    <span>Progression</span>
                    <span>{bp.progress}%</span>
                  </div>
                  <div className="h-[3px] bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
                      style={{ width: `${bp.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3.5 border-t border-border">
                  <div className="text-[0.65rem] text-muted-foreground font-mono">
                    Modifié le {new Date(bp.updated_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wide ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* New BP card */}
          <div
            onClick={() => setShowModal(true)}
            className="border border-dashed border-gold/30 rounded-2xl flex flex-col items-center justify-center gap-2.5 min-h-[180px] text-muted-foreground cursor-pointer transition-all hover:border-gold hover:text-gold hover:bg-gold-dim"
          >
            <div className="text-3xl">+</div>
            <div className="text-xs font-semibold">Nouveau business plan</div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/75 z-[200] flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-card border border-border-strong rounded-2xl w-[480px] max-w-[95vw] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            <h3 className="font-display text-2xl font-bold mb-1.5">Nouveau Business Plan</h3>
            <p className="text-xs text-secondary-foreground mb-6">Donnez un nom à votre projet pour commencer.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">Nom du projet *</label>
                <input
                  type="text"
                  placeholder="Ex : Boulangerie Moderne Dakar"
                  className="w-full px-3.5 py-2.5 bg-surface-2 border border-border-strong rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">Secteur d'activité</label>
                <input
                  type="text"
                  placeholder="Ex : Agroalimentaire, Services, Commerce…"
                  className="w-full px-3.5 py-2.5 bg-surface-2 border border-border-strong rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">Devise</label>
                <select className="w-full px-3.5 py-2.5 bg-surface-2 border border-border-strong rounded-lg text-sm text-foreground outline-none focus:border-gold transition-colors">
                  <option>FCFA (XOF)</option>
                  <option>MAD (Dirham marocain)</option>
                  <option>EUR (Euro)</option>
                  <option>USD (Dollar US)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-3 bg-surface-2 border border-border-strong rounded-lg text-sm font-semibold text-secondary-foreground hover:border-destructive hover:text-destructive transition-all">
                Annuler
              </button>
              <button className="flex-1 py-3 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:bg-gold-light transition-all">
                Créer le projet →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
