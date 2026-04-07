/**
 * Translation map for financial table row labels.
 * Data keys remain in French for formula consistency.
 * Display labels are translated at render time.
 */

const ROW_LABELS: Record<string, Record<string, string>> = {
  // Investissements
  "Terrain / Local": { fr: "Terrain / Local", en: "Land / Premises" },
  "Aménagement / Travaux": { fr: "Aménagement / Travaux", en: "Renovation / Works" },
  "Équipements / Matériel": { fr: "Équipements / Matériel", en: "Equipment / Materials" },
  "Véhicules": { fr: "Véhicules", en: "Vehicles" },
  "Mobilier de bureau": { fr: "Mobilier de bureau", en: "Office Furniture" },
  "Matériel informatique": { fr: "Matériel informatique", en: "IT Equipment" },
  "Frais d'établissement": { fr: "Frais d'établissement", en: "Setup Costs" },
  "Stock initial": { fr: "Stock initial", en: "Initial Stock" },
  "Trésorerie de départ": { fr: "Trésorerie de départ", en: "Starting Cash" },
  "Divers / Imprévus": { fr: "Divers / Imprévus", en: "Miscellaneous / Contingency" },

  // Plan de financement
  "--- EMPLOIS ---": { fr: "--- EMPLOIS ---", en: "--- USES ---" },
  "Investissements": { fr: "Investissements", en: "Investments" },
  "Besoin en fonds de roulement (BFR)": { fr: "Besoin en fonds de roulement (BFR)", en: "Working Capital Requirement (WCR)" },
  "Remboursement d'emprunts": { fr: "Remboursement d'emprunts", en: "Loan Repayments" },
  "Total emplois": { fr: "Total emplois", en: "Total Uses" },
  "--- RESSOURCES ---": { fr: "--- RESSOURCES ---", en: "--- SOURCES ---" },
  "Apport personnel": { fr: "Apport personnel", en: "Personal Contribution" },
  "Apport associés": { fr: "Apport associés", en: "Partners' Contribution" },
  "Emprunt bancaire": { fr: "Emprunt bancaire", en: "Bank Loan" },
  "Subventions": { fr: "Subventions", en: "Grants / Subsidies" },
  "Capacité d'autofinancement": { fr: "Capacité d'autofinancement", en: "Self-Financing Capacity" },
  "Total ressources": { fr: "Total ressources", en: "Total Sources" },
  "--- SOLDE ---": { fr: "--- SOLDE ---", en: "--- BALANCE ---" },
  "Écart (Ressources - Emplois)": { fr: "Écart (Ressources - Emplois)", en: "Gap (Sources - Uses)" },

  // Bilan prévisionnel
  "--- ACTIF IMMOBILISÉ ---": { fr: "--- ACTIF IMMOBILISÉ ---", en: "--- FIXED ASSETS ---" },
  "Immobilisations incorporelles": { fr: "Immobilisations incorporelles", en: "Intangible Assets" },
  "Immobilisations corporelles": { fr: "Immobilisations corporelles", en: "Tangible Assets" },
  "Immobilisations financières": { fr: "Immobilisations financières", en: "Financial Assets" },
  "Total actif immobilisé": { fr: "Total actif immobilisé", en: "Total Fixed Assets" },
  "--- ACTIF CIRCULANT ---": { fr: "--- ACTIF CIRCULANT ---", en: "--- CURRENT ASSETS ---" },
  "Stocks": { fr: "Stocks", en: "Inventory" },
  "Créances clients": { fr: "Créances clients", en: "Accounts Receivable" },
  "Trésorerie (banque + caisse)": { fr: "Trésorerie (banque + caisse)", en: "Cash (Bank + Register)" },
  "Total actif circulant": { fr: "Total actif circulant", en: "Total Current Assets" },
  "TOTAL ACTIF": { fr: "TOTAL ACTIF", en: "TOTAL ASSETS" },
  "--- CAPITAUX PROPRES ---": { fr: "--- CAPITAUX PROPRES ---", en: "--- SHAREHOLDERS' EQUITY ---" },
  "Capital social": { fr: "Capital social", en: "Share Capital" },
  "Réserves": { fr: "Réserves", en: "Reserves" },
  "Résultat net": { fr: "Résultat net", en: "Net Income" },
  "Total capitaux propres": { fr: "Total capitaux propres", en: "Total Equity" },
  "--- DETTES ---": { fr: "--- DETTES ---", en: "--- LIABILITIES ---" },
  "Emprunts bancaires": { fr: "Emprunts bancaires", en: "Bank Loans" },
  "Dettes fournisseurs": { fr: "Dettes fournisseurs", en: "Accounts Payable" },
  "Dettes fiscales et sociales": { fr: "Dettes fiscales et sociales", en: "Tax & Social Liabilities" },
  "Total dettes": { fr: "Total dettes", en: "Total Liabilities" },
  "TOTAL PASSIF": { fr: "TOTAL PASSIF", en: "TOTAL LIABILITIES & EQUITY" },

  // Seuil de rentabilité
  "Chiffre d'affaires": { fr: "Chiffre d'affaires", en: "Revenue" },
  "Charges variables": { fr: "Charges variables", en: "Variable Costs" },
  "Marge sur coûts variables": { fr: "Marge sur coûts variables", en: "Contribution Margin" },
  "Taux de marge (%)": { fr: "Taux de marge (%)", en: "Margin Rate (%)" },
  "Charges fixes": { fr: "Charges fixes", en: "Fixed Costs" },
  "Seuil de rentabilité (CA)": { fr: "Seuil de rentabilité (CA)", en: "Break-Even (Revenue)" },
  "Point mort (en jours)": { fr: "Point mort (en jours)", en: "Dead Point (in days)" },

  // Amortissement emprunts
  "Capital emprunté": { fr: "Capital emprunté", en: "Borrowed Capital" },
  "Taux d'intérêt (%)": { fr: "Taux d'intérêt (%)", en: "Interest Rate (%)" },
  "Durée (années)": { fr: "Durée (années)", en: "Duration (years)" },
  "Annuité totale": { fr: "Annuité totale", en: "Total Annuity" },
  "Part capital": { fr: "Part capital", en: "Principal Portion" },
  "Part intérêts": { fr: "Part intérêts", en: "Interest Portion" },
  "Capital restant dû": { fr: "Capital restant dû", en: "Outstanding Balance" },

  // Charges du personnel
  "Gérant / Directeur": { fr: "Gérant / Directeur", en: "Manager / Director" },
  "Responsable commercial": { fr: "Responsable commercial", en: "Sales Manager" },
  "Responsable technique": { fr: "Responsable technique", en: "Technical Manager" },
  "Comptable": { fr: "Comptable", en: "Accountant" },
  "Employé 1": { fr: "Employé 1", en: "Employee 1" },
  "Employé 2": { fr: "Employé 2", en: "Employee 2" },
  "Employé 3": { fr: "Employé 3", en: "Employee 3" },
  "Employé 4": { fr: "Employé 4", en: "Employee 4" },
  "Total salaires bruts": { fr: "Total salaires bruts", en: "Total Gross Salaries" },
  "Charges sociales patronales": { fr: "Charges sociales patronales", en: "Employer Social Charges" },
  "Total charges du personnel": { fr: "Total charges du personnel", en: "Total Personnel Costs" },

  // Compte de résultat
  "Achats de marchandises": { fr: "Achats de marchandises", en: "Cost of Goods Sold" },
  "Marge brute": { fr: "Marge brute", en: "Gross Margin" },
  "Charges de personnel": { fr: "Charges de personnel", en: "Personnel Costs" },
  "Loyer": { fr: "Loyer", en: "Rent" },
  "Électricité / Eau": { fr: "Électricité / Eau", en: "Electricity / Water" },
  "Transport": { fr: "Transport", en: "Transport" },
  "Télécommunications": { fr: "Télécommunications", en: "Telecommunications" },
  "Assurances": { fr: "Assurances", en: "Insurance" },
  "Publicité / Marketing": { fr: "Publicité / Marketing", en: "Advertising / Marketing" },
  "Frais divers": { fr: "Frais divers", en: "Miscellaneous Expenses" },
  "Total charges": { fr: "Total charges", en: "Total Expenses" },
  "Amortissements": { fr: "Amortissements", en: "Depreciation" },
  "Résultat d'exploitation": { fr: "Résultat d'exploitation", en: "Operating Income" },
  "Charges financières": { fr: "Charges financières", en: "Financial Charges" },

  // Trésorerie
  "Solde initial": { fr: "Solde initial", en: "Opening Balance" },
  "Encaissements ventes": { fr: "Encaissements ventes", en: "Sales Receipts" },
  "Apports / Emprunts": { fr: "Apports / Emprunts", en: "Contributions / Loans" },
  "Autres encaissements": { fr: "Autres encaissements", en: "Other Receipts" },
  "Total encaissements": { fr: "Total encaissements", en: "Total Receipts" },
  "Achats": { fr: "Achats", en: "Purchases" },
  "Salaires": { fr: "Salaires", en: "Salaries" },
  "Charges sociales": { fr: "Charges sociales", en: "Social Charges" },
  "Autres décaissements": { fr: "Autres décaissements", en: "Other Disbursements" },
  "Total décaissements": { fr: "Total décaissements", en: "Total Disbursements" },
  "Solde mensuel": { fr: "Solde mensuel", en: "Monthly Balance" },
  "Solde cumulé": { fr: "Solde cumulé", en: "Cumulative Balance" },

  // Columns
  "Montant": { fr: "Montant", en: "Amount" },
  "Année 1": { fr: "Année 1", en: "Year 1" },
  "Année 2": { fr: "Année 2", en: "Year 2" },
  "Année 3": { fr: "Année 3", en: "Year 3" },
  "Année 4": { fr: "Année 4", en: "Year 4" },
  "Année 5": { fr: "Année 5", en: "Year 5" },
  "Effectif": { fr: "Effectif", en: "Headcount" },
  "Salaire mensuel": { fr: "Salaire mensuel", en: "Monthly Salary" },
};

export type Lang = "fr" | "en";

export const translateRowLabel = (key: string, lang: Lang): string => {
  return ROW_LABELS[key]?.[lang] || key;
};

export const translateColumnLabel = (key: string, lang: Lang): string => {
  return ROW_LABELS[key]?.[lang] || key;
};
