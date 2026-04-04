import { SectionConfig } from "./sectionConfig";
import { useI18n } from "@/contexts/I18nContext";

interface SwotData {
  forces: string;
  faiblesses: string;
  opportunites: string;
  menaces: string;
}

interface Props {
  section: SectionConfig;
  value: SwotData;
  onChange: (value: SwotData) => void;
  hint?: string;
}

const SwotSection = ({ section, value, onChange, hint }: Props) => {
  const { t } = useI18n();

  const quadrants = [
    { key: "forces" as const, label: t("swot.strengths"), icon: "💪", color: "border-green-500/30 bg-green-500/5", placeholder: t("swot.strengthsPlaceholder") },
    { key: "faiblesses" as const, label: t("swot.weaknesses"), icon: "⚡", color: "border-orange-500/30 bg-orange-500/5", placeholder: t("swot.weaknessesPlaceholder") },
    { key: "opportunites" as const, label: t("swot.opportunities"), icon: "🌟", color: "border-blue-500/30 bg-blue-500/5", placeholder: t("swot.opportunitiesPlaceholder") },
    { key: "menaces" as const, label: t("swot.threats"), icon: "🔥", color: "border-red-500/30 bg-red-500/5", placeholder: t("swot.threatsPlaceholder") },
  ];

  return (
    <div>
      {hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((q) => (
          <div key={q.key} className={`border rounded-lg p-4 ${q.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{q.icon}</span>
              <h4 className="text-sm font-bold text-foreground">{q.label}</h4>
            </div>
            <textarea
              value={value?.[q.key] || ""}
              onChange={(e) => onChange({ ...value, [q.key]: e.target.value })}
              placeholder={q.placeholder}
              className="w-full min-h-[120px] p-3 bg-transparent border border-border/30 rounded-md text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-y leading-relaxed"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwotSection;
