import { useState, useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { runScenario, getDefaultScenarios, type ScenarioShock } from "@/lib/sensitivityAnalysis";

interface Props {
  content: Record<string, any>;
  devise: string;
  hint?: string;
}

const fmt = (n: number, devise: string) =>
  `${Math.round(n).toLocaleString("fr-FR")} ${devise}`;

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const verdictClass = (v: "ok" | "warn" | "ko") =>
  v === "ok"
    ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
    : v === "warn"
    ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
    : "bg-destructive/20 text-destructive border-destructive/30";

const SensitivitySection = ({ content, devise, hint }: Props) => {
  const { t } = useI18n();
  const [scenarios, setScenarios] = useState(() => getDefaultScenarios());

  const results = useMemo(() => ({
    pessimiste: runScenario(content, t("sensitivity.pessimiste"), scenarios.pessimiste),
    base: runScenario(content, t("sensitivity.base"), scenarios.base),
    optimiste: runScenario(content, t("sensitivity.optimiste"), scenarios.optimiste),
  }), [content, scenarios, t]);

  const updateShock = (key: keyof typeof scenarios, field: keyof ScenarioShock, value: number) => {
    setScenarios(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  if (!results.base) {
    return (
      <div className="p-6 bg-secondary/30 border border-border rounded-lg text-sm text-muted-foreground">
        {t("sensitivity.needData")}
      </div>
    );
  }

  const cols: Array<{ key: keyof typeof scenarios; color: string }> = [
    { key: "pessimiste", color: "text-destructive" },
    { key: "base", color: "text-foreground" },
    { key: "optimiste", color: "text-green-700 dark:text-green-400" },
  ];

  return (
    <div>
      {hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}

      {/* Shock controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {cols.map(({ key, color }) => (
          <div key={key} className="p-3 bg-card border border-border rounded-lg">
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${color}`}>
              {t(`sensitivity.${key}`)}
            </div>
            <div className="space-y-2 text-[0.7rem]">
              <label className="block">
                <span className="text-muted-foreground">{t("sensitivity.caDelta")}</span>
                <input
                  type="number"
                  step="5"
                  value={Math.round(scenarios[key].caDelta * 100)}
                  onChange={(e) => updateShock(key, "caDelta", parseFloat(e.target.value) / 100 || 0)}
                  className="w-full mt-1 px-2 py-1 bg-secondary border border-border rounded text-foreground"
                />
                <span className="text-muted-foreground text-[0.6rem]">%</span>
              </label>
              <label className="block">
                <span className="text-muted-foreground">{t("sensitivity.chargesDelta")}</span>
                <input
                  type="number"
                  step="5"
                  value={Math.round(scenarios[key].chargesDelta * 100)}
                  onChange={(e) => updateShock(key, "chargesDelta", parseFloat(e.target.value) / 100 || 0)}
                  className="w-full mt-1 px-2 py-1 bg-secondary border border-border rounded text-foreground"
                />
                <span className="text-muted-foreground text-[0.6rem]">%</span>
              </label>
              <label className="block">
                <span className="text-muted-foreground">{t("sensitivity.rateDelta")}</span>
                <input
                  type="number"
                  step="0.5"
                  value={(scenarios[key].rateDelta * 100).toFixed(1)}
                  onChange={(e) => updateShock(key, "rateDelta", parseFloat(e.target.value) / 100 || 0)}
                  className="w-full mt-1 px-2 py-1 bg-secondary border border-border rounded text-foreground"
                />
                <span className="text-muted-foreground text-[0.6rem]">pts</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-3 py-2.5 text-xs font-bold text-secondary-foreground border-b border-border">
                {t("sensitivity.indicator")}
              </th>
              {cols.map(({ key, color }) => (
                <th key={key} className={`text-right px-3 py-2.5 text-xs font-bold border-b border-border ${color}`}>
                  {t(`sensitivity.${key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: t("sensitivity.caY1"), get: (r: any) => fmt(r.caY1, devise) },
              { label: t("sensitivity.caY3"), get: (r: any) => fmt(r.caY3, devise) },
              { label: t("sensitivity.ebeY1"), get: (r: any) => fmt(r.ebeY1, devise) },
              { label: t("sensitivity.resultatNetY1"), get: (r: any) => fmt(r.resultatNetY1, devise) },
              { label: t("sensitivity.resultatNetY3"), get: (r: any) => fmt(r.resultatNetY3, devise) },
              { label: t("sensitivity.pointMortY1"), get: (r: any) => fmt(r.pointMortY1, devise) },
              { label: t("sensitivity.dscrY1"), get: (r: any) => r.dscrY1.toFixed(2) },
              { label: t("sensitivity.van"), get: (r: any) => fmt(r.van, devise) },
              { label: t("sensitivity.tri"), get: (r: any) => pct(r.tri) },
            ].map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                <td className="px-3 py-2 text-xs font-medium border-b border-border/50">{row.label}</td>
                {cols.map(({ key }) => {
                  const r = results[key];
                  return (
                    <td key={key} className="px-3 py-2 text-xs text-right font-mono border-b border-border/50">
                      {r ? row.get(r) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-accent/30">
              <td className="px-3 py-2.5 text-xs font-bold border-t border-border">{t("sensitivity.verdict")}</td>
              {cols.map(({ key }) => {
                const r = results[key];
                if (!r) return <td key={key} />;
                return (
                  <td key={key} className="px-3 py-2 text-center border-t border-border">
                    <span className={`inline-block px-2 py-1 rounded border text-[0.65rem] font-bold uppercase tracking-wider ${verdictClass(r.verdict)}`}>
                      {t(`sensitivity.verdict.${r.verdict}`)}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-[0.65rem] text-muted-foreground leading-relaxed">
        {t("sensitivity.footnote")}
      </div>
    </div>
  );
};

export default SensitivitySection;
