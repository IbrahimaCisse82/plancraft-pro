import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { Ban, CheckCircle2, Trash2, ShieldPlus, ShieldMinus, Mail, RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { AdminToolbar, Pager, inputCls } from "./AdminToolbar";
import { downloadCsv, paginate } from "@/lib/csv";

type AuthUser = { id: string; email: string | null; created_at: string; last_sign_in_at: string | null; banned_until: string | null; factors: number };
type Row = AuthUser & { name: string; role: "admin" | "user"; plans: number; suspended: boolean };
type Pending = { action: "ban" | "unban" | "delete" | "set_role" | "reset_password"; row: Row; role?: "admin" | "user" } | null;

const UsersPanel = () => {
  const { user } = useAuth();
  const { lang } = useI18n();
  const fr = lang === "fr";
  const loc = fr ? "fr-FR" : "en-US";
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | "admin" | "user">("all");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [fnRes, profRes, roleRes, planRes] = await Promise.all([
      supabase.functions.invoke("admin-users", { body: { action: "list" } }),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("business_plans").select("user_id"),
    ]);
    if (fnRes.error) { toast.error(fnRes.error.message); setLoading(false); return; }
    const names = new Map((profRes.data ?? []).map((p) => [p.user_id, p.display_name]));
    const roles = new Map<string, string>();
    (roleRes.data ?? []).forEach((r) => { if (r.role === "admin" || !roles.has(r.user_id)) roles.set(r.user_id, r.role); });
    const counts: Record<string, number> = {};
    (planRes.data ?? []).forEach((p) => { counts[p.user_id] = (counts[p.user_id] ?? 0) + 1; });
    const list = ((fnRes.data?.users ?? []) as AuthUser[]).map((u) => ({
      ...u,
      name: names.get(u.id) || u.email || "—",
      role: (roles.get(u.id) === "admin" ? "admin" : "user") as Row["role"],
      plans: counts[u.id] ?? 0,
      suspended: !!u.banned_until && new Date(u.banned_until) > new Date(),
    }));
    list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    setRows(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      (role === "all" || r.role === role) &&
      (status === "all" || (status === "suspended") === r.suspended) &&
      (!q || r.name.toLowerCase().includes(q) || (r.email ?? "").toLowerCase().includes(q) || r.id.startsWith(q)));
  }, [rows, search, role, status]);
  const { pageItems, pages, page: cur } = paginate(filtered, page);

  const run = async (p: NonNullable<Pending>) => {
    setBusy(p.row.id);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: p.action, user_id: p.row.id, role: p.role, origin: window.location.origin },
    });
    setBusy(null);
    setPending(null);
    if (error || data?.error) { toast.error(data?.error || error?.message); return; }
    toast.success(fr ? "Action effectuée" : "Done");
    load();
  };

  const confirmText = (p: NonNullable<Pending>) => {
    const who = p.row.email ?? p.row.name;
    switch (p.action) {
      case "ban": return fr ? `Suspendre ${who} ? Il ne pourra plus se connecter.` : `Suspend ${who}? They will not be able to sign in.`;
      case "unban": return fr ? `Réactiver ${who} ?` : `Reactivate ${who}?`;
      case "delete": return fr ? `Supprimer définitivement ${who} et toutes ses données ?` : `Permanently delete ${who} and all their data?`;
      case "set_role": return p.role === "admin" ? (fr ? `Donner les droits administrateur à ${who} ?` : `Grant admin rights to ${who}?`) : (fr ? `Retirer les droits administrateur de ${who} ?` : `Remove admin rights from ${who}?`);
      case "reset_password": return fr ? `Envoyer un lien de réinitialisation du mot de passe à ${who} ?` : `Send a password reset link to ${who}?`;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  const btn = "p-1.5 rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30";

  return (
    <div>
      <AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder={fr ? "Nom, email ou ID..." : "Name, email or ID..."}
        onExport={() => downloadCsv("utilisateurs.csv", ["id", "email", "name", "role", "status", "plans", "created_at", "last_sign_in_at", "2fa"],
          filtered.map((r) => [r.id, r.email, r.name, r.role, r.suspended ? "suspended" : "active", r.plans, r.created_at, r.last_sign_in_at, r.factors > 0 ? "yes" : "no"]))}>
        <select aria-label="Role" value={role} onChange={(e) => { setRole(e.target.value as typeof role); setPage(1); }} className={inputCls}>
          <option value="all">{fr ? "Tous rôles" : "All roles"}</option><option value="admin">admin</option><option value="user">user</option>
        </select>
        <select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} className={inputCls}>
          <option value="all">{fr ? "Tous statuts" : "All statuses"}</option>
          <option value="active">{fr ? "Actifs" : "Active"}</option><option value="suspended">{fr ? "Suspendus" : "Suspended"}</option>
        </select>
        <button onClick={load} aria-label={fr ? "Rafraîchir" : "Refresh"} className="p-1.5 rounded-md bg-secondary border border-border"><RefreshCw className="w-3.5 h-3.5" /></button>
      </AdminToolbar>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left px-4 py-3">{fr ? "Utilisateur" : "User"}</th>
              <th className="text-left px-4 py-3">{fr ? "Rôle" : "Role"}</th>
              <th className="text-left px-4 py-3">{fr ? "Statut" : "Status"}</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">{fr ? "Inscription" : "Signed up"}</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">{fr ? "Dernière connexion" : "Last sign-in"}</th>
              <th className="text-center px-4 py-3">Plans</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">{fr ? "Aucun utilisateur" : "No users"}</td></tr>
            ) : pageItems.map((r) => {
              const self = r.id === user?.id;
              const dis = self || busy === r.id;
              return (
                <tr key={r.id} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium">{r.name}{self && <span className="ml-1 text-[0.6rem] text-primary">({fr ? "vous" : "you"})</span>}</div>
                    <div className="text-[0.65rem] text-muted-foreground">{r.email}</div>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${r.role === "admin" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{r.role}</span>{r.factors > 0 && <span className="ml-1 text-[0.6rem] text-success">2FA</span>}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${r.suspended ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>{r.suspended ? (fr ? "suspendu" : "suspended") : (fr ? "actif" : "active")}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{new Date(r.created_at).toLocaleDateString(loc)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{r.last_sign_in_at ? new Date(r.last_sign_in_at).toLocaleString(loc) : "—"}</td>
                  <td className="px-4 py-3 text-center text-xs">{r.plans}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-0.5">
                      <button disabled={dis} title={fr ? "Réinitialiser le mot de passe" : "Reset password"} aria-label={fr ? "Réinitialiser le mot de passe" : "Reset password"} onClick={() => setPending({ action: "reset_password", row: r })} className={`${btn} hover:text-primary`}><Mail className="w-3.5 h-3.5" /></button>
                      {r.role === "admin"
                        ? <button disabled={dis} title={fr ? "Retirer admin" : "Remove admin"} aria-label={fr ? "Retirer admin" : "Remove admin"} onClick={() => setPending({ action: "set_role", row: r, role: "user" })} className={`${btn} hover:text-primary`}><ShieldMinus className="w-3.5 h-3.5" /></button>
                        : <button disabled={dis} title={fr ? "Passer admin" : "Make admin"} aria-label={fr ? "Passer admin" : "Make admin"} onClick={() => setPending({ action: "set_role", row: r, role: "admin" })} className={`${btn} hover:text-primary`}><ShieldPlus className="w-3.5 h-3.5" /></button>}
                      {r.suspended
                        ? <button disabled={dis} title={fr ? "Réactiver" : "Reactivate"} aria-label={fr ? "Réactiver" : "Reactivate"} onClick={() => setPending({ action: "unban", row: r })} className={`${btn} hover:text-success`}><CheckCircle2 className="w-3.5 h-3.5" /></button>
                        : <button disabled={dis} title={fr ? "Suspendre" : "Suspend"} aria-label={fr ? "Suspendre" : "Suspend"} onClick={() => setPending({ action: "ban", row: r })} className={`${btn} hover:text-destructive`}><Ban className="w-3.5 h-3.5" /></button>}
                      <button disabled={dis} title={fr ? "Supprimer" : "Delete"} aria-label={fr ? "Supprimer le compte" : "Delete account"} onClick={() => setPending({ action: "delete", row: r })} className={`${btn} hover:text-destructive`}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pager page={cur} pages={pages} total={filtered.length} onPage={setPage} fr={fr} />

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={fr ? "Confirmer l'action" : "Confirm action"}
        description={pending ? confirmText(pending) : ""}
        confirmLabel={fr ? "Confirmer" : "Confirm"}
        cancelLabel={fr ? "Annuler" : "Cancel"}
        variant={pending?.action === "delete" || pending?.action === "ban" ? "destructive" : "default"}
        onConfirm={() => { if (pending) run(pending); }}
      />
    </div>
  );
};

export default UsersPanel;
