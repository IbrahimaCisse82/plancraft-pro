import { Link } from "react-router-dom";
import { Save, ChevronLeft, Check, Download, Menu, X } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { exportBusinessPlanPDF } from "@/lib/exportPdf";
import { exportBusinessPlanDOCX } from "@/lib/exportDocx";
import { exportBusinessPlanXLSX } from "@/lib/exportXlsx";
import VersionHistoryPanel from "@/components/editor/VersionHistoryPanel";
import ShareButton from "@/components/editor/ShareButton";
import ImportExcelButton from "@/components/editor/ImportExcelButton";
import type { BusinessPlan, BPContent } from "@/types/businessPlan";

interface Props {
  plan: BusinessPlan;
  content: BPContent;
  saving: boolean;
  saved: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSave: () => void;
  onRestore: (content: BPContent) => void;
  onImportSection: (sectionId: string, data: Record<string, Record<string, string>>) => void;
}

const EditorTopBar = ({ plan, content, saving, saved, sidebarOpen, onToggleSidebar, onSave, onRestore, onImportSection }: Props) => {
  const { t } = useI18n();

  return (
    <div className="sticky top-0 z-50 h-[52px] bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Menu sections"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <Link to="/dashboard" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      <div className="h-5 w-px bg-border" />
      <h1 className="text-sm font-bold truncate max-w-[120px] sm:max-w-[300px]">{plan.name}</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saving && (
            <>
              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">{t("editor.saving")}</span>
            </>
          )}
          {saved && (
            <>
              <Check className="w-3.5 h-3.5 text-success" />
              <span className="text-success hidden sm:inline">{t("editor.saved")}</span>
            </>
          )}
        </div>

        <span className="text-[0.6rem] text-muted-foreground font-mono hidden sm:inline">{plan.devise}</span>

        <button
          onClick={() => exportBusinessPlanPDF(plan, content, t)}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
          aria-label="PDF"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button
          onClick={() => exportBusinessPlanDOCX(plan, content, t)}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
          aria-label="DOCX"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">DOCX</span>
        </button>

        <button
          onClick={() => exportBusinessPlanXLSX(plan, content, t)}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
          aria-label="XLSX"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">XLSX</span>
        </button>

        <ImportExcelButton onImport={onImportSection} />

        <VersionHistoryPanel planId={plan.id} content={content} onRestore={onRestore} />

        <ShareButton planId={plan.id} />

        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-primary rounded-md text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
          aria-label={t("editor.save")}
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("editor.save")}</span>
        </button>
      </div>
    </div>
  );
};

export default EditorTopBar;
