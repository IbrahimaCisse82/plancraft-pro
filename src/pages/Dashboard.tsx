import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessPlans } from "@/hooks/useBusinessPlans";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useI18n } from "@/contexts/I18nContext";
import { Trash2, Archive, MoreVertical, ArchiveRestore, Search, Copy, Briefcase } from "lucide-react";
import { createI18nSchemas } from "@/lib/validation";
import TopBar from "@/components/shared/TopBar";
import FreeAccessReminder from "@/components/shared/FreeAccessReminder";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import { usePlan } from "@/hooks/usePlan";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { SECTOR_TEMPLATES, getTemplate } from "@/lib/sectorTemplates";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useI18n();
  const { plans, loading, stats, createPlan, archivePlan, deletePlan, duplicatePlan } = useBusinessPlans();
  const { plan: userPlan, limits, usage, refresh: refreshPlan } = usePlan();
  const { clients } = useClients();

  const statusConfig = {
    brouillon: { label: lang === "fr" ? "Brouillon" : "Draft", className: "bg-secondary text-muted-foreground" },
    finalise: { label: lang === "fr" ? "Finalisé" : "Finalized", className: "bg-success/10 text-success" },
    archive: { label: lang === "fr" ? "Archivé" : "Archived", className: "bg-destructive/10 text-destructive" },
  };

  type FilterStatus = "all" | "brouillon" | "finalise" | "archive";

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSecteur, setNewSecteur] = useState("");
  const [newDevise, setNewDevise] = useState("FCFA (XOF)");
  const [newClientId, setNewClientId] = useState<string>("");
  const [newTemplateId, setNewTemplateId] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [filterSecteur, setFilterSecteur] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "name" | "progress">("recent");
  const filterClient = searchParams.get("client") || "";
  const setFilterClient = (id: string) => {
    if (id) searchParams.set("client", id); else searchParams.delete("client");
    setSearchParams(searchParams, { replace: true });
  };

  const menuRef = useClickOutside<HTMLDivElement>(() => setOpenMenuId(null));

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const schemas = createI18nSchemas(t);

  const handleCreate = async () => {
    const result = schemas.createPlan.safeParse({ name: newName, secteur: newSecteur || undefined, devise: newDevise });
    if (!result.success) {
      setFormErrors(Object.fromEntries(result.error.errors.map(e => [e.path[0], e.message])));
      return;
    }
    setFormErrors({});
    setCreating(true);
    const tpl = newTemplateId ? getTemplate(newTemplateId) : null;
    const initialContent = tpl ? tpl.build() : null;
    const ok = await createPlan(
      result.data.name,
      result.data.secteur || (tpl?.secteur ?? ""),
      result.data.devise,
      newClientId || null,
      initialContent,
    );
    setCreating(false);
    if (ok) {
      setShowModal(false);
      setNewName("");
      setNewSecteur("");
      setNewDevise("FCFA (XOF)");
      setNewClientId("");
      setNewTemplateId("");
    }
  };

  const handlePickTemplate = (id: string) => {
    setNewTemplateId(id);
    if (id) {
      const tpl = getTemplate(id);
      if (tpl && !newSecteur) setNewSecteur(tpl.secteur);
    }
  };

  const clientName = useCallback((id: string | null) => clients.find(c => c.id === id)?.name, [clients]);

  const sectorOptions = Array.from(new Set(plans.map(p => p.secteur).filter(Boolean) as string[])).sort();

  const filteredPlans = plans
    .filter((bp) => {
      if (filterStatus !== "all" && bp.statut !== filterStatus) return false;
      if (filterClient && bp.client_id !== filterClient) return false;
      if (filterSecteur && bp.secteur !== filterSecteur) return false;
      if (search && !bp.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest": return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case "name": return a.name.localeCompare(b.name);
        case "progress": return b.progress - a.progress;
        case "recent":
        default: return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="min-h-screen relative z-10">
      <OnboardingTour />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_10%,_hsl(43_55%_54%_/_0.06),_transparent)] pointer-events-none" />

      <TopBar showHome />

      <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-10">
        <FreeAccessReminder />
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-9">
          <div>
            <h1 className="font-display text-4xl font-bold">{t("dashboard.title")}</h1>
            <p className="text-sm text-secondary-foreground mt-1">{t("dashboard.subtitle")}</p>
          </div>
          <button
            onClick={() => {
              const activeCount = plans.filter(p => p.statut !== "archive").length;
              if (limits.maxPlans !== -1 && activeCount >= limits.maxPlans) {
                toast.error(
                  lang === "fr"
                    ? `Limite atteinte : plan ${userPlan.toUpperCase()} = ${limits.maxPlans} business plans max. Passez au plan supérieur.`
                    : `Limit reached: ${userPlan.toUpperCase()} plan = ${limits.maxPlans} business plans max. Upgrade your plan.`
                );
                navigate("/#tarifs");
                return;
              }
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            {t("dashboard.newPlan")}
          </button>
        </div>

        {/* Plan badge + AI usage */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold uppercase tracking-wider">
            {lang === "fr" ? "Plan" : "Plan"} {userPlan}
          </span>
          <span className="text-muted-foreground">
            {lang === "fr" ? "IA ce mois" : "AI this month"} :{" "}
            <span className="font-semibold text-foreground">
              {usage.used} / {usage.limit === 100000 ? "∞" : usage.limit}
            </span>
          </span>
          {limits.maxPlans !== -1 && (
            <span className="text-muted-foreground">
              {lang === "fr" ? "Plans" : "Plans"} :{" "}
              <span className="font-semibold text-foreground">
                {plans.filter(p => p.statut !== "archive").length} / {limits.maxPlans}
              </span>
            </span>
          )}
          {userPlan === "free" && (
            <Link to="/#tarifs" className="text-primary font-bold hover:underline ml-auto">
              ✨ {lang === "fr" ? "Passer au plan Pro" : "Upgrade to Pro"}
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { val: stats.total, label: t("dashboard.plans") },
            { val: stats.finalise, label: t("dashboard.finalized") },
            { val: stats.draft, label: t("dashboard.inProgress") },
            { val: `${stats.avgProgress}%`, label: t("dashboard.avgProgress") },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
              <div className="font-display text-3xl font-bold text-[hsl(var(--gold-light))]">{stat.val}</div>
              <div className="text-[0.68rem] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("dashboard.search")}
              className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-secondary p-1 rounded-lg">
            {([
              { key: "all" as FilterStatus, label: t("dashboard.all") },
              { key: "brouillon" as FilterStatus, label: t("dashboard.drafts") },
              { key: "finalise" as FilterStatus, label: t("dashboard.finalized") },
              { key: "archive" as FilterStatus, label: t("dashboard.archived") },
            ]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filterStatus === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {limits.coachClients && clients.length > 0 && (
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-3 py-2 bg-secondary border border-border rounded-lg text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="">{lang === "fr" ? "Tous les clients" : "All clients"}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {sectorOptions.length > 0 && (
            <select
              value={filterSecteur}
              onChange={(e) => setFilterSecteur(e.target.value)}
              className="px-3 py-2 bg-secondary border border-border rounded-lg text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="">{t("dashboard.allSectors")}</option>
              {sectorOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 bg-secondary border border-border rounded-lg text-xs text-foreground outline-none focus:border-primary"
            aria-label={t("dashboard.sortBy")}
          >
            <option value="recent">{t("dashboard.sortRecent")}</option>
            <option value="oldest">{t("dashboard.sortOldest")}</option>
            <option value="name">{t("dashboard.sortName")}</option>
            <option value="progress">{t("dashboard.sortProgress")}</option>
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredPlans.length === 0 && plans.length > 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">{t("dashboard.noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((bp) => {
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
                    <div className="relative" ref={openMenuId === bp.id ? menuRef : undefined}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === bp.id ? null : bp.id); }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="Menu"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === bp.id && (
                        <div className="absolute right-0 top-8 z-50 bg-card border border-border rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.4)] py-1 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { duplicatePlan(bp.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors text-foreground"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {t("dashboard.duplicate")}
                          </button>
                          <button
                            onClick={() => { archivePlan(bp.id, bp.statut); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors text-foreground"
                          >
                            {bp.statut === "archive" ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                            {bp.statut === "archive" ? t("dashboard.restore") : t("dashboard.archive")}
                          </button>
                          <button
                            onClick={() => { setConfirmDeleteId(bp.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-destructive/10 transition-colors text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t("dashboard.delete")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-bold text-sm mb-1 truncate">{bp.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{bp.secteur || "—"}</div>
                  {bp.client_id && clientName(bp.client_id) && (
                    <div className="inline-flex items-center gap-1 mb-3 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[0.6rem] font-bold">
                      <Briefcase className="w-2.5 h-2.5" />{clientName(bp.client_id)}
                    </div>
                  )}
                  <div className="mb-3">
                    <div className="flex justify-between text-[0.65rem] text-muted-foreground mb-1.5">
                      <span>{t("dashboard.progression")}</span>
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
                      {new Date(bp.updated_at).toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric" })}
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
              <div className="text-xs font-semibold">{t("dashboard.newPlanCard")}</div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/75 z-[200] flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl w-[560px] max-w-[95vw] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-2xl font-bold mb-1.5">{t("dashboard.newBpTitle")}</h3>
            <p className="text-xs text-secondary-foreground mb-6">{t("dashboard.newBpSubtitle")}</p>

            {/* Templates */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-secondary-foreground mb-2">
                {lang === "fr" ? "Partir d'un modèle (optionnel)" : "Start from a template (optional)"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePickTemplate("")}
                  className={`p-3 rounded-lg border text-left transition-all ${newTemplateId === "" ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/40"}`}
                >
                  <div className="text-lg mb-0.5">✨</div>
                  <div className="text-[0.7rem] font-bold">{lang === "fr" ? "Vierge" : "Blank"}</div>
                  <div className="text-[0.6rem] text-muted-foreground">{lang === "fr" ? "Sans modèle" : "No template"}</div>
                </button>
                {SECTOR_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handlePickTemplate(tpl.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${newTemplateId === tpl.id ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/40"}`}
                  >
                    <div className="text-lg mb-0.5">{tpl.emoji}</div>
                    <div className="text-[0.7rem] font-bold leading-tight">{lang === "fr" ? tpl.labelFr : tpl.labelEn}</div>
                    <div className="text-[0.6rem] text-muted-foreground leading-tight mt-0.5">{lang === "fr" ? tpl.descriptionFr : tpl.descriptionEn}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">

              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">{t("dashboard.projectName")}</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex : Boulangerie Moderne Dakar"
                  maxLength={150}
                  className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
                {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">{t("dashboard.sector")}</label>
                <select
                  value={newSecteur}
                  onChange={(e) => setNewSecteur(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary transition-colors"
                >
                  <option value="">— {t("dashboard.selectSector")} —</option>
                  {[
                    "sector.agri", "sector.commerce", "sector.services", "sector.tech",
                    "sector.btp", "sector.education", "sector.health", "sector.transport",
                    "sector.tourism", "sector.agriculture", "sector.industry", "sector.energy",
                    "sector.realestate",
                  ].map((key) => (
                    <option key={key} value={t(key)}>{t(key)}</option>
                  ))}
                  <option>{t("dashboard.other")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">{t("dashboard.currency")}</label>
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
              {limits.coachClients && clients.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-secondary-foreground mb-1.5">
                    {lang === "fr" ? "Client (optionnel)" : "Client (optional)"}
                  </label>
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary transition-colors"
                  >
                    <option value="">— {lang === "fr" ? "Aucun" : "None"} —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-3 bg-secondary border border-border rounded-lg text-sm font-semibold text-secondary-foreground hover:border-destructive hover:text-destructive transition-all">
                {t("dashboard.cancel")}
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="flex-1 py-3 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
              >
                {creating ? t("dashboard.creating") : t("dashboard.create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title={t("common.confirmDelete")}
        description={t("common.irreversible")}
        confirmLabel={t("common.deleteConfirm")}
        variant="destructive"
        onConfirm={() => { if (confirmDeleteId) deletePlan(confirmDeleteId); setConfirmDeleteId(null); }}
      />
    </div>
  );
};

export default Dashboard;
