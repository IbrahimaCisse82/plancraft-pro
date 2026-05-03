/**
 * Ratios prudentiels BCEAO / UEMOA pour la synthèse bancaire.
 * Seuils basés sur le dispositif prudentiel applicable aux établissements
 * de crédit de l'UMOA (instruction BCEAO n°026-11-2016 et suivantes)
 * adaptés à l'analyse d'un dossier de financement TPE/PME.
 */

const num = (val: string | undefined): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

const sumRows = (data: any, rows: string[], col: string): number =>
  rows.reduce((s, r) => s + num(data?.[r]?.[col]), 0);

export interface BceaoRatio {
  key: string;
  labelFr: string;
  labelEn: string;
  value: number | null;
  display: string;
  threshold: string;
  thresholdFr: string;
  thresholdEn: string;
  compliant: boolean | null;
  helpFr: string;
  helpEn: string;
}

export const computeBceaoRatios = (content: Record<string, any>): BceaoRatio[] => {
  const bilan = content?.["bilan_previsionnel"];
  const cr = content?.["compte_resultat"];
  const pf = content?.["plan_financement"];
  const amo = content?.["amortissement_emprunts"];
  const invest = content?.["investissements"];

  const col = "Année 1";

  // Total actif & fonds propres
  const totalActif =
    num(bilan?.["TOTAL ACTIF"]?.[col]) ||
    sumRows(bilan, [
      "Immobilisations incorporelles", "Immobilisations corporelles", "Immobilisations financières",
      "Stocks", "Créances clients", "Trésorerie (banque + caisse)",
    ], col);

  const fondsPropres =
    num(bilan?.["Total capitaux propres"]?.[col]) ||
    sumRows(bilan, ["Capital social", "Réserves", "Résultat net"], col);

  const dettesTotales =
    num(bilan?.["Total dettes"]?.[col]) ||
    sumRows(bilan, ["Emprunts bancaires", "Dettes fournisseurs", "Dettes fiscales et sociales"], col);

  const actifCT = sumRows(bilan, ["Stocks", "Créances clients", "Trésorerie (banque + caisse)"], col);
  const passifCT = sumRows(bilan, ["Dettes fournisseurs", "Dettes fiscales et sociales"], col);

  // EBITDA = Résultat d'exploitation + Amortissements
  const resExpl = num(cr?.["Résultat d'exploitation"]?.[col]);
  const amort = num(cr?.["Amortissements"]?.[col]);
  const ebitda = resExpl + amort;

  const annuite = num(amo?.["Annuité totale"]?.[col]);

  // Investissement total & cash flow annuel moyen
  const investRows = [
    "Terrain / Local", "Aménagement / Travaux", "Équipements / Matériel",
    "Véhicules", "Mobilier de bureau", "Matériel informatique",
    "Frais d'établissement", "Stock initial", "Trésorerie de départ", "Divers / Imprévus",
  ];
  const totalInvest = investRows.reduce((s, r) => s + num(invest?.[r]?.["Montant"]), 0);

  const years = ["Année 1", "Année 2", "Année 3"];
  const cfMoyen = years.reduce((s, y) => s + num(cr?.["Résultat net"]?.[y]) + num(cr?.["Amortissements"]?.[y]), 0) / years.length;

  // Ratios
  const solva = totalActif > 0 ? (fondsPropres / totalActif) * 100 : null;
  const liqui = passifCT > 0 ? (actifCT / passifCT) * 100 : null;
  const endett = fondsPropres > 0 ? (dettesTotales / fondsPropres) * 100 : null;
  const dscr = annuite > 0 ? ebitda / annuite : null;
  const payback = cfMoyen > 0 ? totalInvest / cfMoyen : null;

  return [
    {
      key: "solva",
      labelFr: "Ratio de solvabilité",
      labelEn: "Solvency ratio",
      value: solva,
      display: solva !== null ? `${solva.toFixed(1)} %` : "—",
      threshold: "≥ 8 %",
      thresholdFr: "Seuil BCEAO : ≥ 8 %",
      thresholdEn: "BCEAO threshold: ≥ 8%",
      compliant: solva !== null ? solva >= 8 : null,
      helpFr: "Fonds propres / Total actif. Mesure la capacité à absorber les pertes.",
      helpEn: "Equity / Total assets. Measures loss-absorption capacity.",
    },
    {
      key: "liqui",
      labelFr: "Ratio de liquidité",
      labelEn: "Liquidity ratio",
      value: liqui,
      display: liqui !== null ? `${liqui.toFixed(0)} %` : "—",
      threshold: "≥ 100 %",
      thresholdFr: "Seuil BCEAO : ≥ 100 %",
      thresholdEn: "BCEAO threshold: ≥ 100%",
      compliant: liqui !== null ? liqui >= 100 : null,
      helpFr: "Actif court terme / Passif court terme. Capacité à honorer les engagements à 1 an.",
      helpEn: "Current assets / Current liabilities. Ability to meet 1-year obligations.",
    },
    {
      key: "endett",
      labelFr: "Ratio d'endettement",
      labelEn: "Debt-to-equity ratio",
      value: endett,
      display: endett !== null ? `${endett.toFixed(0)} %` : "—",
      threshold: "≤ 200 %",
      thresholdFr: "Seuil prudentiel : ≤ 200 %",
      thresholdEn: "Prudential threshold: ≤ 200%",
      compliant: endett !== null ? endett <= 200 : null,
      helpFr: "Dettes totales / Fonds propres. Mesure le levier financier.",
      helpEn: "Total debt / Equity. Measures financial leverage.",
    },
    {
      key: "dscr",
      labelFr: "Couverture du service de la dette",
      labelEn: "Debt service coverage",
      value: dscr,
      display: dscr !== null ? `${dscr.toFixed(2)}x` : "—",
      threshold: "≥ 1.3",
      thresholdFr: "Seuil banques UEMOA : ≥ 1.3",
      thresholdEn: "UEMOA banks threshold: ≥ 1.3",
      compliant: dscr !== null ? dscr >= 1.3 : null,
      helpFr: "EBITDA / Annuités. Capacité à rembourser le crédit.",
      helpEn: "EBITDA / Annuities. Ability to repay the loan.",
    },
    {
      key: "payback",
      labelFr: "Délai de récupération du capital",
      labelEn: "Payback period",
      value: payback,
      display: payback !== null && isFinite(payback) ? `${payback.toFixed(1)} ans` : "—",
      threshold: "≤ 5 ans",
      thresholdFr: "Recommandé : ≤ 5 ans",
      thresholdEn: "Recommended: ≤ 5 years",
      compliant: payback !== null && isFinite(payback) ? payback <= 5 : null,
      helpFr: "Investissement total / Cash flow annuel moyen.",
      helpEn: "Total investment / Average annual cash flow.",
    },
  ];
};

export interface BankPresentation {
  totalInvest: number;
  apport: number;
  emprunt: number;
  apportRatio: number;
  duree: number;
  annuite: number;
  ebitda: number;
  dscr: number | null;
}

export const buildBankPresentation = (content: Record<string, any>): BankPresentation => {
  const invest = content?.["investissements"];
  const pf = content?.["plan_financement"];
  const cr = content?.["compte_resultat"];
  const amo = content?.["amortissement_emprunts"];

  const investRows = [
    "Terrain / Local", "Aménagement / Travaux", "Équipements / Matériel",
    "Véhicules", "Mobilier de bureau", "Matériel informatique",
    "Frais d'établissement", "Stock initial", "Trésorerie de départ", "Divers / Imprévus",
  ];
  const totalInvest = investRows.reduce((s, r) => s + num(invest?.[r]?.["Montant"]), 0);
  const apport = num(pf?.["Apport personnel"]?.["Année 1"]) + num(pf?.["Apport associés"]?.["Année 1"]);
  const emprunt = num(pf?.["Emprunt bancaire"]?.["Année 1"]);
  const apportRatio = totalInvest > 0 ? Math.round((apport / totalInvest) * 100) : 0;
  const annuite = num(amo?.["Annuité totale"]?.["Année 1"]);
  const ebitda = num(cr?.["Résultat d'exploitation"]?.["Année 1"]) + num(cr?.["Amortissements"]?.["Année 1"]);
  const dscr = annuite > 0 ? ebitda / annuite : null;
  const duree = annuite > 0 ? Math.ceil(emprunt / annuite) : 0;

  return { totalInvest, apport, emprunt, apportRatio, duree, annuite, ebitda, dscr };
};
