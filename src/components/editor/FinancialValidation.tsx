import { useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Props {
  content: Record<string, any>;
}

type Severity = "error" | "warning" | "info";

interface ValidationAlert {
  severity: Severity;
  messageKey: string;
  fallback: string;
  /** Pre-formatted message (with dynamic values) shown as-is when set. */
  raw?: string;
}

const num = (val: string | undefined): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

const FinancialValidation = ({ content }: Props) => {
  const { t } = useI18n();

  const alerts = useMemo(() => {
    const result: ValidationAlert[] = [];
    const cr = content["compte_resultat"];
    const invest = content["investissements"];
    const pf = content["plan_financement"];
    const sr = content["seuil_rentabilite"];
    const treso = content["tresorerie"];

    // Check if any financial data exists
    const hasData = cr || invest || pf;
    if (!hasData) return result;

    // Revenue checks
    const ca1 = num(cr?.["Chiffre d'affaires"]?.["Année 1"]);
    const ca2 = num(cr?.["Chiffre d'affaires"]?.["Année 2"]);
    const ca3 = num(cr?.["Chiffre d'affaires"]?.["Année 3"]);

    if (cr && ca1 === 0) {
      result.push({ severity: "error", messageKey: "validation.zeroRevenue", fallback: "Le chiffre d'affaires Année 1 est à 0" });
    }
    if (ca2 > 0 && ca3 > 0 && ca3 < ca2 * 0.5) {
      result.push({ severity: "warning", messageKey: "validation.revenueDrop", fallback: "Le CA baisse fortement entre Année 2 et 3" });
    }

    // Expense checks
    const totalCharges = num(cr?.["Total charges"]?.["Année 1"]);
    const margeBrute = num(cr?.["Marge brute"]?.["Année 1"]);
    if (cr && ca1 > 0 && totalCharges > margeBrute) {
      result.push({ severity: "warning", messageKey: "validation.chargesExceedMargin", fallback: "Les charges dépassent la marge brute en Année 1" });
    }

    // Net result checks
    const rn1 = num(cr?.["Résultat net"]?.["Année 1"]);
    const rn2 = num(cr?.["Résultat net"]?.["Année 2"]);
    const rn3 = num(cr?.["Résultat net"]?.["Année 3"]);
    if (cr && rn1 < 0 && rn2 < 0 && rn3 < 0) {
      result.push({ severity: "error", messageKey: "validation.alwaysLoss", fallback: "Le résultat net est négatif sur les 3 années" });
    } else if (cr && rn1 < 0) {
      result.push({ severity: "info", messageKey: "validation.lossY1", fallback: "Résultat net négatif en Année 1 (fréquent au démarrage)" });
    }

    // Investment checks
    const investRows = [
      "Terrain / Local", "Aménagement / Travaux", "Équipements / Matériel",
      "Véhicules", "Mobilier de bureau", "Matériel informatique",
      "Frais d'établissement", "Stock initial", "Trésorerie de départ", "Divers / Imprévus",
    ];
    const totalInvest = investRows.reduce((s, r) => s + num(invest?.[r]?.["Montant"]), 0);
    if (invest && totalInvest === 0) {
      result.push({ severity: "warning", messageKey: "validation.noInvestment", fallback: "Aucun investissement renseigné" });
    }

    // Financing checks
    const apport = num(pf?.["Apport personnel"]?.["Année 1"]);
    const emprunt = num(pf?.["Emprunt bancaire"]?.["Année 1"]);
    if (pf && totalInvest > 0 && apport + emprunt === 0) {
      result.push({ severity: "error", messageKey: "validation.noFinancing", fallback: "Aucune source de financement renseignée" });
    }
    if (totalInvest > 0 && apport > 0 && (apport / totalInvest) < 0.1) {
      result.push({ severity: "warning", messageKey: "validation.lowContribution", fallback: "Apport personnel < 10% de l'investissement — risque de refus bancaire" });
    } else if (totalInvest > 0 && apport > 0 && (apport / totalInvest) < 0.2) {
      result.push({ severity: "warning", messageKey: "validation.contributionUnder20", fallback: "Apport personnel < 20% de l'investissement — seuil généralement exigé par les banques" });
    }

    // Blocking: plan de financement equilibrium (ressources ≥ emplois)
    if (pf) {
      for (const y of ["Année 1", "Année 2", "Année 3"]) {
        const emplois = num(pf["Total emplois"]?.[y]);
        const ressources = num(pf["Total ressources"]?.[y]);
        if (emplois > 0 && ressources > 0 && ressources < emplois) {
          const ecart = emplois - ressources;
          result.push({
            severity: "error",
            messageKey: "validation.unbalancedFinancingPlan",
            fallback: `Plan de financement déséquilibré en ${y} : ressources insuffisantes de ${ecart.toLocaleString("fr-FR")}`,
            raw: `Plan de financement déséquilibré en ${y} : ressources insuffisantes de ${ecart.toLocaleString("fr-FR")}`,
          });
          break;
        }
      }
    }

    // Warning: marge brute négative en Année 1
    if (cr && ca1 > 0 && margeBrute < 0) {
      result.push({ severity: "warning", messageKey: "validation.negativeGrossMargin", fallback: "Marge brute négative en Année 1 — le coût d'achat dépasse le chiffre d'affaires" });
    }

    // Info: croissance annuelle du CA > 100 %
    if ((ca1 > 0 && ca2 > ca1 * 2) || (ca2 > 0 && ca3 > ca2 * 2)) {
      result.push({ severity: "info", messageKey: "validation.highGrowth", fallback: "Croissance du CA supérieure à 100% d'une année sur l'autre — justifiez les hypothèses" });
    }

    // BFR check
    const bfr = num(pf?.["Besoin en fonds de roulement (BFR)"]?.["Année 1"]);
    if (pf && bfr < 0) {
      result.push({ severity: "warning", messageKey: "validation.negativeBfr", fallback: "Le BFR est négatif — vérifiez vos hypothèses" });
    }

    // Break-even check
    const seuilCA = num(sr?.["Seuil de rentabilité (CA)"]?.["Année 1"]);
    if (sr && ca1 > 0 && seuilCA > ca1 * 2) {
      result.push({ severity: "error", messageKey: "validation.breakEvenTooHigh", fallback: "Le seuil de rentabilité est plus de 2× le CA prévu" });
    }

    // Cash flow checks
    if (treso) {
      const months = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"];
      const negativeMonths = months.filter(m => num(treso["Solde cumulé"]?.[m]) < 0);
      if (negativeMonths.length >= 6) {
        result.push({ severity: "error", messageKey: "validation.cashNegative6m", fallback: "Trésorerie négative pendant 6+ mois — risque de cessation de paiement" });
      } else if (negativeMonths.length >= 1) {
        result.push({
          severity: "error",
          messageKey: "validation.cashNegativeMonth",
          fallback: `Trésorerie cumulée négative (${negativeMonths.join(", ")}) — à corriger avant présentation bancaire`,
          raw: `Trésorerie cumulée négative (${negativeMonths.join(", ")}) — à corriger avant présentation bancaire`,
        });
      }
    }

    // Balance sheet check
    const bilan = content["bilan_previsionnel"];
    if (bilan) {
      for (const y of ["Année 1", "Année 2", "Année 3"]) {
        const actif = num(bilan["TOTAL ACTIF"]?.[y]);
        const passif = num(bilan["TOTAL PASSIF"]?.[y]);
        if (actif > 0 && passif > 0 && Math.abs(actif - passif) > 1) {
          result.push({ severity: "error", messageKey: "validation.unbalancedSheet", fallback: `Bilan non équilibré en ${y} (Actif ≠ Passif)` });
          break;
        }
      }
    }

    // ===== Coherence checks between CR / Seuil / BFR détaillé / Trésorerie =====
    const sr_ = sr;
    const bfrD = content["bfr_detaille"];
    const tol = (a: number, b: number, pct = 0.02) =>
      Math.abs(a - b) > Math.max(1, Math.max(Math.abs(a), Math.abs(b)) * pct);

    // CA CR vs CA Seuil
    if (cr && sr_) {
      const caSeuil = num(sr_["Chiffre d'affaires"]?.["Année 1"]);
      if (ca1 > 0 && caSeuil > 0 && tol(ca1, caSeuil)) {
        result.push({ severity: "warning", messageKey: "validation.coherenceCaSeuil", fallback: "CA CR ≠ CA Seuil" });
      }
    }

    // CA CR vs CA BFR détaillé
    if (cr && bfrD) {
      const caBfr = num(bfrD["Chiffre d'affaires HT"]?.["Année 1"]);
      if (ca1 > 0 && caBfr > 0 && tol(ca1, caBfr)) {
        result.push({ severity: "warning", messageKey: "validation.coherenceCaBfr", fallback: "CA CR ≠ CA BFR" });
      }
    }

    // Achats CR vs Achats BFR détaillé
    if (cr && bfrD) {
      const achatsCR = num(cr["Achats de marchandises"]?.["Année 1"]);
      const achatsBfr = num(bfrD["Achats HT"]?.["Année 1"]);
      if (achatsCR > 0 && achatsBfr > 0 && tol(achatsCR, achatsBfr)) {
        result.push({ severity: "warning", messageKey: "validation.coherenceAchatsBfr", fallback: "Achats CR ≠ Achats BFR" });
      }
    }

    // Charges variables (Seuil) vs Achats (CR) — proxy
    if (cr && sr_) {
      const cv = num(sr_["Charges variables"]?.["Année 1"]);
      const achatsCR = num(cr["Achats de marchandises"]?.["Année 1"]);
      if (cv > 0 && achatsCR > 0 && tol(cv, achatsCR, 0.05)) {
        result.push({ severity: "info", messageKey: "validation.coherenceChargesVarSeuil", fallback: "CV Seuil ≠ Achats CR" });
      }
    }

    // Trésorerie mensuelle vs CR annuel
    if (cr && treso) {
      const months = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"];
      const sumEnc = months.reduce((s, m) => s + num(treso["Encaissements ventes"]?.[m]), 0);
      const sumAchats = months.reduce((s, m) => s + num(treso["Achats"]?.[m]), 0);
      if (ca1 > 0 && sumEnc > 0 && tol(ca1, sumEnc, 0.05)) {
        result.push({ severity: "warning", messageKey: "validation.coherenceTresoCa", fallback: "Σ encaissements ≠ CA annuel" });
      }
      const achatsCR = num(cr["Achats de marchandises"]?.["Année 1"]);
      if (achatsCR > 0 && sumAchats > 0 && tol(achatsCR, sumAchats, 0.05)) {
        result.push({ severity: "warning", messageKey: "validation.coherenceTresoAchats", fallback: "Σ achats mensuels ≠ Achats annuels" });
      }
    }

    // BFR détaillé vs Plan de financement
    if (bfrD && pf) {
      const bfrTotal = num(bfrD["BFR total"]?.["Année 1"]);
      const bfrPlan = num(pf["Besoin en fonds de roulement (BFR)"]?.["Année 1"]);
      if (bfrTotal > 0 && bfrPlan > 0 && tol(bfrTotal, bfrPlan, 0.05)) {
        result.push({ severity: "warning", messageKey: "validation.coherenceBfrPlan", fallback: "BFR détaillé ≠ BFR plan financement" });
      }
    }

    // Positive signal
    if (result.length === 0 && ca1 > 0 && rn1 > 0) {
      result.push({ severity: "info", messageKey: "validation.allGood", fallback: "Tous les indicateurs financiers sont cohérents ✓" });
    }

    return result;
  }, [content]);

  if (alerts.length === 0) return null;

  const icons = {
    error: <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />,
    info: <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />,
  };

  const bgColors = {
    error: "bg-destructive/5 border-destructive/20",
    warning: "bg-yellow-500/5 border-yellow-500/20",
    info: "bg-blue-500/5 border-blue-500/20",
  };

  const errors = alerts.filter(a => a.severity === "error");
  const warnings = alerts.filter(a => a.severity === "warning");
  const infos = alerts.filter(a => a.severity === "info");
  const sorted = [...errors, ...warnings, ...infos];

  return (
    <div className="mb-4 space-y-1.5">
      <div className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <CheckCircle className="w-3 h-3" />
        {t("validation.title")}
      </div>
      {sorted.map((alert, i) => (
        <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${bgColors[alert.severity]}`}>
          {icons[alert.severity]}
          <span className="text-foreground leading-relaxed">{t(alert.messageKey)}</span>
        </div>
      ))}
    </div>
  );
};

export default FinancialValidation;
