/**
 * Auto-calculation formulas for financial tables.
 * Each section defines computed rows as functions of other rows.
 * Includes VAN (NPV), TRI (IRR) and cross-table linking.
 */

type RowData = Record<string, Record<string, string>>;

const num = (val: string | undefined): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

const sumRows = (data: RowData, rows: string[], col: string): number =>
  rows.reduce((acc, row) => acc + num(data[row]?.[col]), 0);

type FormulaMap = Record<string, Record<string, (data: RowData, col: string, allContent?: Record<string, any>) => number>>;

// ── VAN (NPV) Calculation ──
export const calculateNPV = (cashFlows: number[], discountRate: number): number => {
  if (discountRate <= -1) return NaN;
  return cashFlows.reduce((npv, cf, t) => {
    if (t === 0) return npv + cf; // Initial investment (negative)
    return npv + cf / Math.pow(1 + discountRate, t);
  }, 0);
};

// ── TRI (IRR) Calculation using Newton-Raphson ──
export const calculateIRR = (cashFlows: number[], maxIterations = 100, tolerance = 1e-7): number => {
  // Check if there are sign changes (required for IRR to exist)
  const hasPositive = cashFlows.some(cf => cf > 0);
  const hasNegative = cashFlows.some(cf => cf < 0);
  if (!hasPositive || !hasNegative) return NaN;

  let rate = 0.1; // Initial guess 10%
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0; // derivative
    
    for (let t = 0; t < cashFlows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / factor;
      if (t > 0) {
        dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
      }
    }
    
    if (Math.abs(dnpv) < 1e-15) break;
    
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tolerance) return newRate;
    rate = newRate;
    
    // Prevent divergence
    if (rate < -0.99) rate = -0.5;
    if (rate > 10) rate = 5;
  }
  
  return rate;
};

export const FORMULAS: FormulaMap = {
  // ── Plan d'investissement ──
  investissements: {},

  // ── Compte de résultat prévisionnel ──
  // Cross-table: "Charges de personnel" auto-fed from charges_personnel section
  compte_resultat: {
    "Marge brute": (d, c) =>
      num(d["Chiffre d'affaires"]?.[c]) - num(d["Achats de marchandises"]?.[c]),
    "Total charges": (d, c) =>
      sumRows(d, [
        "Charges de personnel",
        "Loyer",
        "Électricité / Eau",
        "Transport",
        "Télécommunications",
        "Assurances",
        "Publicité / Marketing",
        "Frais divers",
      ], c),
    "Résultat d'exploitation": (d, c) => {
      const marge = num(d["Chiffre d'affaires"]?.[c]) - num(d["Achats de marchandises"]?.[c]);
      const charges = sumRows(d, [
        "Charges de personnel",
        "Loyer",
        "Électricité / Eau",
        "Transport",
        "Télécommunications",
        "Assurances",
        "Publicité / Marketing",
        "Frais divers",
      ], c);
      return marge - charges - num(d["Amortissements"]?.[c]);
    },
    "Résultat net": (d, c) => {
      const marge = num(d["Chiffre d'affaires"]?.[c]) - num(d["Achats de marchandises"]?.[c]);
      const charges = sumRows(d, [
        "Charges de personnel",
        "Loyer",
        "Électricité / Eau",
        "Transport",
        "Télécommunications",
        "Assurances",
        "Publicité / Marketing",
        "Frais divers",
      ], c);
      const resExpl = marge - charges - num(d["Amortissements"]?.[c]);
      return resExpl - num(d["Charges financières"]?.[c]);
    },
  },

  // ── Plan de trésorerie ──
  tresorerie: {
    "Total encaissements": (d, c) =>
      sumRows(d, ["Encaissements ventes", "Apports / Emprunts", "Autres encaissements"], c),
    "Total décaissements": (d, c) =>
      sumRows(d, ["Achats", "Salaires", "Charges sociales", "Loyer", "Autres décaissements"], c),
    "Solde mensuel": (d, c) => {
      const enc = sumRows(d, ["Encaissements ventes", "Apports / Emprunts", "Autres encaissements"], c);
      const dec = sumRows(d, ["Achats", "Salaires", "Charges sociales", "Loyer", "Autres décaissements"], c);
      return enc - dec;
    },
  },

  // ── Plan de financement ──
  plan_financement: {
    "Total emplois": (d, c) =>
      sumRows(d, ["Investissements", "Besoin en fonds de roulement (BFR)", "Remboursement d'emprunts"], c),
    "Total ressources": (d, c) =>
      sumRows(d, ["Apport personnel", "Apport associés", "Emprunt bancaire", "Subventions", "Capacité d'autofinancement"], c),
    "Écart (Ressources - Emplois)": (d, c) => {
      const emplois = sumRows(d, ["Investissements", "Besoin en fonds de roulement (BFR)", "Remboursement d'emprunts"], c);
      const ressources = sumRows(d, ["Apport personnel", "Apport associés", "Emprunt bancaire", "Subventions", "Capacité d'autofinancement"], c);
      return ressources - emplois;
    },
  },

  // ── Bilan prévisionnel ──
  bilan_previsionnel: {
    "Total actif immobilisé": (d, c) =>
      sumRows(d, ["Immobilisations incorporelles", "Immobilisations corporelles", "Immobilisations financières"], c),
    "Total actif circulant": (d, c) =>
      sumRows(d, ["Stocks", "Créances clients", "Trésorerie (banque + caisse)"], c),
    "TOTAL ACTIF": (d, c) => {
      const immo = sumRows(d, ["Immobilisations incorporelles", "Immobilisations corporelles", "Immobilisations financières"], c);
      const circ = sumRows(d, ["Stocks", "Créances clients", "Trésorerie (banque + caisse)"], c);
      return immo + circ;
    },
    "Total capitaux propres": (d, c) =>
      sumRows(d, ["Capital social", "Réserves", "Résultat net"], c),
    "Total dettes": (d, c) =>
      sumRows(d, ["Emprunts bancaires", "Dettes fournisseurs", "Dettes fiscales et sociales"], c),
    "TOTAL PASSIF": (d, c) => {
      const cp = sumRows(d, ["Capital social", "Réserves", "Résultat net"], c);
      const dettes = sumRows(d, ["Emprunts bancaires", "Dettes fournisseurs", "Dettes fiscales et sociales"], c);
      return cp + dettes;
    },
  },

  // ── Seuil de rentabilité ──
  seuil_rentabilite: {
    "Marge sur coûts variables": (d, c) =>
      num(d["Chiffre d'affaires"]?.[c]) - num(d["Charges variables"]?.[c]),
    "Taux de marge (%)": (d, c) => {
      const ca = num(d["Chiffre d'affaires"]?.[c]);
      if (ca === 0) return 0;
      const mcv = ca - num(d["Charges variables"]?.[c]);
      return Math.round((mcv / ca) * 100);
    },
    "Seuil de rentabilité (CA)": (d, c) => {
      const ca = num(d["Chiffre d'affaires"]?.[c]);
      if (ca === 0) return 0;
      const mcv = ca - num(d["Charges variables"]?.[c]);
      const tauxMarge = mcv / ca;
      if (tauxMarge === 0) return 0;
      return Math.round(num(d["Charges fixes"]?.[c]) / tauxMarge);
    },
    "Point mort (en jours)": (d, c) => {
      const ca = num(d["Chiffre d'affaires"]?.[c]);
      if (ca === 0) return 0;
      const mcv = ca - num(d["Charges variables"]?.[c]);
      const tauxMarge = mcv / ca;
      if (tauxMarge === 0) return 0;
      const seuil = num(d["Charges fixes"]?.[c]) / tauxMarge;
      return Math.round((seuil / ca) * 365);
    },
  },

  // ── Charges du personnel ──
  charges_personnel: {
    "Total salaires bruts": (d, c) =>
      sumRows(d, [
        "Gérant / Directeur",
        "Responsable commercial",
        "Responsable technique",
        "Comptable",
        "Employé 1",
        "Employé 2",
        "Employé 3",
        "Employé 4",
      ], c),
    "Total charges du personnel": (d, c) => {
      const bruts = sumRows(d, [
        "Gérant / Directeur",
        "Responsable commercial",
        "Responsable technique",
        "Comptable",
        "Employé 1",
        "Employé 2",
        "Employé 3",
        "Employé 4",
      ], c);
      return bruts + num(d["Charges sociales patronales"]?.[c]);
    },
  },

  // ── Amortissement des emprunts ──
  amortissement_emprunts: {
    "Annuité totale": (d, c) =>
      num(d["Part capital"]?.[c]) + num(d["Part intérêts"]?.[c]),
  },
};

/**
 * Apply cross-table linking before formulas.
 * - charges_personnel.Total charges du personnel → compte_resultat.Charges de personnel
 * - investissements total → plan_financement.Investissements
 */
export const applyCrossTableLinks = (
  allContent: Record<string, any>
): Record<string, any> => {
  const result = { ...allContent };

  // Link: charges_personnel → compte_resultat
  const chargesPerso = result["charges_personnel"];
  if (chargesPerso && typeof chargesPerso === "object") {
    const cr = { ...(result["compte_resultat"] || {}) };
    const yearCols = ["Année 1", "Année 2", "Année 3"];
    const totalRow = chargesPerso["Total charges du personnel"];
    if (totalRow) {
      if (!cr["Charges de personnel"]) cr["Charges de personnel"] = {};
      cr["Charges de personnel"] = { ...cr["Charges de personnel"] };
      for (const col of yearCols) {
        if (totalRow[col]) {
          cr["Charges de personnel"][col] = totalRow[col];
        }
      }
      result["compte_resultat"] = cr;
    }
  }

  // Link: investissements total → plan_financement.Investissements
  const invest = result["investissements"];
  if (invest && typeof invest === "object") {
    const pf = { ...(result["plan_financement"] || {}) };
    // Sum all investment rows from "Montant" column
    const investRows = [
      "Terrain / Local", "Aménagement / Travaux", "Équipements / Matériel",
      "Véhicules", "Mobilier de bureau", "Matériel informatique",
      "Frais d'établissement", "Stock initial", "Trésorerie de départ", "Divers / Imprévus",
    ];
    const totalInvest = investRows.reduce((s, r) => s + num(invest[r]?.["Montant"]), 0);
    if (totalInvest > 0) {
      if (!pf["Investissements"]) pf["Investissements"] = {};
      pf["Investissements"] = { ...pf["Investissements"], "Année 1": String(totalInvest) };
      result["plan_financement"] = pf;
    }
  }

  return result;
};

/**
 * Calculate VAN and TRI from the compte_resultat data.
 * Returns { van, tri, cashFlows } or null if insufficient data.
 */
export const calculateFinancialRatios = (
  allContent: Record<string, any>,
  discountRate = 0.10
): { van: number; tri: number; cashFlows: number[] } | null => {
  const cr = allContent["compte_resultat"];
  const invest = allContent["investissements"];
  if (!cr || !invest) return null;

  // Initial investment (negative)
  const investRows = [
    "Terrain / Local", "Aménagement / Travaux", "Équipements / Matériel",
    "Véhicules", "Mobilier de bureau", "Matériel informatique",
    "Frais d'établissement", "Stock initial", "Trésorerie de départ", "Divers / Imprévus",
  ];
  const totalInvest = investRows.reduce((s, r) => s + num(invest[r]?.["Montant"]), 0);
  if (totalInvest === 0) return null;

  const years = ["Année 1", "Année 2", "Année 3"];
  const netResults = years.map(y => num(cr["Résultat net"]?.[y]));
  const amortissements = years.map(y => num(cr["Amortissements"]?.[y]));

  // Cash flows = Résultat net + Amortissements (simplified)
  const cashFlows = [-totalInvest, ...netResults.map((nr, i) => nr + amortissements[i])];

  const van = calculateNPV(cashFlows, discountRate);
  const tri = calculateIRR(cashFlows);

  return { van, tri, cashFlows };
};

/**
 * Apply formulas to compute calculated cells.
 * Returns a new data object with computed values injected.
 */
export const applyFormulas = (
  sectionId: string,
  data: RowData,
  columns: string[]
): RowData => {
  const formulas = FORMULAS[sectionId];
  if (!formulas && sectionId !== "tresorerie") return data;

  const result = { ...data };

  if (formulas) {
    for (const [row, fn] of Object.entries(formulas)) {
      if (!result[row]) result[row] = {};
      const rowData = { ...result[row] };
      for (const col of columns) {
        rowData[col] = String(fn(result, col));
      }
      result[row] = rowData;
    }
  }

  // Special: Solde cumulé in trésorerie (depends on previous column)
  if (sectionId === "tresorerie") {
    if (!result["Solde cumulé"]) result["Solde cumulé"] = {};
    const cumRow = { ...result["Solde cumulé"] };
    let runningTotal = 0;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (i === 0) {
        runningTotal = num(result["Solde initial"]?.[col]);
      }
      const soldeMensuel = num(result["Solde mensuel"]?.[col]);
      runningTotal += soldeMensuel;
      cumRow[col] = String(runningTotal);
    }
    result["Solde cumulé"] = cumRow;
  }

  return result;
};

/**
 * Check if a row in a section is auto-computed.
 */
export const isComputedRow = (sectionId: string, row: string): boolean => {
  if (sectionId === "tresorerie" && row === "Solde cumulé") return true;
  return !!(FORMULAS[sectionId]?.[row]);
};
