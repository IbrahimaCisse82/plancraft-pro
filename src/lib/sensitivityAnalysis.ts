/**
 * Sensitivity analysis: recompute key indicators under
 * Pessimiste / Base / Optimiste scenarios by shocking
 * Revenue (CA), Variable charges and interest rate.
 */
import { calculateNPV, calculateIRR } from "./financialFormulas";

const num = (val: string | undefined): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

export interface ScenarioShock {
  /** % delta on CA (e.g. -0.15 = -15%) */
  caDelta: number;
  /** % delta on variable charges (achats + autres) */
  chargesDelta: number;
  /** absolute delta on discount rate (e.g. +0.02 = +2pts) */
  rateDelta: number;
}

export interface ScenarioResult {
  label: string;
  shock: ScenarioShock;
  caY1: number;
  caY3: number;
  resultatNetY1: number;
  resultatNetY3: number;
  ebeY1: number;
  dscrY1: number;
  pointMortY1: number;
  van: number;
  tri: number;
  verdict: "ok" | "warn" | "ko";
}

const DEFAULT_SCENARIOS: Record<"pessimiste" | "base" | "optimiste", ScenarioShock> = {
  pessimiste: { caDelta: -0.15, chargesDelta: 0.10, rateDelta: 0.02 },
  base: { caDelta: 0, chargesDelta: 0, rateDelta: 0 },
  optimiste: { caDelta: 0.10, chargesDelta: -0.05, rateDelta: 0 },
};

export const getDefaultScenarios = () => ({ ...DEFAULT_SCENARIOS });

const VARIABLE_CHARGE_ROWS = [
  "Achats de marchandises",
  "Transport",
  "Publicité / Marketing",
  "Frais divers",
];
const FIXED_CHARGE_ROWS = [
  "Charges de personnel",
  "Loyer",
  "Électricité / Eau",
  "Télécommunications",
  "Assurances",
];

const investRows = [
  "Terrain / Local", "Aménagement / Travaux", "Équipements / Matériel",
  "Véhicules", "Mobilier de bureau", "Matériel informatique",
  "Frais d'établissement", "Stock initial", "Trésorerie de départ", "Divers / Imprévus",
];

export const runScenario = (
  allContent: Record<string, any>,
  label: string,
  shock: ScenarioShock,
  baseRate = 0.10
): ScenarioResult | null => {
  const cr = allContent["compte_resultat"];
  const invest = allContent["investissements"];
  if (!cr) return null;

  const years = ["Année 1", "Année 2", "Année 3"];

  const shockedCA = years.map(y => num(cr["Chiffre d'affaires"]?.[y]) * (1 + shock.caDelta));
  const shockedVar = years.map(y =>
    VARIABLE_CHARGE_ROWS.reduce((s, r) => s + num(cr[r]?.[y]), 0) * (1 + shock.chargesDelta)
  );
  const fixedCharges = years.map(y =>
    FIXED_CHARGE_ROWS.reduce((s, r) => s + num(cr[r]?.[y]), 0)
  );
  const amort = years.map(y => num(cr["Amortissements"]?.[y]));
  const chargesFin = years.map(y =>
    num(cr["Charges financières"]?.[y]) * (1 + shock.rateDelta * 10) // proxy: +2pts ≈ +20% intérêts
  );

  const resultats = years.map((_, i) =>
    shockedCA[i] - shockedVar[i] - fixedCharges[i] - amort[i] - chargesFin[i]
  );

  const ebeY1 = shockedCA[0] - shockedVar[0] - fixedCharges[0];
  const debtServiceY1 = chargesFin[0] + (allContent["plan_financement"]
    ? num(allContent["plan_financement"]["Remboursement capital"]?.["Année 1"])
    : 0);
  const dscrY1 = debtServiceY1 > 0 ? (resultats[0] + amort[0] + chargesFin[0]) / debtServiceY1 : 0;

  // Point mort = charges fixes / taux marge sur coût variable
  const margeVar = shockedCA[0] > 0 ? (shockedCA[0] - shockedVar[0]) / shockedCA[0] : 0;
  const pointMortY1 = margeVar > 0 ? (fixedCharges[0] + amort[0]) / margeVar : 0;

  // VAN / TRI
  let van = 0, tri = 0;
  if (invest) {
    const totalInvest = investRows.reduce((s, r) => s + num(invest[r]?.["Montant"]), 0);
    if (totalInvest > 0) {
      const cashFlows = [-totalInvest, ...resultats.map((nr, i) => nr + amort[i])];
      van = calculateNPV(cashFlows, baseRate + shock.rateDelta);
      tri = calculateIRR(cashFlows);
    }
  }

  let verdict: "ok" | "warn" | "ko" = "ok";
  if (resultats[0] < 0 || dscrY1 < 1) verdict = "ko";
  else if (dscrY1 < 1.2 || van < 0) verdict = "warn";

  return {
    label,
    shock,
    caY1: shockedCA[0],
    caY3: shockedCA[2],
    resultatNetY1: resultats[0],
    resultatNetY3: resultats[2],
    ebeY1,
    dscrY1,
    pointMortY1,
    van,
    tri: isNaN(tri) ? 0 : tri,
    verdict,
  };
};
