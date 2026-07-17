import { useI18n } from "@/contexts/I18nContext";

type Pillar = "E" | "S" | "G";

interface Indicator {
  key: string;
  labelKey: string;
  pillar: Pillar;
  unitKey?: string;
}

interface SdgOption {
  code: string;
  labelKey: string;
}

const INDICATORS: Indicator[] = [
  // Environment
  { key: "co2_emissions", labelKey: "esg.ind.co2", pillar: "E", unitKey: "esg.unit.tco2" },
  { key: "energy_renewable_pct", labelKey: "esg.ind.energyRenew", pillar: "E", unitKey: "esg.unit.pct" },
  { key: "water_consumption", labelKey: "esg.ind.water", pillar: "E", unitKey: "esg.unit.m3" },
  { key: "waste_recycled_pct", labelKey: "esg.ind.wasteRecycled", pillar: "E", unitKey: "esg.unit.pct" },
  { key: "local_sourcing_pct", labelKey: "esg.ind.localSourcing", pillar: "E", unitKey: "esg.unit.pct" },
  // Social
  { key: "jobs_created", labelKey: "esg.ind.jobsCreated", pillar: "S", unitKey: "esg.unit.people" },
  { key: "jobs_women_pct", labelKey: "esg.ind.jobsWomen", pillar: "S", unitKey: "esg.unit.pct" },
  { key: "jobs_youth_pct", labelKey: "esg.ind.jobsYouth", pillar: "S", unitKey: "esg.unit.pct" },
  { key: "training_hours", labelKey: "esg.ind.training", pillar: "S", unitKey: "esg.unit.hours" },
  { key: "workplace_accidents", labelKey: "esg.ind.accidents", pillar: "S", unitKey: "esg.unit.count" },
  { key: "beneficiaries", labelKey: "esg.ind.beneficiaries", pillar: "S", unitKey: "esg.unit.people" },
  // Governance
  { key: "women_board_pct", labelKey: "esg.ind.womenBoard", pillar: "G", unitKey: "esg.unit.pct" },
  { key: "independent_directors", labelKey: "esg.ind.independent", pillar: "G", unitKey: "esg.unit.count" },
  { key: "audit_frequency", labelKey: "esg.ind.audit", pillar: "G" },
  { key: "compliance_policy", labelKey: "esg.ind.compliance", pillar: "G" },
  { key: "whistleblowing", labelKey: "esg.ind.whistleblowing", pillar: "G" },
];

const SDGS: SdgOption[] = [
  { code: "1", labelKey: "esg.sdg.1" },
  { code: "2", labelKey: "esg.sdg.2" },
  { code: "3", labelKey: "esg.sdg.3" },
  { code: "4", labelKey: "esg.sdg.4" },
  { code: "5", labelKey: "esg.sdg.5" },
  { code: "6", labelKey: "esg.sdg.6" },
  { code: "7", labelKey: "esg.sdg.7" },
  { code: "8", labelKey: "esg.sdg.8" },
  { code: "9", labelKey: "esg.sdg.9" },
  { code: "10", labelKey: "esg.sdg.10" },
  { code: "11", labelKey: "esg.sdg.11" },
  { code: "12", labelKey: "esg.sdg.12" },
  { code: "13", labelKey: "esg.sdg.13" },
  { code: "15", labelKey: "esg.sdg.15" },
  { code: "16", labelKey: "esg.sdg.16" },
  { code: "17", labelKey: "esg.sdg.17" },
];

interface EsgValue {
  indicators?: Record<string, { baseline?: string; target_y1?: string; target_y3?: string; notes?: string }>;
  sdgs?: string[];
  narrative?: {
    environment?: string;
    social?: string;
    governance?: string;
    impact_thesis?: string;
  };
}

interface Props {
  value: EsgValue;
  onChange: (val: EsgValue) => void;
  hint?: string;
}

const PILLAR_META: Record<Pillar, { colorKey: string; icon: string; labelKey: string; ring: string }> = {
  E: { colorKey: "bg-emerald-500/10 border-emerald-500/30", icon: "🌱", labelKey: "esg.pillar.E", ring: "text-emerald-500" },
  S: { colorKey: "bg-blue-500/10 border-blue-500/30", icon: "🤝", labelKey: "esg.pillar.S", ring: "text-blue-500" },
  G: { colorKey: "bg-primary/10 border-primary/30", icon: "⚖️", labelKey: "esg.pillar.G", ring: "text-primary" },
};

const EsgSection = ({ value, onChange, hint }: Props) => {
  const { t } = useI18n();
  const v: EsgValue = value || {};
  const indicators = v.indicators || {};
  const sdgs = v.sdgs || [];
  const narrative = v.narrative || {};

  const update = (patch: Partial<EsgValue>) => onChange({ ...v, ...patch });

  const updateIndicator = (key: string, field: string, val: string) => {
    update({
      indicators: {
        ...indicators,
        [key]: { ...(indicators[key] || {}), [field]: val },
      },
    });
  };

  const toggleSdg = (code: string) => {
    const has = sdgs.includes(code);
    update({ sdgs: has ? sdgs.filter((c) => c !== code) : [...sdgs, code] });
  };

  const updateNarrative = (field: keyof NonNullable<EsgValue["narrative"]>, val: string) => {
    update({ narrative: { ...narrative, [field]: val } });
  };

  const pillars: Pillar[] = ["E", "S", "G"];

  // Score de complétude
  const filledIndicators = Object.values(indicators).filter(
    (i) => i.baseline || i.target_y1 || i.target_y3
  ).length;
  const completion = Math.round((filledIndicators / INDICATORS.length) * 100);

  return (
    <div className="space-y-6">
      {hint && (
        <div className="px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}

      {/* Impact thesis */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-primary">
          🎯 {t("esg.impactThesis")}
        </label>
        <textarea
          value={narrative.impact_thesis || ""}
          onChange={(e) => updateNarrative("impact_thesis", e.target.value)}
          placeholder={t("esg.impactThesis.placeholder")}
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Completion */}
      <div className="flex items-center justify-between p-3 bg-secondary/40 border border-border rounded-lg">
        <span className="text-xs font-semibold text-muted-foreground">{t("esg.completion")}</span>
        <div className="flex items-center gap-3">
          <div className="w-40 h-2 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} />
          </div>
          <span className="text-sm font-bold text-primary tabular-nums">{completion}%</span>
        </div>
      </div>

      {/* Pillars with indicators */}
      {pillars.map((pillar) => {
        const meta = PILLAR_META[pillar];
        const pillarInds = INDICATORS.filter((i) => i.pillar === pillar);
        return (
          <div key={pillar} className={`rounded-xl border-2 p-4 ${meta.colorKey}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{meta.icon}</span>
              <h3 className="font-display text-lg font-bold">{t(meta.labelKey)}</h3>
            </div>

            {/* Narrative for this pillar */}
            <textarea
              value={
                pillar === "E"
                  ? narrative.environment || ""
                  : pillar === "S"
                  ? narrative.social || ""
                  : narrative.governance || ""
              }
              onChange={(e) =>
                updateNarrative(
                  pillar === "E" ? "environment" : pillar === "S" ? "social" : "governance",
                  e.target.value
                )
              }
              placeholder={t(`esg.narrative.${pillar}.placeholder`)}
              rows={2}
              className="w-full mb-3 px-3 py-2 bg-background/60 border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-primary transition-colors"
            />

            {/* Indicators table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left font-semibold py-2 pr-2 w-1/3">{t("esg.col.indicator")}</th>
                    <th className="text-right font-semibold py-2 px-2">{t("esg.col.baseline")}</th>
                    <th className="text-right font-semibold py-2 px-2">{t("esg.col.y1")}</th>
                    <th className="text-right font-semibold py-2 px-2">{t("esg.col.y3")}</th>
                    <th className="text-left font-semibold py-2 pl-2">{t("esg.col.notes")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pillarInds.map((ind) => {
                    const row = indicators[ind.key] || {};
                    const unit = ind.unitKey ? t(ind.unitKey) : "";
                    return (
                      <tr key={ind.key} className="border-t border-border/40">
                        <td className="py-2 pr-2 align-top">
                          <div className="font-medium">{t(ind.labelKey)}</div>
                          {unit && <div className="text-muted-foreground text-[10px]">{unit}</div>}
                        </td>
                        <td className="py-1 px-1">
                          <input
                            type="text"
                            value={row.baseline || ""}
                            onChange={(e) => updateIndicator(ind.key, "baseline", e.target.value)}
                            className="w-full px-2 py-1 bg-background border border-border rounded text-right text-xs tabular-nums focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-1 px-1">
                          <input
                            type="text"
                            value={row.target_y1 || ""}
                            onChange={(e) => updateIndicator(ind.key, "target_y1", e.target.value)}
                            className="w-full px-2 py-1 bg-background border border-border rounded text-right text-xs tabular-nums focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-1 px-1">
                          <input
                            type="text"
                            value={row.target_y3 || ""}
                            onChange={(e) => updateIndicator(ind.key, "target_y3", e.target.value)}
                            className="w-full px-2 py-1 bg-background border border-border rounded text-right text-xs tabular-nums focus:outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-1 pl-1">
                          <input
                            type="text"
                            value={row.notes || ""}
                            onChange={(e) => updateIndicator(ind.key, "notes", e.target.value)}
                            className="w-full px-2 py-1 bg-background border border-border rounded text-xs focus:outline-none focus:border-primary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* SDGs */}
      <div className="p-4 bg-card border border-border rounded-lg">
        <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-primary">
          🌐 {t("esg.sdgs.title")}
        </label>
        <p className="text-xs text-muted-foreground mb-3">{t("esg.sdgs.hint")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {SDGS.map((sdg) => {
            const active = sdgs.includes(sdg.code);
            return (
              <button
                key={sdg.code}
                onClick={() => toggleSdg(sdg.code)}
                className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                  active
                    ? "bg-primary/15 border-primary text-foreground"
                    : "bg-background border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <div className="font-bold">ODD {sdg.code}</div>
                <div className="text-[10px] leading-tight mt-0.5">{t(sdg.labelKey)}</div>
              </button>
            );
          })}
        </div>
        {sdgs.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{sdgs.length}</span> {t("esg.sdgs.selected")}
          </div>
        )}
      </div>
    </div>
  );
};

export default EsgSection;
