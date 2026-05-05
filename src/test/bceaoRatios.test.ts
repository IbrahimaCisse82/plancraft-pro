import { describe, it, expect } from "vitest";
import { computeBceaoRatios, buildBankPresentation } from "@/lib/bceaoRatios";

const sampleContent = {
  bilan_previsionnel: {
    "TOTAL ACTIF": { "Année 1": "1000000" },
    "Total capitaux propres": { "Année 1": "300000" },
    "Total dettes": { "Année 1": "400000" },
    "Stocks": { "Année 1": "100000" },
    "Créances clients": { "Année 1": "150000" },
    "Trésorerie (banque + caisse)": { "Année 1": "50000" },
    "Dettes fournisseurs": { "Année 1": "100000" },
    "Dettes fiscales et sociales": { "Année 1": "50000" },
  },
  compte_resultat: {
    "Résultat d'exploitation": { "Année 1": "120000", "Année 2": "150000", "Année 3": "180000" },
    "Amortissements": { "Année 1": "30000", "Année 2": "30000", "Année 3": "30000" },
    "Résultat net": { "Année 1": "80000", "Année 2": "100000", "Année 3": "120000" },
  },
  amortissement_emprunts: {
    "Annuité totale": { "Année 1": "100000" },
  },
  investissements: {
    "Terrain / Local": { "Montant": "200000" },
    "Équipements / Matériel": { "Montant": "150000" },
    "Stock initial": { "Montant": "50000" },
  },
  plan_financement: {
    "Apport personnel": { "Année 1": "100000" },
    "Emprunt bancaire": { "Année 1": "300000" },
  },
};

describe("computeBceaoRatios", () => {
  it("returns the 5 BCEAO ratios", () => {
    const ratios = computeBceaoRatios(sampleContent);
    expect(ratios).toHaveLength(5);
    expect(ratios.map(r => r.key)).toEqual(["solva", "liqui", "endett", "dscr", "payback"]);
  });

  it("computes solvency = equity / total assets", () => {
    const r = computeBceaoRatios(sampleContent).find(x => x.key === "solva")!;
    expect(r.value).toBeCloseTo(30, 1);
    expect(r.compliant).toBe(true);
  });

  it("computes DSCR = EBITDA / annuity", () => {
    const r = computeBceaoRatios(sampleContent).find(x => x.key === "dscr")!;
    expect(r.value).toBeCloseTo(1.5, 1);
    expect(r.compliant).toBe(true);
  });

  it("flags non-compliance when DSCR < 1.3", () => {
    const bad = {
      ...sampleContent,
      amortissement_emprunts: { "Annuité totale": { "Année 1": "200000" } },
    };
    const r = computeBceaoRatios(bad).find(x => x.key === "dscr")!;
    expect(r.compliant).toBe(false);
  });

  it("returns null values when data is missing", () => {
    const ratios = computeBceaoRatios({});
    ratios.forEach(r => expect(r.value === null || r.value === 0).toBeTruthy());
  });
});

describe("buildBankPresentation", () => {
  it("aggregates investment, contribution and loan", () => {
    const p = buildBankPresentation(sampleContent);
    expect(p.totalInvest).toBe(400000);
    expect(p.apport).toBe(100000);
    expect(p.emprunt).toBe(300000);
    expect(p.apportRatio).toBe(25);
    expect(p.dscr).toBeCloseTo(1.5, 1);
  });
});
