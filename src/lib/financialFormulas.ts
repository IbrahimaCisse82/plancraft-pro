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

  // ── BFR détaillé (méthode normative en jours) ──
  bfr_detaille: {
    "Stocks (montant)": (d, c) => {
      const achats = num(d["Achats HT"]?.[c]);
      const jours = num(d["Délai stocks (jours)"]?.[c]);
      return Math.round((achats * jours) / 360);
    },
    "Créances clients (montant)": (d, c) => {
      const ca = num(d["Chiffre d'affaires HT"]?.[c]);
      const jours = num(d["Délai clients (jours)"]?.[c]);
      // Hypothèse TTC = HT * 1.18 (TVA UEMOA standard)
      return Math.round((ca * 1.18 * jours) / 360);
    },
    "Dettes fournisseurs (montant)": (d, c) => {
      const achats = num(d["Achats HT"]?.[c]);
      const jours = num(d["Délai fournisseurs (jours)"]?.[c]);
      return Math.round((achats * 1.18 * jours) / 360);
    },
    "BFR total": (d, c) => {
      const achats = num(d["Achats HT"]?.[c]);
      const ca = num(d["Chiffre d'affaires HT"]?.[c]);
      const stocks = Math.round((achats * num(d["Délai stocks (jours)"]?.[c])) / 360);
      const creances = Math.round((ca * 1.18 * num(d["Délai clients (jours)"]?.[c])) / 360);
      const dettes = Math.round((achats * 1.18 * num(d["Délai fournisseurs (jours)"]?.[c])) / 360);
      return stocks + creances - dettes;
    },
    "BFR en jours de CA": (d, c) => {
      const ca = num(d["Chiffre d'affaires HT"]?.[c]);
      if (ca === 0) return 0;
      const achats = num(d["Achats HT"]?.[c]);
      const stocks = Math.round((achats * num(d["Délai stocks (jours)"]?.[c])) / 360);
      const creances = Math.round((ca * 1.18 * num(d["Délai clients (jours)"]?.[c])) / 360);
      const dettes = Math.round((achats * 1.18 * num(d["Délai fournisseurs (jours)"]?.[c])) / 360);
      const bfr = stocks + creances - dettes;
      return Math.round((bfr / ca) * 360);
    },
    "Variation du BFR": (d, c) => {
      const years = ["Année 1", "Année 2", "Année 3"];
      const idx = years.indexOf(c);
      const computeBfr = (col: string) => {
        const achats = num(d["Achats HT"]?.[col]);
        const ca = num(d["Chiffre d'affaires HT"]?.[col]);
        const stocks = Math.round((achats * num(d["Délai stocks (jours)"]?.[col])) / 360);
        const creances = Math.round((ca * 1.18 * num(d["Délai clients (jours)"]?.[col])) / 360);
        const dettes = Math.round((achats * 1.18 * num(d["Délai fournisseurs (jours)"]?.[col])) / 360);
        return stocks + creances - dettes;
      };
      const current = computeBfr(c);
      if (idx <= 0) return current; // Année 1 = BFR initial
      return current - computeBfr(years[idx - 1]);
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

  const yearCols = ["Année 1", "Année 2", "Année 3"];
  const cr = result["compte_resultat"];

  // Link: compte_resultat → bfr_detaille (auto-feed CA + Achats)
  if (cr && typeof cr === "object") {
    const bfr = { ...(result["bfr_detaille"] || {}) };
    const caRow = { ...(bfr["Chiffre d'affaires HT"] || {}) };
    const achatsRow = { ...(bfr["Achats HT"] || {}) };
    let changed = false;
    for (const col of yearCols) {
      const ca = cr["Chiffre d'affaires"]?.[col];
      const achats = cr["Achats de marchandises"]?.[col];
      if (ca && !caRow[col]) { caRow[col] = ca; changed = true; }
      if (achats && !achatsRow[col]) { achatsRow[col] = achats; changed = true; }
    }
    if (changed) {
      bfr["Chiffre d'affaires HT"] = caRow;
      bfr["Achats HT"] = achatsRow;
      result["bfr_detaille"] = bfr;
    }
  }

  // Link: compte_resultat → seuil_rentabilite (auto-feed CA + Charges variables = Achats)
  if (cr && typeof cr === "object") {
    const sr = { ...(result["seuil_rentabilite"] || {}) };
    const caRow = { ...(sr["Chiffre d'affaires"] || {}) };
    const cvRow = { ...(sr["Charges variables"] || {}) };
    let changed = false;
    for (const col of yearCols) {
      const ca = cr["Chiffre d'affaires"]?.[col];
      const achats = cr["Achats de marchandises"]?.[col];
      if (ca && !caRow[col]) { caRow[col] = ca; changed = true; }
      if (achats && !cvRow[col]) { cvRow[col] = achats; changed = true; }
    }
    if (changed) {
      sr["Chiffre d'affaires"] = caRow;
      sr["Charges variables"] = cvRow;
      result["seuil_rentabilite"] = sr;
    }
  }

  // Link: bfr_detaille.BFR total Année 1 → plan_financement.BFR
  const bfrSec = result["bfr_detaille"];
  if (bfrSec && typeof bfrSec === "object") {
    // Recompute BFR Année 1 inline
    const achats = num(bfrSec["Achats HT"]?.["Année 1"]);
    const ca = num(bfrSec["Chiffre d'affaires HT"]?.["Année 1"]);
    const ds = num(bfrSec["Délai stocks (jours)"]?.["Année 1"]);
    const dc = num(bfrSec["Délai clients (jours)"]?.["Année 1"]);
    const df = num(bfrSec["Délai fournisseurs (jours)"]?.["Année 1"]);
    if (ca > 0 || achats > 0) {
      const stocks = Math.round((achats * ds) / 360);
      const creances = Math.round((ca * 1.18 * dc) / 360);
      const dettes = Math.round((achats * 1.18 * df) / 360);
      const bfrTotal = stocks + creances - dettes;
      if (bfrTotal !== 0) {
        const pf = { ...(result["plan_financement"] || {}) };
        const row = { ...(pf["Besoin en fonds de roulement (BFR)"] || {}) };
        row["Année 1"] = String(bfrTotal);
        pf["Besoin en fonds de roulement (BFR)"] = row;
        result["plan_financement"] = pf;
      }
    }
  }

  // Link: compte_resultat annuel → tresorerie M1-M12 (seed mensuel uniquement si vide)
  if (cr && typeof cr === "object") {
    const tres = { ...(result["tresorerie"] || {}) };
    const months = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"];
    const caAn1 = num(cr["Chiffre d'affaires"]?.["Année 1"]);
    const achatsAn1 = num(cr["Achats de marchandises"]?.["Année 1"]);
    const salairesAn1 = num(cr["Charges de personnel"]?.["Année 1"]);
    const loyerAn1 = num(cr["Loyer"]?.["Année 1"]);

    const seedRow = (rowName: string, monthlyVal: number) => {
      if (monthlyVal === 0) return;
      const existing = { ...(tres[rowName] || {}) };
      let touched = false;
      for (const m of months) {
        if (!existing[m]) { existing[m] = String(monthlyVal); touched = true; }
      }
      if (touched) tres[rowName] = existing;
    };
    seedRow("Encaissements ventes", Math.round((caAn1 * 1.18) / 12));
    seedRow("Achats", Math.round((achatsAn1 * 1.18) / 12));
    seedRow("Salaires", Math.round(salairesAn1 / 12));
    seedRow("Loyer", Math.round(loyerAn1 / 12));
    if (Object.keys(tres).length > 0) result["tresorerie"] = tres;
  }

  // Link: amortissement_emprunts → compte_resultat (intérêts) & plan_financement (capital)
  const loan = result["amortissement_emprunts"];
  if (loan && typeof loan === "object") {
    const interets = loan["Part intérêts"];
    const capital = loan["Part capital"];
    if (interets) {
      const cr2 = { ...(result["compte_resultat"] || {}) };
      const row = { ...(cr2["Charges financières"] || {}) };
      let touched = false;
      for (const col of yearCols) {
        if (interets[col]) { row[col] = interets[col]; touched = true; }
      }
      if (touched) {
        cr2["Charges financières"] = row;
        result["compte_resultat"] = cr2;
      }
    }
    if (capital) {
      const pf = { ...(result["plan_financement"] || {}) };
      const row = { ...(pf["Remboursement d'emprunts"] || {}) };
      let touched = false;
      for (const col of yearCols) {
        if (capital[col]) { row[col] = capital[col]; touched = true; }
      }
      if (touched) {
        pf["Remboursement d'emprunts"] = row;
        result["plan_financement"] = pf;
      }
    }
  }

  // Link: compte_resultat (résultat net + amortissements) → CAF → plan_financement
  const crFinal = result["compte_resultat"];
  if (crFinal && typeof crFinal === "object") {
    const pf = { ...(result["plan_financement"] || {}) };
    const cafRow = { ...(pf["Capacité d'autofinancement"] || {}) };
    let touched = false;
    for (const col of yearCols) {
      const rn = crFinal["Résultat net"]?.[col];
      const am = crFinal["Amortissements"]?.[col];
      if (rn !== undefined || am !== undefined) {
        const caf = num(rn) + num(am);
        if (caf !== 0) { cafRow[col] = String(caf); touched = true; }
      }
    }
    if (touched) {
      pf["Capacité d'autofinancement"] = cafRow;
      result["plan_financement"] = pf;
    }

    // Link: compte_resultat (résultat net) → bilan_previsionnel (capitaux propres)
    const bilan = { ...(result["bilan_previsionnel"] || {}) };
    const rnRow = { ...(bilan["Résultat net"] || {}) };
    let bTouched = false;
    for (const col of yearCols) {
      const rn = crFinal["Résultat net"]?.[col];
      if (rn !== undefined && rn !== "") { rnRow[col] = String(num(rn)); bTouched = true; }
    }
    if (bTouched) {
      bilan["Résultat net"] = rnRow;
      result["bilan_previsionnel"] = bilan;
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
