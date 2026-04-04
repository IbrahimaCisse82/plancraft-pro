import { SectionConfig } from "./sectionConfig";

interface Props {
  section: SectionConfig;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
}

const NarrativeSection = ({ section, value, onChange, hint, placeholder }: Props) => {
  return (
    <div>
      {hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[320px] p-4 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-y leading-relaxed"
      />
    </div>
  );
};

export { NarrativeSection };

export default NarrativeSection;
