import { useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import {
  MONTHS,
  buildMonthlyComparison,
  proratizeAnnual,
  buildCovenants,
  num,
  type Covenant,
} from "@/lib/kpiDashboard";
import { generateLoanSchedule } from "@/lib/loanSchedule";

interface Props {
  content: Record<string, any>;
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
  devise: string;
  hint?: string;
}

const fmt = (n: number, devise: string) =>
  `${Math.round(n).toLocaleString("fr-FR")} ${devise}`;

const fmtCompact = (n: number) => Math.round(n).toLocaleString("fr-FR");

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const statusColor = (s: Covenant["status"]) =>
  s === "ok"
    ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
    : s === "warn"
    ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
    : "bg-destructive/20 text-destructive border-destructive/30";

const ecartColor = (ecartPct: number) => {
  if (ecartPct >= -0.05) return "text-green-700 dark:text-green-400";
  if (ecartPct >= -0.15) return "text-yellow-700 dark:text-yellow-500";
  return "text-destructive";
};

const KpiDashboardSection = ({ content, value, onChange, devise, hint }: Props) => {
  const { t } = useI18n();

  // Prévu — annual from compte_resultat
  const cr = content["compte_resultat"] || {};
  const caPrevuY1 = num(cr["Chiffre d'affaires"]?.["Année 1"]);
  const resultatPrevuY1 = num(cr["Résultat net"]?.["Année 1"]);
  const chargesFinPrevuY1 = num(cr["Charges financières"]?.["Année 1"]);
  const amortPrevuY1 = num(cr["Amortissements"]?.["Année 1"]);
  const totalChargesPrevuY1 = num(cr["Total charges"]?.["Année 1"]);
  const ebePrevuY1 = caPrevuY1 - totalChargesPrevuY1;

  // Prévu — monthly trésorerie from tresorerie section
  const treso = content["tresorerie"] || {};
  const tresoPrevu: Record<string, number> = MONTHS.reduce(
    (acc, m) => ({ ...acc, [m]: num(treso["Solde cumulé"]?.[m]) }),
    {}
  );

  // Prévu CA mensuel = prorata annuel
  const caPrevuMonthly = proratizeAnnual(caPrevuY1);
  const chargesPrevuMonthly = proratizeAnnual(totalChargesPrevuY1);

  // Debt service from loan schedule
  const loan = content["amortissement_emprunts"]?._params;
  const serviceDetteY1 = useMemo(() => {
    if (!loan) return 0;
    const s = generateLoanSchedule({
      capital: num(loan.capital),
      tauxAnnuel: num(loan.tauxAnnuel),
      dureeAnnees: num(loan.dureeAnnees),
      differeAnnees: num(loan.differeAnnees),
    });
    return s?.annual[0]?.annuite || 0;
  }, [loan?.capital, loan?.tauxAnnuel, loan?.dureeAnnees, loan?.differeAnnees]);

  // Capital / dettes from plan_financement
  const pf = content["plan_financement"] || {};
  const capitauxPropres =
    num(pf["Apport personnel"]?.["Année 1"]) + num(pf["Apport associés"]?.["Année 1"]);
  const detteFinanciere = num(pf["Emprunt bancaire"]?.["Année 1"]);

  // Realised — user-entered monthly
  const realise = value || {};
  const caRealise: Record<string, number> = MONTHS.reduce(
    (acc, m) => ({ ...acc, [m]: num(realise["ca"]?.[m]) }),
    {}
  );
  const chargesRealise: Record<string, number> = MONTHS.reduce(
    (acc, m) => ({ ...acc, [m]: num(realise["charges"]?.[m]) }),
    {}
  );
  const tresoRealise: Record<string, number> = MONTHS.reduce(
    (acc, m) => ({ ...acc, [m]: num(realise["tresorerie"]?.[m]) }),
    {}
  );

  const caComparison = buildMonthlyComparison(caPrevuMonthly, caRealise);
  const chargesComparison = buildMonthlyComparison(chargesPrevuMonthly, chargesRealise);
  const tresoComparison = buildMonthlyComparison(tresoPrevu, tresoRealise);

  const caRealiseY1 = Object.values(caRealise).reduce((s, v) => s + v, 0);
  const chargesRealiseY1 = Object.values(chargesRealise).reduce((s, v) => s + v, 0);
  const resultatRealiseY1 = caRealiseY1 - chargesRealiseY1 - amortPrevuY1 - chargesFinPrevuY1;
  const lastMonthWithData = [...MONTHS].reverse().find((m) => tresoRealise[m] !== 0);
  const tresorerieFinY1 = lastMonthWithData ? tresoRealise[lastMonthWithData] : 0;

  const covenants = buildCovenants({
    caPrevuY1,
    resultatPrevuY1,
    ebePrevuY1,
    chargesFinPrevuY1,
    amortPrevuY1,
    serviceDetteY1,
    capitauxPropres,
    detteFinanciere,
    caRealiseY1,
    resultatRealiseY1,
    tresorerieFinY1,
  });

  const updateCell = (kind: "ca" | "charges" | "tresorerie", month: string, val: string) => {
    onChange({
      ...value,
      [kind]: { ...(value?.[kind] || {}), [month]: val },
    });
  };

  const hasPrevuData = caPrevuY1 > 0;

  const rows: Array<{
    kind: "ca" | "charges" | "tresorerie";
    label: string;
    comparison: typeof caComparison;
  }> = [
    { kind: "ca", label: t("kpi.ca"), comparison: caComparison },
    { kind: "charges", label: t("kpi.charges"), comparison: chargesComparison },
    { kind: "tresorerie", label: t("kpi.tresorerie"), comparison: tresoComparison },
  ];

  const formatCovenantValue = (c: Covenant): string => {
    if (c.format === "money") return fmt(c.value, devise);
    if (c.format === "pct") return pct(c.value);
    return c.value.toFixed(2);
  };

  const formatCovenantThreshold = (c: Covenant): string => {
    const opSym = c.operator === "gte" ? "≥" : c.operator === "lte" ? "≤" : c.operator === "gt" ? ">" : "<";
    if (c.format === "money") return `${opSym} ${fmt(c.threshold, devise)}`;
    if (c.format === "pct") return `${opSym} ${pct(c.threshold)}`;
    return `${opSym} ${c.threshold.toFixed(2)}`;
  };

  return (
    <div>
      {hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}

      {!hasPrevuData && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-800 dark:text-yellow-300">
          {t("kpi.needForecast")}
        </div>
      )}

      {/* Covenants alerts */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
          {t("kpi.covenantsTitle")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {covenants.map((c) => (
            <div
              key={c.key}
              className={`p-3 border rounded-lg ${statusColor(c.status)}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold leading-tight">{c.label}</span>
                <span className="text-[0.6rem] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-current">
                  {t(`kpi.status.${c.status}`)}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-xl font-bold font-mono">{formatCovenantValue(c)}</div>
                <div className="text-[0.65rem] opacity-70">
                  {t("kpi.threshold")}: {formatCovenantThreshold(c)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly comparison table */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
        {t("kpi.monthlyTitle")}
      </h3>
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-2 py-2 font-bold border-b border-border sticky left-0 bg-secondary z-10 min-w-[130px]">
                {t("kpi.indicator")}
              </th>
              {MONTHS.map((m) => (
                <th key={m} className="text-right px-2 py-2 font-bold border-b border-border min-w-[75px]">
                  {m}
                </th>
              ))}
              <th className="text-right px-2 py-2 font-bold border-b border-border bg-accent/30 min-w-[85px]">
                {t("kpi.totalY1")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const totalPrevu = row.comparison.reduce((s, c) => s + c.prevu, 0);
              const totalRealise = row.comparison.reduce((s, c) => s + c.realise, 0);
              const totalEcartPct = totalPrevu !== 0 ? (totalRealise - totalPrevu) / Math.abs(totalPrevu) : 0;

              return (
                <>
                  {/* Prévu row */}
                  <tr key={`${row.kind}-prevu`} className="bg-card">
                    <td className="px-2 py-1.5 border-b border-border/50 sticky left-0 bg-card z-10">
                      <div className="font-medium">{row.label}</div>
                      <div className="text-[0.6rem] text-muted-foreground uppercase">{t("kpi.forecast")}</div>
                    </td>
                    {row.comparison.map((c) => (
                      <td key={c.month} className="px-2 py-1.5 text-right font-mono text-muted-foreground border-b border-border/50">
                        {c.prevu ? fmtCompact(c.prevu) : "—"}
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-right font-mono font-bold border-b border-border/50 bg-accent/20">
                      {totalPrevu ? fmtCompact(totalPrevu) : "—"}
                    </td>
                  </tr>
                  {/* Réalisé row (editable) */}
                  <tr key={`${row.kind}-realise`} className="bg-secondary/20">
                    <td className="px-2 py-1.5 border-b border-border/50 sticky left-0 bg-secondary/20 z-10">
                      <div className="text-[0.6rem] text-primary uppercase font-bold">{t("kpi.actual")}</div>
                    </td>
                    {row.comparison.map((c) => (
                      <td key={c.month} className="px-1 py-1 border-b border-border/50">
                        <input
                          type="number"
                          value={value?.[row.kind]?.[c.month] || ""}
                          onChange={(e) => updateCell(row.kind, c.month, e.target.value)}
                          className="w-full px-1 py-0.5 bg-background border border-border rounded text-right font-mono text-[0.7rem]"
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-right font-mono font-bold border-b border-border/50 bg-accent/20">
                      {totalRealise ? fmtCompact(totalRealise) : "—"}
                    </td>
                  </tr>
                  {/* Écart row */}
                  <tr key={`${row.kind}-ecart`} className="bg-secondary/40">
                    <td className="px-2 py-1.5 border-b-2 border-border sticky left-0 bg-secondary/40 z-10">
                      <div className="text-[0.6rem] text-muted-foreground uppercase font-bold">{t("kpi.variance")}</div>
                    </td>
                    {row.comparison.map((c) => (
                      <td key={c.month} className={`px-2 py-1.5 text-right font-mono text-[0.7rem] border-b-2 border-border ${c.prevu && c.realise ? ecartColor(c.ecartPct) : "text-muted-foreground/40"}`}>
                        {c.prevu && c.realise ? pct(c.ecartPct) : "—"}
                      </td>
                    ))}
                    <td className={`px-2 py-1.5 text-right font-mono font-bold border-b-2 border-border bg-accent/20 ${totalPrevu && totalRealise ? ecartColor(totalEcartPct) : "text-muted-foreground/40"}`}>
                      {totalPrevu && totalRealise ? pct(totalEcartPct) : "—"}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-[0.65rem] text-muted-foreground leading-relaxed">
        {t("kpi.footnote")}
      </div>
    </div>
  );
};

export default KpiDashboardSection;
