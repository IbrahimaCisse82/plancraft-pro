import { useMemo } from "react";
import { calculateFinancialRatios } from "@/lib/financialFormulas";
import { useI18n } from "@/contexts/I18nContext";

interface Props {
  content: Record<string, any>;
  devise: string;
}

const num = (val: string | undefined): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

const Verdict = ({ ok }: { ok: boolean }) => (
  <span className={`text-sm font-bold ${ok ? "text-green-500" : "text-red-500"}`}>
    {ok ? "✓" : "✗"}
  </span>
);

const BankerSummary = ({ content, devise }: Props) => {
  const { t } = useI18n();
  const currencySymbol = devise.includes("FCFA") ? "FCFA" : devise.includes("EUR") ? "€" : devise.includes("USD") ? "$" : devise.includes("MAD") ? "MAD" : "";

  const ratios = useMemo(() => {
    const cr = content["compte_resultat"];
    const invest = content["investissements"];
    const pf = content["plan_financement"];
    const sr = content["seuil_rentabilite"];

    if (!cr && !invest) return null;

    // Investment total
    const investRows = [
      "Terrain / Local", "Aménagement / Travaux", "Équipements / Matériel",
      "Véhicules", "Mobilier de bureau", "Matériel informatique",
      "Frais d'établissement", "Stock initial", "Trésorerie de départ", "Divers / Imprévus",
    ];
    const totalInvest = investRows.reduce((s, r) => s + num(invest?.[r]?.["Montant"]), 0);

    // Revenue & results
    const ca1 = num(cr?.["Chiffre d'affaires"]?.["Année 1"]);
    const ca3 = num(cr?.["Chiffre d'affaires"]?.["Année 3"]);
    const rn1 = num(cr?.["Résultat net"]?.["Année 1"]);
    const rn3 = num(cr?.["Résultat net"]?.["Année 3"]);

    // BFR
    const bfr = num(pf?.["Besoin en fonds de roulement (BFR)"]?.["Année 1"]);

    // Break-even
    const seuilCA = num(sr?.["Seuil de rentabilité (CA)"]?.["Année 1"]);
    const pointMort = num(sr?.["Point mort (en jours)"]?.["Année 1"]);

    // Apport personnel
    const apport = num(pf?.["Apport personnel"]?.["Année 1"]);
    const emprunt = num(pf?.["Emprunt bancaire"]?.["Année 1"]);
    const apportRatio = totalInvest > 0 ? Math.round((apport / totalInvest) * 100) : 0;

    // Debt service coverage (simplified)
    const annuite = num(content["amortissement_emprunts"]?.["Annuité totale"]?.["Année 1"]);
    const capaciteRemb = rn1 + num(cr?.["Amortissements"]?.["Année 1"]);
    const dscr = annuite > 0 ? capaciteRemb / annuite : 0;

    // Profitability
    const margeBrute1 = num(cr?.["Marge brute"]?.["Année 1"]);
    const tauxMarge = ca1 > 0 ? Math.round((margeBrute1 / ca1) * 100) : 0;
    const tauxRentabilite = ca1 > 0 ? Math.round((rn1 / ca1) * 100) : 0;

    // VAN / TRI
    const financialRatios = calculateFinancialRatios(content);

    return {
      totalInvest,
      ca1, ca3, rn1, rn3,
      bfr,
      seuilCA, pointMort,
      apport, emprunt, apportRatio,
      dscr, annuite, capaciteRemb,
      tauxMarge, tauxRentabilite,
      van: financialRatios?.van ?? NaN,
      tri: financialRatios?.tri ?? NaN,
    };
  }, [content]);

  if (!ratios || ratios.totalInvest === 0) {
    return (
      <div className="p-6 bg-card border border-border rounded-xl text-center text-muted-foreground text-sm">
        {t("banker.noData")}
      </div>
    );
  }

  const rows = [
    {
      label: t("banker.totalInvestment"),
      value: `${fmt(ratios.totalInvest)} ${currencySymbol}`,
      verdict: ratios.totalInvest > 0,
    },
    {
      label: t("banker.personalContribution"),
      value: `${fmt(ratios.apport)} ${currencySymbol} (${ratios.apportRatio}%)`,
      verdict: ratios.apportRatio >= 20,
      note: ratios.apportRatio >= 20 ? t("banker.apportOk") : t("banker.apportLow"),
    },
    {
      label: t("banker.revenueY1"),
      value: `${fmt(ratios.ca1)} ${currencySymbol}`,
      verdict: ratios.ca1 > 0,
    },
    {
      label: t("banker.revenueY3"),
      value: `${fmt(ratios.ca3)} ${currencySymbol}`,
      verdict: ratios.ca3 > ratios.ca1,
      note: ratios.ca3 > ratios.ca1 ? t("banker.growthOk") : t("banker.growthLow"),
    },
    {
      label: t("banker.netResultY1"),
      value: `${fmt(ratios.rn1)} ${currencySymbol}`,
      verdict: ratios.rn1 > 0,
    },
    {
      label: t("banker.grossMargin"),
      value: `${ratios.tauxMarge}%`,
      verdict: ratios.tauxMarge > 20,
    },
    {
      label: t("banker.profitability"),
      value: `${ratios.tauxRentabilite}%`,
      verdict: ratios.tauxRentabilite > 5,
    },
    {
      label: t("banker.breakEven"),
      value: `${fmt(ratios.seuilCA)} ${currencySymbol}`,
      verdict: ratios.ca1 > ratios.seuilCA,
      note: ratios.ca1 > ratios.seuilCA ? t("banker.breakEvenOk") : t("banker.breakEvenKo"),
    },
    {
      label: t("banker.deadPoint"),
      value: `${ratios.pointMort} ${t("banker.days")}`,
      verdict: ratios.pointMort > 0 && ratios.pointMort < 365,
    },
    {
      label: t("banker.dscr"),
      value: ratios.dscr > 0 ? ratios.dscr.toFixed(2) : "—",
      verdict: ratios.dscr >= 1.2,
      note: ratios.dscr >= 1.2 ? t("banker.dscrOk") : ratios.dscr > 0 ? t("banker.dscrLow") : undefined,
    },
    {
      label: t("banker.npv"),
      value: !isNaN(ratios.van) ? `${fmt(Math.round(ratios.van))} ${currencySymbol}` : "—",
      verdict: !isNaN(ratios.van) && ratios.van > 0,
      note: !isNaN(ratios.van) ? (ratios.van > 0 ? t("banker.npvOk") : t("banker.npvKo")) : undefined,
    },
    {
      label: t("banker.irr"),
      value: !isNaN(ratios.tri) ? `${(ratios.tri * 100).toFixed(1)}%` : "—",
      verdict: !isNaN(ratios.tri) && ratios.tri > 0.10,
      note: !isNaN(ratios.tri) ? (ratios.tri > 0.10 ? t("banker.irrOk") : t("banker.irrLow")) : undefined,
    },
  ];

  const passCount = rows.filter(r => r.verdict).length;
  const totalCount = rows.length;
  const score = Math.round((passCount / totalCount) * 100);

  return (
    <div>
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("banker.score")}</div>
        <div className={`text-3xl font-bold ${score >= 70 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
          {score}%
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {passCount}/{totalCount} {t("banker.criteria")}
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-4 py-2.5 text-xs font-bold text-secondary-foreground">{t("banker.indicator")}</th>
              <th className="text-right px-4 py-2.5 text-xs font-bold text-secondary-foreground">{t("banker.valueCol")}</th>
              <th className="text-center px-3 py-2.5 text-xs font-bold text-secondary-foreground">{t("banker.verdictCol")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} hover:bg-primary/5 transition-colors`}>
                <td className="px-4 py-2.5 text-xs font-medium text-foreground">
                  {row.label}
                  {row.note && <div className="text-[0.6rem] text-muted-foreground mt-0.5">{row.note}</div>}
                </td>
                <td className="px-4 py-2.5 text-xs text-right font-mono text-foreground">{row.value}</td>
                <td className="px-3 py-2.5 text-center"><Verdict ok={row.verdict} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-[0.65rem] text-muted-foreground leading-relaxed px-2">
        {t("banker.methodology")}
      </div>
    </div>
  );
};

export default BankerSummary;
