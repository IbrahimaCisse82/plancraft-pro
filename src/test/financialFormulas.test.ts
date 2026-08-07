import { describe, it, expect } from "vitest";
import {
  calculateNPV,
  calculateIRR,
  applyFormulas,
  applyCrossTableLinks,
  isComputedRow,
} from "@/lib/financialFormulas";

describe("calculateNPV", () => {
  it("returns correct NPV for simple cash flows", () => {
    const cf = [-100000, 40000, 50000, 60000];
    const npv = calculateNPV(cf, 0.10);
    expect(npv).toBeCloseTo(22765, -1);
  });

  it("returns negative NPV for unprofitable project", () => {
    const cf = [-100000, 10000, 10000, 10000];
    expect(calculateNPV(cf, 0.10)).toBeLessThan(0);
  });

  it("returns NaN for discount rate <= -1", () => {
    expect(calculateNPV([-100, 200], -1)).toBeNaN();
  });

  it("handles zero cash flows", () => {
    expect(calculateNPV([0, 0, 0], 0.10)).toBe(0);
  });
});

describe("calculateIRR", () => {
  it("returns correct IRR for standard project", () => {
    const cf = [-100000, 40000, 50000, 60000];
    const irr = calculateIRR(cf);
    expect(irr).toBeCloseTo(0.216, 2);
  });

  it("returns NaN when no sign change", () => {
    expect(calculateIRR([100, 200, 300])).toBeNaN();
  });

  it("handles break-even project", () => {
    const irr = calculateIRR([-100, 50, 50]);
    expect(irr).toBeCloseTo(0, 1);
  });
});

describe("applyFormulas - compte_resultat", () => {
  const data = {
    "Chiffre d'affaires": { "Année 1": "100000" },
    "Achats de marchandises": { "Année 1": "30000" },
    "Charges de personnel": { "Année 1": "20000" },
    "Loyer": { "Année 1": "5000" },
    "Électricité / Eau": { "Année 1": "2000" },
    "Transport": { "Année 1": "1000" },
    "Télécommunications": { "Année 1": "500" },
    "Assurances": { "Année 1": "1000" },
    "Publicité / Marketing": { "Année 1": "3000" },
    "Frais divers": { "Année 1": "500" },
    "Amortissements": { "Année 1": "5000" },
    "Charges financières": { "Année 1": "2000" },
  };

  it("calculates Marge brute", () => {
    const result = applyFormulas("compte_resultat", data, ["Année 1"]);
    expect(result["Marge brute"]["Année 1"]).toBe("70000");
  });

  it("calculates Total charges", () => {
    const result = applyFormulas("compte_resultat", data, ["Année 1"]);
    expect(result["Total charges"]["Année 1"]).toBe("33000");
  });

  it("calculates Résultat net", () => {
    const result = applyFormulas("compte_resultat", data, ["Année 1"]);
    expect(result["Résultat net"]["Année 1"]).toBe("30000");
  });
});

describe("applyFormulas - seuil_rentabilite", () => {
  it("calculates break-even and dead point", () => {
    const data = {
      "Chiffre d'affaires": { "Année 1": "200000" },
      "Charges variables": { "Année 1": "80000" },
      "Charges fixes": { "Année 1": "60000" },
    };
    const result = applyFormulas("seuil_rentabilite", data, ["Année 1"]);
    expect(result["Marge sur coûts variables"]["Année 1"]).toBe("120000");
    expect(result["Taux de marge (%)"]["Année 1"]).toBe("60");
    expect(result["Seuil de rentabilité (CA)"]["Année 1"]).toBe("100000");
    expect(Number(result["Point mort (en jours)"]["Année 1"])).toBeCloseTo(183, 0);
  });

  it("handles zero revenue", () => {
    const data = {
      "Chiffre d'affaires": { "Année 1": "0" },
      "Charges variables": { "Année 1": "0" },
      "Charges fixes": { "Année 1": "10000" },
    };
    const result = applyFormulas("seuil_rentabilite", data, ["Année 1"]);
    expect(result["Seuil de rentabilité (CA)"]["Année 1"]).toBe("0");
  });
});

describe("applyFormulas - tresorerie cumul", () => {
  it("correctly computes cumulative balance", () => {
    const data = {
      "Solde initial": { "M1": "10000" },
      "Encaissements ventes": { "M1": "5000", "M2": "8000" },
      "Apports / Emprunts": {},
      "Autres encaissements": {},
      "Achats": { "M1": "3000", "M2": "4000" },
      "Salaires": {},
      "Charges sociales": {},
      "Loyer": {},
      "Autres décaissements": {},
    };
    const cols = ["M1", "M2"];
    const result = applyFormulas("tresorerie", data, cols);
    expect(result["Solde mensuel"]["M1"]).toBe("2000");
    expect(result["Solde cumulé"]["M1"]).toBe("12000"); // 10000 + 2000
    expect(result["Solde cumulé"]["M2"]).toBe("16000"); // 12000 + 4000
  });
});

describe("applyCrossTableLinks", () => {
  it("links personnel costs to compte_resultat", () => {
    const content = {
      charges_personnel: {
        "Total charges du personnel": { "Année 1": "50000", "Année 2": "55000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": { "Année 1": "200000" },
      },
    };
    const result = applyCrossTableLinks(content);
    expect(result.compte_resultat["Charges de personnel"]["Année 1"]).toBe("50000");
    expect(result.compte_resultat["Charges de personnel"]["Année 2"]).toBe("55000");
  });

  it("links investments to plan_financement", () => {
    const content = {
      investissements: {
        "Terrain / Local": { "Montant": "30000" },
        "Équipements / Matériel": { "Montant": "20000" },
      },
      plan_financement: {},
    };
    const result = applyCrossTableLinks(content);
    expect(result.plan_financement["Investissements"]["Année 1"]).toBe("50000");
  });
});

describe("isComputedRow", () => {
  it("identifies computed rows", () => {
    expect(isComputedRow("compte_resultat", "Marge brute")).toBe(true);
    expect(isComputedRow("compte_resultat", "Résultat net")).toBe(true);
    expect(isComputedRow("compte_resultat", "Loyer")).toBe(false);
    expect(isComputedRow("tresorerie", "Solde cumulé")).toBe(true);
  });
});

describe("applyCrossTableLinks - liaisons bancaires", () => {
  it("links loan interest to compte_resultat and capital to plan_financement", () => {
    const content = {
      amortissement_emprunts: {
        "Part intérêts": { "Année 1": "8000", "Année 2": "6500" },
        "Part capital": { "Année 1": "12000", "Année 2": "13500" },
      },
      compte_resultat: { "Chiffre d'affaires": { "Année 1": "200000" } },
      plan_financement: {},
    };
    const r = applyCrossTableLinks(content);
    expect(r.compte_resultat["Charges financières"]["Année 1"]).toBe("8000");
    expect(r.plan_financement["Remboursement d'emprunts"]["Année 2"]).toBe("13500");
  });

  it("computes CAF (résultat net + amortissements) into plan_financement", () => {
    const content = {
      compte_resultat: {
        "Résultat net": { "Année 1": "20000" },
        "Amortissements": { "Année 1": "5000" },
      },
    };
    const r = applyCrossTableLinks(content);
    expect(r.plan_financement["Capacité d'autofinancement"]["Année 1"]).toBe("25000");
  });

  it("links résultat net to bilan prévisionnel", () => {
    const content = {
      compte_resultat: { "Résultat net": { "Année 1": "20000", "Année 2": "31000" } },
      bilan_previsionnel: {},
    };
    const r = applyCrossTableLinks(content);
    expect(r.bilan_previsionnel["Résultat net"]["Année 2"]).toBe("31000");
  });
});

describe("generateLoanSchedule", () => {
  it("produces constant annuities and zero remaining capital", async () => {
    const { generateLoanSchedule } = await import("@/lib/loanSchedule");
    const s = generateLoanSchedule({ capital: 100000, tauxAnnuel: 8, dureeAnnees: 5 })!;
    expect(s.annual).toHaveLength(5);
    expect(Math.round(s.annual[0].annuite)).toBe(Math.round(s.annual[4].annuite));
    expect(Math.round(s.annual[4].crd)).toBe(0);
  });

  it("pays interest only during the grace period", async () => {
    const { generateLoanSchedule } = await import("@/lib/loanSchedule");
    const s = generateLoanSchedule({ capital: 100000, tauxAnnuel: 10, dureeAnnees: 5, differeAnnees: 2 })!;
    expect(s.annual[0].capital).toBe(0);
    expect(s.annual[1].capital).toBe(0);
    expect(s.annual[2].capital).toBeGreaterThan(0);
    expect(Math.round(s.annual[4].crd)).toBe(0);
  });
});
