import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BP_SECTIONS, resolveSection } from "@/components/editor/sectionConfig";
import { isComputedRow, applyFormulas } from "@/lib/financialFormulas";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { useI18n } from "@/contexts/I18nContext";

const SharedPlanPage = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useI18n();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSharedPlan = async () => {
      if (!token) { setError(t("shared.invalidUrl")); setLoading(false); return; }

      // Use secure function instead of direct table access
      const { data: planId, error: fnErr } = await supabase.rpc("get_shared_plan_id", { _token: token });

      if (fnErr || !planId) {
        setError(t("shared.invalidLink"));
        setLoading(false);
        return;
      }

      // Get plan using authenticated or anon access
      const { data: planData, error: planErr } = await supabase
        .from("business_plans")
        .select("name, secteur, devise, content")
        .eq("id", planId)
        .single();

      if (planErr || !planData) {
        setError(t("shared.planNotFound"));
        setLoading(false);
        return;
      }

      setPlan(planData);
      setLoading(false);
    };
    fetchSharedPlan();
  }, [token, t]);

  if (loading) return <FullPageSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="font-display text-2xl font-bold mb-2">{t("shared.accessDenied")}</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const content = (plan?.content as Record<string, any>) || {};

  const isSeparator = (row: string) => row.startsWith("---");
  const separatorLabel = (row: string) => row.replace(/^-+\s*/, "").replace(/\s*-+$/, "");

  const formatNum = (val: string) => {
    if (!val || val === "0") return "";
    const n = parseInt(val, 10);
    return isNaN(n) ? val : n.toLocaleString("fr-FR");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 h-[52px] bg-card border-b border-border flex items-center px-5 gap-3">
        <span className="font-display text-lg font-bold text-[hsl(var(--gold-light))]">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </span>
        <div className="h-5 w-px bg-border" />
        <span className="text-xs text-muted-foreground">{t("shared.readOnly")}</span>
      </div>

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">{plan?.name}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {plan?.secteur && <span>{plan.secteur}</span>}
            <span>·</span>
            <span>{plan?.devise}</span>
          </div>
        </div>

        {/* Sections */}
        {BP_SECTIONS.map((section) => {
          const val = content[section.id];
          if (!val) return null;
          const resolved = resolveSection(section, t);

          return (
            <SharedSection
              key={section.id}
              section={section}
              resolved={resolved}
              val={val}
              isSeparator={isSeparator}
              separatorLabel={separatorLabel}
              formatNum={formatNum}
              t={t}
            />
          );
        })}

        <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          {t("shared.generatedWith")} <span className="font-display font-bold text-[hsl(var(--gold-light))]">PlanCraft Pro</span>
        </div>
      </div>
    </div>
  );
};

/** Separate component to memoize applyFormulas per section */
const SharedSection = ({ section, resolved, val, isSeparator, separatorLabel, formatNum, t }: any) => {
  const computedData = useMemo(
    () => section.type === "financial" ? applyFormulas(section.id, val, section.columns || []) : val,
    [section.id, section.type, val, section.columns]
  );

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{section.icon}</span>
        <h2 className="font-display text-xl font-bold">{resolved.title}</h2>
      </div>

      {section.type === "narrative" && typeof val === "string" && val.trim() && (
        <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {val}
        </div>
      )}

      {section.type === "financial" && typeof val === "object" && (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-3 py-2.5 text-xs font-bold text-secondary-foreground border-b border-border min-w-[180px]">
                  {t("editor.post")}
                </th>
                {(section.columns || []).map((col: string) => (
                  <th key={col} className="text-right px-3 py-2.5 text-xs font-bold text-secondary-foreground border-b border-border min-w-[100px]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(section.rows || []).map((row: string, i: number) => {
                if (isSeparator(row)) {
                  return (
                    <tr key={row} className="bg-muted/50">
                      <td colSpan={(section.columns || []).length + 1} className="px-3 py-2 text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50">
                        {separatorLabel(row)}
                      </td>
                    </tr>
                  );
                }
                const computed = isComputedRow(section.id, row);
                return (
                  <tr key={row} className={`${computed ? "bg-primary/5 font-semibold" : i % 2 === 0 ? "bg-card" : "bg-secondary/30"}`}>
                    <td className={`px-3 py-2 text-xs font-medium border-b border-border/50 ${computed ? "text-primary" : "text-foreground"}`}>
                      {row}
                    </td>
                    {(section.columns || []).map((col: string) => (
                      <td key={col} className={`px-3 py-2 text-right text-xs border-b border-border/50 ${computed ? "text-primary font-bold" : ""}`}>
                        {formatNum(computedData[row]?.[col] || "")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {section.type === "swot" && typeof val === "object" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "forces", label: t("swot.strengths"), icon: "💪", color: "text-success" },
            { key: "faiblesses", label: t("swot.weaknesses"), icon: "⚡", color: "text-destructive" },
            { key: "opportunites", label: t("swot.opportunities"), icon: "🌟", color: "text-info" },
            { key: "menaces", label: t("swot.threats"), icon: "⚠️", color: "text-destructive" },
          ].map((q) => (
            <div key={q.key} className="bg-card border border-border rounded-lg p-4">
              <h3 className={`text-sm font-bold mb-2 ${q.color}`}>{q.icon} {q.label}</h3>
              <p className="text-xs text-secondary-foreground whitespace-pre-wrap">{val[q.key] || "—"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedPlanPage;
