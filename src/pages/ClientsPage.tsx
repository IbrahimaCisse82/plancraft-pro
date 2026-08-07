import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, Briefcase, Mail, Phone, Building2, FileText } from "lucide-react";
import { useClients, type Client } from "@/hooks/useClients";
import { useBusinessPlans } from "@/hooks/useBusinessPlans";
import { useI18n } from "@/contexts/I18nContext";
import { usePlan } from "@/hooks/usePlan";
import TopBar from "@/components/shared/TopBar";
import PlanGate from "@/components/shared/PlanGate";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

const empty: Partial<Client> = { name: "", company: "", email: "", phone: "", notes: "" };

const ClientsPage = () => {
  const { lang } = useI18n();
  const { limits } = usePlan();
  const navigate = useNavigate();
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const { plans } = useBusinessPlans();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>(empty);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const T = (fr: string, en: string) => (lang === "fr" ? fr : en);

  const openNew = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm(c); setShowModal(true); };

  const submit = async () => {
    if (!form.name?.trim()) { toast.error(T("Le nom est requis", "Name is required")); return; }
    if (editing) await updateClient(editing.id, form);
    else await createClient(form);
    setShowModal(false);
    toast.success(editing ? T("Client mis à jour", "Client updated") : T("Client créé", "Client created"));
  };

  const planCountFor = (id: string) => plans.filter(p => p.client_id === id).length;

  const statsFor = (id: string) => {
    const list = plans.filter(p => p.client_id === id);
    if (list.length === 0) return { avg: 0, last: null as string | null };
    const avg = Math.round(list.reduce((s, p) => s + (p.progress || 0), 0) / list.length);
    const last = list
      .map(p => p.updated_at)
      .filter(Boolean)
      .sort()
      .reverse()[0] as string | undefined;
    return { avg, last: last ?? null };
  };

  return (
    <div className="min-h-screen">
      <TopBar showDashboard showHome />
      <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-primary" /> {T("Mes clients", "My clients")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {T("Gérez votre portefeuille de clients (mode coach).", "Manage your client portfolio (coach mode).")}
            </p>
          </div>
          {limits.coachClients && (
            <button onClick={openNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" /> {T("Nouveau client", "New client")}
            </button>
          )}
        </div>

        {!limits.coachClients ? (
          <PlanGate feature="coachClients" required="pro">
            <div />
          </PlanGate>
        ) : loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner /></div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {T("Aucun client pour le moment.", "No clients yet.")}
            </p>
            <button onClick={openNew}
              className="px-5 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90">
              {T("Ajouter un premier client", "Add your first client")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(c => {
              const count = planCountFor(c.id);
              return (
                <div key={c.id} className="bg-card border border-border rounded-2xl p-5 group hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="font-bold text-sm mb-0.5 truncate">{c.name}</div>
                  {c.company && <div className="text-xs text-muted-foreground flex items-center gap-1 truncate"><Building2 className="w-3 h-3" />{c.company}</div>}
                  <div className="space-y-1 mt-3 text-[0.7rem] text-muted-foreground">
                    {c.email && <div className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3" />{c.email}</div>}
                    {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{c.phone}</div>}
                  </div>
                  {c.notes && <p className="text-[0.7rem] text-muted-foreground mt-3 line-clamp-2 italic">{c.notes}</p>}
                  {count > 0 && (() => {
                    const s = statsFor(c.id);
                    return (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground">
                          <span>{T("Progression moyenne", "Avg. progress")}</span>
                          <span className="font-bold text-foreground">{s.avg}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${s.avg}%` }} />
                        </div>
                        {s.last && (
                          <div className="text-[0.65rem] text-muted-foreground">
                            {T("Dernière activité", "Last activity")} : {new Date(s.last).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[0.7rem]">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="w-3 h-3" /> {count} {T("plan(s)", "plan(s)")}
                    </span>
                    <button onClick={() => navigate(`/dashboard?client=${c.id}`)} className="text-primary font-bold hover:underline">
                      {T("Voir", "View")} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/75 z-[200] flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl w-[480px] max-w-[95vw] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            <h3 className="font-display text-2xl font-bold mb-1.5">
              {editing ? T("Modifier client", "Edit client") : T("Nouveau client", "New client")}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              {T("Informations de votre client coaché.", "Information about your coached client.")}
            </p>
            <div className="space-y-3">
              {[
                { k: "name", label: T("Nom *", "Name *"), placeholder: "Ex : Awa Diop" },
                { k: "company", label: T("Société", "Company"), placeholder: "Ex : Diop SARL" },
                { k: "email", label: "Email", placeholder: "client@email.com" },
                { k: "phone", label: T("Téléphone", "Phone"), placeholder: "+221 …" },
              ].map(f => (
                <div key={f.k}>
                  <label className="block text-xs font-bold text-secondary-foreground mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    value={(form as Record<string, string>)[f.k] || ""}
                    onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-secondary-foreground mb-1.5">Notes</label>
                <textarea
                  value={form.notes || ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setShowModal(false)}
                className="px-5 py-3 bg-secondary border border-border rounded-lg text-sm font-semibold hover:border-destructive hover:text-destructive transition-all">
                {T("Annuler", "Cancel")}
              </button>
              <button onClick={submit}
                className="flex-1 py-3 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 transition-all">
                {editing ? T("Enregistrer", "Save") : T("Créer", "Create")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title={T("Supprimer ce client ?", "Delete this client?")}
        description={T("Les business plans liés ne seront pas supprimés mais seront détachés.", "Linked business plans will be detached but kept.")}
        confirmLabel={T("Supprimer", "Delete")}
        variant="destructive"
        onConfirm={async () => { if (confirmDelete) { await deleteClient(confirmDelete); setConfirmDelete(null); } }}
      />
    </div>
  );
};

export default ClientsPage;
