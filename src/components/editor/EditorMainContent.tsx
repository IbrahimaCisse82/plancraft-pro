import { BP_SECTIONS, resolveSection } from "@/components/editor/sectionConfig";
import { useI18n } from "@/contexts/I18nContext";
import NarrativeSection from "@/components/editor/NarrativeSection";
import FinancialSection from "@/components/editor/FinancialSection";
import SwotSection from "@/components/editor/SwotSection";
import MatrixSection from "@/components/editor/MatrixSection";
import SensitivitySection from "@/components/editor/SensitivitySection";
import MarketSizingSection from "@/components/editor/MarketSizingSection";
import LoanScheduleSection from "@/components/editor/LoanScheduleSection";
import KpiDashboardSection from "@/components/editor/KpiDashboardSection";
import TeamCvSection from "@/components/editor/TeamCvSection";
import BankerSummary from "@/components/editor/BankerSummary";
import FinancialValidation from "@/components/editor/FinancialValidation";
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
  const resolved = resolveSection(currentSection, t);

  const renderSection = () => {
    switch (currentSection.type) {
      case "narrative":
        return (
          <NarrativeSection
            section={currentSection}
            value={content[currentSection.id] || ""}
            onChange={(val) => onSectionChange(currentSection.id, val)}
            hint={resolved.hint}
            placeholder={resolved.placeholder}
          />
        );
      case "financial":
        return (
          <FinancialSection
            section={currentSection}
            value={content[currentSection.id] || {}}
            onChange={(val) => onSectionChange(currentSection.id, val)}
            devise={plan.devise}
            hint={resolved.hint}
          />
        );
      case "swot":
        return (
          <SwotSection
            section={currentSection}
            value={content[currentSection.id] || { forces: "", faiblesses: "", opportunites: "", menaces: "" }}
            onChange={(val) => onSectionChange(currentSection.id, val)}
            hint={resolved.hint}
          />
        );
      case "matrix":
        return (
          <MatrixSection
            section={currentSection}
            value={content[currentSection.id] || {}}
            onChange={(val) => onSectionChange(currentSection.id, val)}
            hint={resolved.hint}
          />
        );
      case "sensitivity":
        return (
          <SensitivitySection
            content={content}
            devise={plan.devise}
            hint={resolved.hint}
          />
        );
      case "market_sizing":
        return (
          <MarketSizingSection
            value={content[currentSection.id] || {}}
            onChange={(val) => onSectionChange(currentSection.id, val)}
            devise={plan.devise}
            hint={resolved.hint}
          />
        );
      case "team_cv":
        return (
          <TeamCvSection
            value={content[currentSection.id] || {}}
            onChange={(val) => onSectionChange(currentSection.id, val)}
            hint={resolved.hint}
          />
        );
      case "kpi_dashboard":
        return (
          <KpiDashboardSection
            content={content}
            value={content[currentSection.id] || {}}
            onChange={(val) => onSectionChange(currentSection.id, val)}
            devise={plan.devise}
            hint={resolved.hint}
          />
        );
      case "loan_schedule":
        return (
          <LoanScheduleSection
            section={currentSection}
            value={content[currentSection.id] || {}}
            onChange={(val) => onSectionChange(currentSection.id, val)}
            devise={plan.devise}
            hint={resolved.hint}
          />
        );
      case "banker_summary":
        return (
          <div>
            {resolved.hint && (
              <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
                💡 {resolved.hint}
              </div>
            )}
            <div className="mb-3 px-4 py-2 bg-accent/30 border border-accent/20 rounded-lg text-xs text-foreground leading-relaxed">
              {t("banker.crossTableNote")}
            </div>
            <FinancialValidation content={content} />
            <BankerSummary content={content} devise={plan.devise} planName={plan.name} />
          </div>
        );
    }
  };

  const sectionTypeLabel = currentSection.type === "financial"
    ? t("editor.financial")
    : currentSection.type === "matrix"
    ? t("editor.matrix")
    : currentSection.type === "sensitivity"
    ? t("editor.sensitivity")
    : currentSection.type === "loan_schedule"
    ? t("editor.loanSchedule")
    : currentSection.type === "kpi_dashboard"
    ? t("editor.kpiDashboard")
    : currentSection.type === "market_sizing"
    ? t("editor.marketSizing")
    : currentSection.type === "team_cv"
    ? t("editor.teamCv")
    : currentSection.type === "swot"
    ? t("editor.swot")
    : currentSection.type === "banker_summary"
    ? t("section.synthese_banquier.title")
    : t("editor.narrative");

  const prevSection = currentIdx > 0 ? BP_SECTIONS[currentIdx - 1] : null;
  const nextSection = currentIdx < BP_SECTIONS.length - 1 ? BP_SECTIONS[currentIdx + 1] : null;

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{currentSection.icon}</span>
              <h2 className="font-display text-xl sm:text-2xl font-bold">{resolved.title}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="uppercase tracking-wider font-bold">
                {sectionTypeLabel}
              </span>
              <span>·</span>
              <span>{t("editor.sectionOf", { current: String(currentIdx + 1), total: String(BP_SECTIONS.length) })}</span>
            </div>
          </div>

          {renderSection()}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {prevSection ? (
              <button
                onClick={() => onNavigate(prevSection.id)}
                className="px-3 sm:px-4 py-2 bg-secondary border border-border rounded-lg text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
              >
                ← <span className="hidden sm:inline">{resolveSection(prevSection, t).title}</span>
                <span className="sm:hidden">{t("editor.previous")}</span>
              </button>
            ) : <div />}

            {nextSection ? (
              <button
                onClick={() => onNavigate(nextSection.id)}
                className="px-3 sm:px-4 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
              >
                <span className="hidden sm:inline">{resolveSection(nextSection, t).title}</span>
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

      {currentSection.type !== "banker_summary" && currentSection.type !== "sensitivity" && currentSection.type !== "loan_schedule" && currentSection.type !== "kpi_dashboard" && currentSection.type !== "market_sizing" && (
        <AIAssistantPanel
          key={currentSection.id}
          sectionTitle={resolved.title}
          sectionHint={resolved.hint}
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
      )}
    </>
  );
};

export default EditorMainContent;
