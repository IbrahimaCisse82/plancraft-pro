import { useMemo } from "react";
import { computeBceaoRatios, buildBankPresentation } from "@/lib/bceaoRatios";
import { useI18n } from "@/contexts/I18nContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ShieldCheck, ShieldAlert } from "lucide-react";

interface Props {
  content: Record<string, any>;
  devise: string;
  planName: string;
}

const fmt = (n: number) => n.toLocaleString("fr-FR");

const BceaoSection = ({ content, devise, planName }: Props) => {
  const { lang, t } = useI18n();
  const isFr = lang === "fr";
  const symbol = devise.includes("FCFA") ? "FCFA" : devise.includes("EUR") ? "€" : devise.includes("USD") ? "$" : "";

  const ratios = useMemo(() => computeBceaoRatios(content), [content]);
  const presentation = useMemo(() => buildBankPresentation(content), [content]);

  const conformes = ratios.filter(r => r.compliant === true).length;
  const total = ratios.filter(r => r.compliant !== null).length;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          <ShieldCheck className="w-5 h-5 text-primary" />
          {isFr ? "Conformité prudentielle UEMOA / BCEAO" : "UEMOA / BCEAO prudential compliance"}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {isFr
            ? `${conformes}/${total} ratios conformes aux seuils des banques de l'Union Monétaire Ouest-Africaine.`
            : `${conformes}/${total} ratios compliant with West African Monetary Union banking thresholds.`}
        </p>

        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-4 py-2.5 text-xs font-bold text-secondary-foreground">
                  {isFr ? "Ratio" : "Ratio"}
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-bold text-secondary-foreground">
                  {isFr ? "Valeur" : "Value"}
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-bold text-secondary-foreground">
                  {isFr ? "Seuil" : "Threshold"}
                </th>
                <th className="text-center px-3 py-2.5 text-xs font-bold text-secondary-foreground">
                  {isFr ? "Conformité" : "Compliance"}
                </th>
              </tr>
            </thead>
            <tbody>
              {ratios.map((r, i) => (
                <tr key={r.key} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"}`}>
                  <td className="px-4 py-2.5 text-xs font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      {isFr ? r.labelFr : r.labelEn}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs text-xs">
                          <div className="font-semibold mb-1">{isFr ? r.thresholdFr : r.thresholdEn}</div>
                          <div className="text-muted-foreground">{isFr ? r.helpFr : r.helpEn}</div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-right font-mono text-foreground">{r.display}</td>
                  <td className="px-4 py-2.5 text-xs text-right font-mono text-muted-foreground">{r.threshold}</td>
                  <td className="px-3 py-2.5 text-center">
                    {r.compliant === null ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : r.compliant ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> {isFr ? "Conforme" : "Compliant"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" /> {isFr ? "Non conforme" : "Non-compliant"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fiche bancaire UEMOA */}
        <div className="mt-6 p-5 bg-primary/5 border border-primary/30 rounded-xl">
          <h4 className="text-base font-bold text-foreground mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {isFr ? "Fiche de présentation bancaire UEMOA" : "UEMOA bank presentation sheet"}
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div className="flex justify-between border-b border-border/50 py-1">
              <dt className="text-muted-foreground">{isFr ? "Identification du projet" : "Project name"}</dt>
              <dd className="font-semibold text-foreground">{planName || "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1">
              <dt className="text-muted-foreground">{isFr ? "Coût total du projet" : "Total project cost"}</dt>
              <dd className="font-mono font-semibold text-foreground">{fmt(presentation.totalInvest)} {symbol}</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1">
              <dt className="text-muted-foreground">{isFr ? "Apport personnel" : "Personal contribution"}</dt>
              <dd className="font-mono font-semibold text-foreground">{fmt(presentation.apport)} {symbol} ({presentation.apportRatio}%)</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1">
              <dt className="text-muted-foreground">{isFr ? "Montant sollicité" : "Loan requested"}</dt>
              <dd className="font-mono font-semibold text-foreground">{fmt(presentation.emprunt)} {symbol}</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1">
              <dt className="text-muted-foreground">{isFr ? "Annuité de remboursement" : "Annual repayment"}</dt>
              <dd className="font-mono font-semibold text-foreground">{fmt(presentation.annuite)} {symbol}</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1">
              <dt className="text-muted-foreground">{isFr ? "Durée estimée du prêt" : "Estimated loan term"}</dt>
              <dd className="font-mono font-semibold text-foreground">{presentation.duree > 0 ? `${presentation.duree} ${isFr ? "ans" : "years"}` : "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1">
              <dt className="text-muted-foreground">EBITDA Année 1</dt>
              <dd className="font-mono font-semibold text-foreground">{fmt(presentation.ebitda)} {symbol}</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 py-1">
              <dt className="text-muted-foreground">DSCR</dt>
              <dd className="font-mono font-semibold text-foreground">{presentation.dscr !== null ? `${presentation.dscr.toFixed(2)}x` : "—"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.65rem] text-muted-foreground italic leading-relaxed">
            {isFr
              ? "Document conforme au format de présentation usuellement requis par les banques de l'UEMOA (BCEAO, banques commerciales du Sénégal, Côte d'Ivoire, Burkina Faso, Mali, Bénin, Togo, Niger, Guinée-Bissau). Joindre : pièce d'identité, statuts, RCCM, NINEA/IFU, devis et garanties proposées."
              : "Document compliant with the presentation format usually required by UEMOA banks (BCEAO, commercial banks of Senegal, Ivory Coast, Burkina Faso, Mali, Benin, Togo, Niger, Guinea-Bissau). Attach: ID, articles of association, RCCM, NINEA/IFU, quotes and proposed collateral."}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BceaoSection;
