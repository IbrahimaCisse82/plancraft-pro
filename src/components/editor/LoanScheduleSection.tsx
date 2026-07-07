import { useEffect, useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { generateLoanSchedule, scheduleToCsv, type LoanParams } from "@/lib/loanSchedule";
import type { SectionConfig } from "./sectionConfig";
import { toast } from "sonner";

interface Props {
  section: SectionConfig;
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
  devise: string;
  hint?: string;
}

const num = (v: string | number | undefined, fallback = 0): number => {
  if (typeof v === "number") return v;
  if (!v) return fallback;
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ""));
  return isNaN(n) ? fallback : n;
};

const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");

const LoanScheduleSection = ({ section, value, onChange, devise, hint }: Props) => {
  const { t } = useI18n();

  // Params stored under `_params` sub-key so we don't collide with row cells
  const params = value?._params || {};
  const p: LoanParams = {
    capital: num(params.capital, 0),
    tauxAnnuel: num(params.tauxAnnuel, 8),
    dureeAnnees: num(params.dureeAnnees, 5),
    differeAnnees: num(params.differeAnnees, 0),
  };

  const schedule = useMemo(() => generateLoanSchedule(p), [p.capital, p.tauxAnnuel, p.dureeAnnees, p.differeAnnees]);

  const updateParam = (key: keyof LoanParams, v: string) => {
    onChange({
      ...value,
      _params: { ...params, [key]: v },
    });
  };

  // Populate row/column cells so exports (PDF/DOCX/XLSX) pick up the schedule
  useEffect(() => {
    if (!schedule) return;
    const cols = section.columns || [];
    const patch: Record<string, any> = { ...value, _params: params };

    const setCell = (row: string, col: string, val: string) => {
      patch[row] = { ...(patch[row] || {}), [col]: val };
    };

    cols.forEach((col, idx) => {
      const yr = schedule.annual[idx];
      setCell("Capital emprunté", col, idx === 0 ? String(Math.round(p.capital)) : "");
      setCell("Taux d'intérêt (%)", col, idx === 0 ? String(p.tauxAnnuel) : "");
      setCell("Durée (années)", col, idx === 0 ? String(p.dureeAnnees) : "");
      if (yr) {
        setCell("Annuité totale", col, String(Math.round(yr.annuite)));
        setCell("Part capital", col, String(Math.round(yr.capital)));
        setCell("Part intérêts", col, String(Math.round(yr.interets)));
        setCell("Capital restant dû", col, String(Math.round(yr.crd)));
      } else {
        setCell("Annuité totale", col, "");
        setCell("Part capital", col, "");
        setCell("Part intérêts", col, "");
        setCell("Capital restant dû", col, "");
      }
    });

    // Only trigger onChange if something changed
    if (JSON.stringify(patch) !== JSON.stringify(value)) {
      onChange(patch);
    }
     
  }, [schedule?.annuiteConstante]);

  const downloadMonthly = () => {
    if (!schedule) return;
    const csv = scheduleToCsv(schedule, devise);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `echeancier_emprunt_${p.capital}_${p.tauxAnnuel}pct_${p.dureeAnnees}ans.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("loan.csvDownloaded"));
  };

  return (
    <div>
      {hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}

      {/* Inputs */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: "capital" as const, label: t("loan.capital"), unit: devise, step: "1000" },
          { key: "tauxAnnuel" as const, label: t("loan.rate"), unit: "%", step: "0.1" },
          { key: "dureeAnnees" as const, label: t("loan.duration"), unit: t("loan.years"), step: "1" },
          { key: "differeAnnees" as const, label: t("loan.grace"), unit: t("loan.years"), step: "1" },
        ].map((f) => (
          <label key={f.key} className="block p-3 bg-card border border-border rounded-lg">
            <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {f.label}
            </span>
            <input
              type="number"
              step={f.step}
              min="0"
              value={params[f.key] ?? p[f.key]}
              onChange={(e) => updateParam(f.key, e.target.value)}
              className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-sm text-foreground font-mono"
            />
            <span className="text-[0.65rem] text-muted-foreground mt-1 inline-block">{f.unit}</span>
          </label>
        ))}
      </div>

      {!schedule ? (
        <div className="p-6 bg-secondary/30 border border-border rounded-lg text-sm text-muted-foreground">
          {t("loan.needParams")}
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-accent/20 border border-accent/30 rounded-lg">
              <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("loan.annuityConstant")}
              </div>
              <div className="text-lg font-bold font-mono">{fmt(schedule.annuiteConstante)} {devise}</div>
            </div>
            <div className="p-3 bg-accent/20 border border-accent/30 rounded-lg">
              <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("loan.totalInterest")}
              </div>
              <div className="text-lg font-bold font-mono text-destructive">{fmt(schedule.totalInterets)} {devise}</div>
            </div>
            <div className="p-3 bg-accent/20 border border-accent/30 rounded-lg">
              <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("loan.totalRepaid")}
              </div>
              <div className="text-lg font-bold font-mono">{fmt(schedule.totalRembourse)} {devise}</div>
            </div>
          </div>

          {/* Annual schedule table */}
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left px-3 py-2.5 text-xs font-bold border-b border-border">{t("loan.year")}</th>
                  <th className="text-right px-3 py-2.5 text-xs font-bold border-b border-border">{t("loan.annuity")}</th>
                  <th className="text-right px-3 py-2.5 text-xs font-bold border-b border-border">{t("loan.interest")}</th>
                  <th className="text-right px-3 py-2.5 text-xs font-bold border-b border-border">{t("loan.principal")}</th>
                  <th className="text-right px-3 py-2.5 text-xs font-bold border-b border-border">{t("loan.crd")}</th>
                </tr>
              </thead>
              <tbody>
                {schedule.annual.map((r, i) => (
                  <tr key={r.annee} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                    <td className="px-3 py-2 text-xs font-medium border-b border-border/50">{t("loan.year")} {r.annee}</td>
                    <td className="px-3 py-2 text-xs text-right font-mono border-b border-border/50">{fmt(r.annuite)}</td>
                    <td className="px-3 py-2 text-xs text-right font-mono text-destructive/80 border-b border-border/50">{fmt(r.interets)}</td>
                    <td className="px-3 py-2 text-xs text-right font-mono border-b border-border/50">{fmt(r.capital)}</td>
                    <td className="px-3 py-2 text-xs text-right font-mono text-muted-foreground border-b border-border/50">{fmt(r.crd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <div className="text-[0.65rem] text-muted-foreground leading-relaxed">
              {t("loan.footnote")}
            </div>
            <button
              onClick={downloadMonthly}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-all"
            >
              ⬇ {t("loan.downloadMonthly")}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LoanScheduleSection;
