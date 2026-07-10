import { useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { computeMarketSizing, DEFAULT_INPUTS, type MarketSizingInputs } from "@/lib/marketSizing";

interface Props {
  value: Partial<MarketSizingInputs> & { notes?: string };
  onChange: (val: any) => void;
  devise: string;
  hint?: string;
}

const fmt = (n: number, devise: string) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)} M ${devise}`
    : `${Math.round(n).toLocaleString("fr-FR")} ${devise}`;

const MarketSizingSection = ({ value, onChange, devise, hint }: Props) => {
  const { t } = useI18n();

  const inputs: MarketSizingInputs = {
    population: Number(value.population ?? DEFAULT_INPUTS.population) || 0,
    panierMoyen: Number(value.panierMoyen ?? DEFAULT_INPUTS.panierMoyen) || 0,
    samPct: Number(value.samPct ?? DEFAULT_INPUTS.samPct) || 0,
    somPct: Number(value.somPct ?? DEFAULT_INPUTS.somPct) || 0,
    croissance: Number(value.croissance ?? DEFAULT_INPUTS.croissance) || 0,
  };

  const result = useMemo(() => computeMarketSizing(inputs), [inputs]);

  const update = (field: keyof MarketSizingInputs, v: string) => {
    onChange({ ...value, [field]: v === "" ? "" : Number(v) });
  };

  const maxWidth = result.tam || 1;
  const tiers = [
    { key: "tam", label: t("market.tam"), value: result.tam, sub: t("market.tam.sub"), color: "bg-primary/80" },
    { key: "sam", label: t("market.sam"), value: result.sam, sub: t("market.sam.sub"), color: "bg-primary" },
    { key: "som", label: t("market.som"), value: result.som, sub: t("market.som.sub"), color: "bg-accent-foreground" },
  ];

  return (
    <div>
      {hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { field: "population" as const, label: t("market.population"), unit: t("market.unit.people"), step: "1" },
          { field: "panierMoyen" as const, label: t("market.panier"), unit: devise, step: "100" },
          { field: "samPct" as const, label: t("market.samPct"), unit: "%", step: "1" },
          { field: "somPct" as const, label: t("market.somPct"), unit: "%", step: "0.5" },
          { field: "croissance" as const, label: t("market.growth"), unit: "%", step: "0.5" },
        ].map(({ field, label, unit, step }) => (
          <label key={field} className="block p-3 bg-card border border-border rounded-lg">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            <input
              type="number"
              step={step}
              value={value[field] ?? ""}
              onChange={(e) => update(field, e.target.value)}
              className="w-full mt-1 px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-sm"
            />
            <span className="text-[0.6rem] text-muted-foreground">{unit}</span>
          </label>
        ))}
      </div>

      {/* Funnel visualization */}
      <div className="mb-6 p-4 bg-card border border-border rounded-lg">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          {t("market.funnel")}
        </div>
        <div className="space-y-3">
          {tiers.map(({ key, label, value: v, sub, color }) => {
            const width = maxWidth > 0 ? Math.max(15, (v / maxWidth) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-16 text-xs font-bold uppercase text-right text-muted-foreground shrink-0">
                  {label}
                </div>
                <div className="flex-1 relative h-12 bg-secondary/40 rounded overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${color} flex items-center justify-between px-3 transition-all`}
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-[0.7rem] font-semibold text-primary-foreground truncate">{sub}</span>
                    <span className="text-xs font-bold font-mono text-primary-foreground">
                      {fmt(v, devise)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[0.7rem]">
          <div className="p-2 bg-secondary/50 border border-border rounded">
            <div className="text-muted-foreground">{t("market.penetration")}</div>
            <div className="font-bold font-mono text-foreground">
              {(result.penetration * 100).toFixed(2)}%
            </div>
          </div>
          <div className="p-2 bg-secondary/50 border border-border rounded">
            <div className="text-muted-foreground">{t("market.captureSam")}</div>
            <div className="font-bold font-mono text-foreground">
              {(result.captureSam * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Projection */}
      <div className="mb-6 overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-3 py-2.5 text-xs font-bold border-b border-border">
                {t("market.horizon")}
              </th>
              {result.projection.map((p) => (
                <th key={p.year} className="text-right px-3 py-2.5 text-xs font-bold border-b border-border">
                  {t("loan.year")} {p.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "TAM", get: (p: any) => p.tam },
              { label: "SAM", get: (p: any) => p.sam },
              { label: "SOM", get: (p: any) => p.som },
            ].map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                <td className="px-3 py-2 text-xs font-medium border-b border-border/50">{row.label}</td>
                {result.projection.map((p) => (
                  <td key={p.year} className="px-3 py-2 text-xs text-right font-mono border-b border-border/50">
                    {fmt(row.get(p), devise)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes / sources */}
      <label className="block mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("market.sources")}
        </span>
        <textarea
          value={value.notes ?? ""}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder={t("market.sourcesPlaceholder")}
          rows={4}
          className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground text-sm leading-relaxed"
        />
      </label>

      <div className="text-[0.65rem] text-muted-foreground leading-relaxed">
        {t("market.footnote")}
      </div>
    </div>
  );
};

export default MarketSizingSection;
