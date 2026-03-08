import { BP_SECTIONS, SectionConfig } from "@/components/editor/sectionConfig";
import { useI18n } from "@/contexts/I18nContext";
import NarrativeSection from "@/components/editor/NarrativeSection";
import FinancialSection from "@/components/editor/FinancialSection";
import SwotSection from "@/components/editor/SwotSection";
import AIAssistantPanel from "@/components/editor/AIAssistantPanel";
import type { BusinessPlan, BPContent } from "@/types/businessPlan";
import { toast } from "sonner";

interface Props {
  plan: BusinessPlan;
  content: BPContent;
  activeSection: string;
  onSectionChange: (sectionId: string, value: any) => void;
  onNavigate: (sectionId: string) => void;
  onSave: () => void;
}

const EditorMainContent = ({ plan, content, activeSection, onSectionChange, onNavigate, onSave }: Props) => {
  const { t } = useI18n();
  const currentSection = BP_SECTIONS.find((s) => s.id === activeSection)!;
  const currentIdx = BP_SECTIONS.findIndex((s) => s.id === activeSection);

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case "narrative":
        return (
          <NarrativeSection
            section={section}
            value={content[section.id] || ""}
            onChange={(val) => onSectionChange(section.id, val)}
          />
        );
      case "financial":
        return (
          <FinancialSection
            section={section}
            value={content[section.id] || {}}
            onChange={(val) => onSectionChange(section.id, val)}
            devise={plan.devise}
          />
        );
      case "swot":
        return (
          <SwotSection
            section={section}
            value={content[section.id] || { forces: "", faiblesses: "", opportunites: "", menaces: "" }}
            onChange={(val) => onSectionChange(section.id, val)}
          />
        );
    }
  };

  const sectionTypeLabel = currentSection.type === "financial"
    ? t("editor.financial")
    : currentSection.type === "swot"
    ? "Matrice SWOT"
    : t("editor.narrative");

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{currentSection.icon}</span>
              <h2 className="font-display text-xl sm:text-2xl font-bold">{currentSection.title}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="uppercase tracking-wider font-bold">
                {sectionTypeLabel}
              </span>
              <span>·</span>
              <span>{t("editor.sectionOf", { current: String(currentIdx + 1), total: String(BP_SECTIONS.length) })}</span>
            </div>
          </div>

          {renderSection(currentSection)}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {currentIdx > 0 ? (
              <button
                onClick={() => onNavigate(BP_SECTIONS[currentIdx - 1].id)}
                className="px-3 sm:px-4 py-2 bg-secondary border border-border rounded-lg text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
              >
                ← <span className="hidden sm:inline">{BP_SECTIONS[currentIdx - 1].title}</span>
                <span className="sm:hidden">{t("editor.previous")}</span>
              </button>
            ) : <div />}

            {currentIdx < BP_SECTIONS.length - 1 ? (
              <button
                onClick={() => onNavigate(BP_SECTIONS[currentIdx + 1].id)}
                className="px-3 sm:px-4 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
              >
                <span className="hidden sm:inline">{BP_SECTIONS[currentIdx + 1].title}</span>
                <span className="sm:hidden">{t("editor.next")}</span> →
              </button>
            ) : (
              <button
                onClick={() => { onSave(); toast.success(t("editor.saved") + " !"); }}
                className="px-3 sm:px-4 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
              >
                {t("editor.finalize")}
              </button>
            )}
          </div>
        </div>
      </main>

      <AIAssistantPanel
        key={currentSection.id}
        sectionTitle={currentSection.title}
        sectionHint={currentSection.hint}
        currentContent={
          currentSection.type === "narrative"
            ? content[currentSection.id] || ""
            : JSON.stringify(content[currentSection.id] || {}, null, 2)
        }
        planName={plan.name}
        secteur={plan.secteur || undefined}
        devise={plan.devise}
        sectionType={currentSection.type}
        onInsertText={
          currentSection.type === "narrative"
            ? (text) => onSectionChange(currentSection.id, (content[currentSection.id] || "") + "\n\n" + text)
            : undefined
        }
      />
    </>
  );
};

export default EditorMainContent;
