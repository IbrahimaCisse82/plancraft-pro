import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, FileText, Eye, Trash2, TrendingUp, BarChart3, Share2, AlertTriangle, CreditCard, KeyRound, Coins, ScrollText, Megaphone, LifeBuoy, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import TopBar from "@/components/shared/TopBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import SubscriptionsPanel from "@/components/admin/SubscriptionsPanel";
import AdminSecurityPanel from "@/components/admin/AdminSecurityPanel";
import UsersPanel from "@/components/admin/UsersPanel";
import RevenuePanel from "@/components/admin/RevenuePanel";
import AdminAuditPanel from "@/components/admin/AdminAuditPanel";
import AnnouncementsPanel from "@/components/admin/AnnouncementsPanel";
import SupportPanel from "@/components/admin/SupportPanel";
import SettingsPanel from "@/components/admin/SettingsPanel";
import MfaSection from "@/components/admin/MfaSection";
import { AdminToolbar, Pager, inputCls } from "@/components/admin/AdminToolbar";
import { downloadCsv, paginate } from "@/lib/csv";

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

type ErrorLogRow = {
  id: string;
  level: string;
  source: string;
  message: string;
  stack: string | null;
  route: string | null;
  user_id: string | null;
  user_agent: string | null;
  created_at: string;
};

const PIE_COLORS = ["hsl(43, 55%, 54%)", "hsl(155, 62%, 53%)", "hsl(2, 82%, 60%)"];

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [plans, setPlans] = useState<BPRow[]>([]);
  const [shareViews, setShareViews] = useState<{ plan_id: string; created_at: string }[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"analytics" | "plans" | "users" | "subs" | "revenue" | "audit" | "announcements" | "support" | "logs" | "settings" | "security">("analytics");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<"all" | "error" | "warning" | "info">("all");
  const [logSearch, setLogSearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");
  const [planStatus, setPlanStatus] = useState("all");
  const [planPage, setPlanPage] = useState(1);

  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";

  useEffect(() => {
    if (!isAdmin) { navigate("/dashboard"); return; }
    const fetch = async () => {
      const [usersRes, plansRes, viewsRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url, created_at").order("created_at", { ascending: false }),
        supabase.from("business_plans").select("id, name, secteur, statut, progress, user_id, created_at").order("created_at", { ascending: false }),
        supabase.from("share_views").select("plan_id, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("error_logs").select("id, level, source, message, stack, route, user_id, user_agent, created_at").order("created_at", { ascending: false }).limit(200),
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (plansRes.data) setPlans(plansRes.data);
      if (viewsRes.data) setShareViews(viewsRes.data);
      if (logsRes.data) setErrorLogs(logsRes.data as ErrorLogRow[]);
      setLoading(false);
    };
    fetch();
  }, [isAdmin, navigate]);

  const handleDeletePlan = async (id: string) => {
    const { error } = await supabase.from("business_plans").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { setPlans(plans.filter((p) => p.id !== id)); toast.success(t("admin.deleted")); }
    setDeleteId(null);
  };

  const getUserName = (userId: string) => {
    const u = users.find((u) => u.user_id === userId);
    return u?.display_name || userId.slice(0, 8);
  };

  const handleDeleteLog = async (id: string) => {
    const { error } = await supabase.from("error_logs").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setErrorLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleClearLogs = async () => {
    if (!confirm(lang === "fr" ? "Supprimer tous les logs affichés ?" : "Delete all displayed logs?")) return;
    const ids = filteredLogs.map(l => l.id);
    if (ids.length === 0) return;
    const { error } = await supabase.from("error_logs").delete().in("id", ids);
    if (error) toast.error(error.message);
    else {
      setErrorLogs(prev => prev.filter(l => !ids.includes(l.id)));
      toast.success(lang === "fr" ? `${ids.length} log(s) supprimé(s)` : `${ids.length} log(s) deleted`);
    }
  };

  const filteredLogs = (logFilter === "all" ? errorLogs : errorLogs.filter(l => l.level === logFilter))
    .filter(l => !logSearch.trim() || `${l.message} ${l.route ?? ""}`.toLowerCase().includes(logSearch.trim().toLowerCase()));
  const filteredPlans = plans.filter(p => {
    const q = planSearch.trim().toLowerCase();
    return (planStatus === "all" || p.statut === planStatus) &&
      (!q || `${p.name} ${p.secteur ?? ""} ${getUserName(p.user_id)}`.toLowerCase().includes(q));
  });
  const planPaged = paginate(filteredPlans, planPage);
  const errorCount24h = errorLogs.filter(l => l.level === "error" && Date.now() - new Date(l.created_at).getTime() < 86400000).length;

  const analytics = useMemo(() => {
    const avgProgress = plans.length ? Math.round(plans.reduce((s, p) => s + p.progress, 0) / plans.length) : 0;

    const statusData = [
      { name: t("admin.drafts"), value: plans.filter(p => p.statut === "brouillon").length },
      { name: t("admin.finalized"), value: plans.filter(p => p.statut === "finalise").length },
      { name: t("admin.archived"), value: plans.filter(p => p.statut === "archive").length },
    ].filter(d => d.value > 0);

    const sectorMap: Record<string, number> = {};
    plans.forEach(p => { const s = p.secteur || t("admin.undefined"); sectorMap[s] = (sectorMap[s] || 0) + 1; });
    const sectorData = Object.entries(sectorMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toLocaleDateString(dateLocale, { month: "short", year: "2-digit" });
      const count = plans.filter(p => {
        const pd = new Date(p.created_at);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      }).length;
      const userCount = users.filter(u => {
        const ud = new Date(u.created_at);
        return ud.getMonth() === d.getMonth() && ud.getFullYear() === d.getFullYear();
      }).length;
      monthlyData.push({ month, plans: count, users: userCount });
    }

    const completionRate = plans.length ? Math.round((plans.filter(p => p.statut === "finalise").length / plans.length) * 100) : 0;

    // Share view trends (last 7 days)
    const viewTrend = [];
    const now2 = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now2);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString(dateLocale, { weekday: "short", day: "numeric" });
      const count = shareViews.filter(v => {
        const vd = new Date(v.created_at);
        return vd.toDateString() === d.toDateString();
      }).length;
      viewTrend.push({ day: dayStr, views: count });
    }

    return { avgProgress, statusData, sectorData, monthlyData, completionRate, viewTrend, totalViews: shareViews.length };
  }, [plans, users, shareViews, t, dateLocale]);

  const statusColors: Record<string, string> = {
    brouillon: "bg-secondary text-muted-foreground",
    finalise: "bg-success/10 text-success",
    archive: "bg-destructive/10 text-destructive",
  };

  const tooltipStyle = {
    backgroundColor: "hsl(225, 15%, 10%)",
    border: "1px solid hsl(0 0% 100% / 0.1)",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="min-h-screen">
      <TopBar showAdmin showDashboard />

      <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-10">
        <h1 className="font-display text-4xl font-bold mb-2">{t("admin.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("admin.subtitle")}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { val: users.length, label: t("admin.users"), icon: <Users className="w-4 h-4" /> },
            { val: plans.length, label: t("admin.businessPlans"), icon: <FileText className="w-4 h-4" /> },
            { val: plans.filter(p => p.statut === "finalise").length, label: t("admin.finalized") },
            { val: `${analytics.avgProgress}%`, label: t("admin.avgProgress") },
            { val: `${analytics.completionRate}%`, label: t("admin.completionRate"), icon: <TrendingUp className="w-4 h-4" /> },
            { val: analytics.totalViews, label: t("admin.shareViews"), icon: <Share2 className="w-4 h-4" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
              <div className="font-display text-3xl font-bold text-[hsl(var(--gold-light))]">{stat.val}</div>
              <div className="text-[0.68rem] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-secondary p-1 rounded-lg w-fit flex-wrap">
          {([
            { key: "analytics" as const, label: t("admin.analytics"), icon: <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "plans" as const, label: t("admin.businessPlans"), icon: <FileText className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "users" as const, label: t("admin.users"), icon: <Users className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "subs" as const, label: lang === "fr" ? "Abonnements" : "Subscriptions", icon: <CreditCard className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "revenue" as const, label: lang === "fr" ? "Revenus" : "Revenue", icon: <Coins className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "audit" as const, label: lang === "fr" ? "Journal admin" : "Admin log", icon: <ScrollText className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "announcements" as const, label: lang === "fr" ? "Annonces" : "Announcements", icon: <Megaphone className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "support" as const, label: "Support", icon: <LifeBuoy className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "logs" as const, label: lang === "fr" ? "Logs" : "Logs", icon: <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "settings" as const, label: lang === "fr" ? "Réglages" : "Settings", icon: <Settings className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "security" as const, label: lang === "fr" ? "Sécurité" : "Security", icon: <KeyRound className="w-3.5 h-3.5 inline mr-1.5" /> },
          ]).map(tabItem => (
            <button key={tabItem.key} onClick={() => setTab(tabItem.key)} className={`px-4 py-2 rounded-md text-xs font-bold transition-all relative ${tab === tabItem.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {tabItem.icon}{tabItem.label}
              {tabItem.key === "logs" && errorCount24h > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-destructive text-destructive-foreground text-[0.6rem] font-bold">
                  {errorCount24h}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner /></div>
        ) : tab === "analytics" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold mb-4">{t("admin.monthlyCreations")}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(30, 7%, 40%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(30, 7%, 40%)" }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(36, 20%, 93%)" }} />
                    <Bar dataKey="plans" name="Business Plans" fill="hsl(43, 55%, 54%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="users" name={t("admin.users")} fill="hsl(155, 62%, 53%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold mb-4">{t("admin.statusDistribution")}</h3>
                {analytics.statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={analytics.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {analytics.statusData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-16">{t("admin.noData")}</p>
                )}
              </div>
            </div>

            {analytics.sectorData.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold mb-4">{t("admin.sectorDistribution")}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.sectorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(30, 7%, 40%)" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(30, 7%, 40%)" }} width={120} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(36, 20%, 93%)" }} />
                    <Bar dataKey="value" name="Plans" fill="hsl(217, 90%, 64%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {analytics.viewTrend.some(d => d.views > 0) && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-bold mb-4">👁️ {t("admin.shareViewTrend")}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.viewTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(30, 7%, 40%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(30, 7%, 40%)" }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(36, 20%, 93%)" }} />
                    <Line type="monotone" dataKey="views" name={t("admin.shareViews")} stroke="hsl(43, 55%, 54%)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : tab === "plans" ? (
          <div>
          <AdminToolbar search={planSearch} onSearch={(v) => { setPlanSearch(v); setPlanPage(1); }} placeholder={lang === "fr" ? "Nom, secteur, utilisateur..." : "Name, sector, user..."}
            onExport={() => downloadCsv("business-plans.csv", ["id", "name", "user", "sector", "progress", "status", "created_at"], filteredPlans.map(p => [p.id, p.name, getUserName(p.user_id), p.secteur, p.progress, p.statut, p.created_at]))}>
            <select aria-label="Status" value={planStatus} onChange={e => { setPlanStatus(e.target.value); setPlanPage(1); }} className={inputCls}>
              <option value="all">{lang === "fr" ? "Tous statuts" : "All statuses"}</option>
              <option value="brouillon">{t("admin.drafts")}</option><option value="finalise">{t("admin.finalized")}</option><option value="archive">{t("admin.archived")}</option>
            </select>
          </AdminToolbar>
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3">{t("admin.name")}</th>
                  <th className="text-left px-4 py-3">{t("admin.user")}</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">{t("admin.sectorCol")}</th>
                  <th className="text-center px-4 py-3">{t("admin.progress")}</th>
                  <th className="text-center px-4 py-3">{t("admin.status")}</th>
                  <th className="text-right px-4 py-3">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {planPaged.pageItems.map((bp) => (
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
                        <button onClick={() => navigate(`/bp/${bp.id}`)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(bp.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={planPaged.page} pages={planPaged.pages} total={filteredPlans.length} onPage={setPlanPage} fr={lang === "fr"} />
          </div>
        ) : tab === "users" ? (
          <UsersPanel />
        ) : tab === "subs" ? (
          <SubscriptionsPanel />
        ) : tab === "revenue" ? (
          <RevenuePanel />
        ) : tab === "audit" ? (
          <AdminAuditPanel />
        ) : tab === "announcements" ? (
          <AnnouncementsPanel />
        ) : tab === "support" ? (
          <SupportPanel />
        ) : tab === "settings" ? (
          <SettingsPanel />
        ) : tab === "security" ? (
          <div className="flex flex-col md:flex-row gap-5 items-start"><AdminSecurityPanel /><MfaSection /></div>

        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground mr-2">{lang === "fr" ? "Filtre :" : "Filter:"}</span>
              {(["all", "error", "warning", "info"] as const).map(f => (
                <button key={f} onClick={() => setLogFilter(f)}
                  className={`px-3 py-1 rounded-md text-[0.65rem] font-bold uppercase transition-all ${
                    logFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}>
                  {f === "all" ? (lang === "fr" ? "Tous" : "All") : f}
                </button>
              ))}
              <span className="ml-auto text-[0.65rem] text-muted-foreground">
                {filteredLogs.length} {lang === "fr" ? "entrées" : "entries"}
              </span>
              {filteredLogs.length > 0 && (
                <button onClick={handleClearLogs}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-[0.65rem] font-bold hover:bg-destructive/20">
                  <Trash2 className="w-3 h-3" />{lang === "fr" ? "Vider" : "Clear"}
                </button>
              )}
            </div>

            {filteredLogs.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
                {lang === "fr" ? "Aucun log enregistré ✓" : "No logs recorded ✓"}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredLogs.map(log => (
                    <details key={log.id} className="border-b border-border/50 group">
                      <summary className="px-4 py-3 cursor-pointer hover:bg-secondary/30 flex items-start gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[0.55rem] font-bold uppercase shrink-0 mt-0.5 ${
                          log.level === "error" ? "bg-destructive/15 text-destructive" :
                          log.level === "warning" ? "bg-[hsl(43,55%,54%)]/15 text-[hsl(43,55%,54%)]" :
                          "bg-secondary text-muted-foreground"
                        }`}>{log.level}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{log.message}</div>
                          <div className="text-[0.6rem] text-muted-foreground mt-0.5 flex gap-2 flex-wrap">
                            <span>{new Date(log.created_at).toLocaleString(dateLocale)}</span>
                            {log.route && <span>· {log.route}</span>}
                            {log.user_id && <span>· user {log.user_id.slice(0, 8)}</span>}
                            <span>· {log.source}</span>
                          </div>
                        </div>
                        <button onClick={(e) => { e.preventDefault(); handleDeleteLog(log.id); }}
                          className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </summary>
                      {(log.stack || log.user_agent) && (
                        <div className="px-4 pb-3 pl-14 space-y-2">
                          {log.stack && (
                            <pre className="text-[0.6rem] bg-secondary/50 border border-border rounded p-2 overflow-x-auto whitespace-pre-wrap break-words max-h-48 overflow-y-auto">{log.stack}</pre>
                          )}
                          {log.user_agent && (
                            <div className="text-[0.6rem] text-muted-foreground italic truncate">UA: {log.user_agent}</div>
                          )}
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("common.confirmDelete")}
        description={t("common.irreversible")}
        confirmLabel={t("common.deleteConfirm")}
        variant="destructive"
        onConfirm={() => { if (deleteId) handleDeletePlan(deleteId); }}
      />
    </div>
  );
};

export default AdminDashboard;
