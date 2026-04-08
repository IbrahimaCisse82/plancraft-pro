import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, FileText, Eye, Trash2, TrendingUp, BarChart3, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
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

const PIE_COLORS = ["hsl(43, 55%, 54%)", "hsl(155, 62%, 53%)", "hsl(2, 82%, 60%)"];

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [plans, setPlans] = useState<BPRow[]>([]);
  const [shareViews, setShareViews] = useState<{ plan_id: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"analytics" | "plans" | "users">("analytics");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";

  useEffect(() => {
    if (!isAdmin) { navigate("/dashboard"); return; }
    const fetch = async () => {
      const [usersRes, plansRes, viewsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url, created_at").order("created_at", { ascending: false }),
        supabase.from("business_plans").select("id, name, secteur, statut, progress, user_id, created_at").order("created_at", { ascending: false }),
        supabase.from("share_views").select("plan_id, created_at").order("created_at", { ascending: false }).limit(500),
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (plansRes.data) setPlans(plansRes.data);
      if (viewsRes.data) setShareViews(viewsRes.data);
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

        <div className="flex gap-1 mb-6 bg-secondary p-1 rounded-lg w-fit">
          {([
            { key: "analytics" as const, label: t("admin.analytics"), icon: <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "plans" as const, label: t("admin.businessPlans"), icon: <FileText className="w-3.5 h-3.5 inline mr-1.5" /> },
            { key: "users" as const, label: t("admin.users"), icon: <Users className="w-3.5 h-3.5 inline mr-1.5" /> },
          ]).map(tabItem => (
            <button key={tabItem.key} onClick={() => setTab(tabItem.key)} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${tab === tabItem.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {tabItem.icon}{tabItem.label}
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
                        <button onClick={() => navigate(`/bp/${bp.id}`)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(bp.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
                  <th className="text-left px-4 py-3">{t("admin.name")}</th>
                  <th className="text-left px-4 py-3">{t("admin.registrationDate")}</th>
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
                      {new Date(u.created_at).toLocaleDateString(dateLocale)}
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
