/**
 * KPI dashboard: compare prévu vs réalisé and evaluate banking covenants.
 * Pure functions, no I/O — component wires content.
 */

const num = (val: string | number | undefined): number => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ""));
  return isNaN(n) ? 0 : n;
};

export const MONTHS = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];

export interface MonthlyComparison {
  month: string;
  prevu: number;
  realise: number;
  ecart: number; // realise - prevu
  ecartPct: number; // (realise - prevu) / prevu
}

export const buildMonthlyComparison = (
  prevuByMonth: Record<string, number>,
  realiseByMonth: Record<string, number>
): MonthlyComparison[] => {
  return MONTHS.map((m) => {
    const p = prevuByMonth[m] || 0;
    const r = realiseByMonth[m] || 0;
    const ecart = r - p;
    const ecartPct = p !== 0 ? ecart / Math.abs(p) : 0;
    return { month: m, prevu: p, realise: r, ecart, ecartPct };
  });
};

/** Derive monthly prévu CA by prorata from annual CR (equal monthly split). */
export const proratizeAnnual = (annualValue: number): Record<string, number> => {
  const monthly = annualValue / 12;
  return MONTHS.reduce((acc, m) => ({ ...acc, [m]: monthly }), {});
};

export interface Covenant {
  key: string;
  label: string;
  value: number;
  threshold: number;
  operator: "gte" | "lte" | "gt" | "lt";
  status: "ok" | "warn" | "ko";
  format: "ratio" | "pct" | "money";
}

const evaluateCovenant = (
  value: number,
  threshold: number,
  op: Covenant["operator"],
  warnBand = 0.1
): Covenant["status"] => {
  const passes =
    op === "gte" ? value >= threshold :
    op === "lte" ? value <= threshold :
    op === "gt" ? value > threshold :
    value < threshold;
  if (!passes) return "ko";
  // warn if within warnBand of the threshold
  const distance = Math.abs(value - threshold) / (Math.abs(threshold) || 1);
  return distance < warnBand ? "warn" : "ok";
};

export interface KpiInputs {
  /** Annual data derived from compte_resultat */
  caPrevuY1: number;
  resultatPrevuY1: number;
  ebePrevuY1: number;
  chargesFinPrevuY1: number;
  amortPrevuY1: number;
  /** Debt service from loan schedule / plan_financement */
  serviceDetteY1: number;
  /** Balance sheet approximations */
  capitauxPropres: number;
  detteFinanciere: number;
  /** Realised annual totals (from monthly inputs) */
  caRealiseY1: number;
  resultatRealiseY1: number;
  tresorerieFinY1: number;
}

export const buildCovenants = (inputs: KpiInputs): Covenant[] => {
  const dscr =
    inputs.serviceDetteY1 > 0
      ? (inputs.resultatRealiseY1 + inputs.amortPrevuY1 + inputs.chargesFinPrevuY1) /
        inputs.serviceDetteY1
      : 0;

  const gearing = inputs.capitauxPropres > 0 ? inputs.detteFinanciere / inputs.capitauxPropres : 999;

  const ecartCA =
    inputs.caPrevuY1 > 0 ? (inputs.caRealiseY1 - inputs.caPrevuY1) / inputs.caPrevuY1 : 0;

  return [
    {
      key: "dscr",
      label: "DSCR (Debt Service Coverage Ratio)",
      value: dscr,
      threshold: 1.2,
      operator: "gte",
      status: evaluateCovenant(dscr, 1.2, "gte", 0.1),
      format: "ratio",
    },
    {
      key: "gearing",
      label: "Gearing (Dettes / Capitaux propres)",
      value: gearing,
      threshold: 2,
      operator: "lte",
      status: evaluateCovenant(gearing, 2, "lte", 0.15),
      format: "ratio",
    },
    {
      key: "tresorerie",
      label: "Trésorerie fin d'exercice",
      value: inputs.tresorerieFinY1,
      threshold: 0,
      operator: "gte",
      status: inputs.tresorerieFinY1 >= 0 ? (inputs.tresorerieFinY1 < inputs.caPrevuY1 * 0.05 ? "warn" : "ok") : "ko",
      format: "money",
    },
    {
      key: "ecartCA",
      label: "Écart CA réalisé vs prévu",
      value: ecartCA,
      threshold: -0.15,
      operator: "gte",
      status: ecartCA >= -0.05 ? "ok" : ecartCA >= -0.15 ? "warn" : "ko",
      format: "pct",
    },
  ];
};

export { num };
