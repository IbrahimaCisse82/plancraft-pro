/**
 * Auto-calculation formulas for financial tables.
 * Each section defines computed rows as functions of other rows.
 */

type RowData = Record<string, Record<string, string>>;

const num = (val: string | undefined): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

const sumRows = (data: RowData, rows: string[], col: string): number =>
  rows.reduce((acc, row) => acc + num(data[row]?.[col]), 0);

type FormulaMap = Record<string, Record<string, (data: RowData, col: string) => number>>;

export const FORMULAS: FormulaMap = {
  // ── Plan d'investissement ──
  investissements: {
    // No computed rows currently — user fills all manually
  },

  // ── Compte de résultat prévisionnel ──
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
 * Apply formulas to compute calculated cells.
 * Returns a new data object with computed values injected.
 */
export const applyFormulas = (
  sectionId: string,
  data: RowData,
  columns: string[]
): RowData => {
  const formulas = FORMULAS[sectionId];
  if (!formulas) return data;

  const result = { ...data };

  for (const [row, fn] of Object.entries(formulas)) {
    if (!result[row]) result[row] = {};
    const rowData = { ...result[row] };
    for (const col of columns) {
      rowData[col] = String(fn(result, col));
    }
    result[row] = rowData;
  }

  return result;
};

/**
 * Check if a row in a section is auto-computed.
 */
export const isComputedRow = (sectionId: string, row: string): boolean => {
  return !!(FORMULAS[sectionId]?.[row]);
};
