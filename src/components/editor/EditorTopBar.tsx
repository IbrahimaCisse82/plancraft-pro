import { Link, useNavigate } from "react-router-dom";
import { Save, ChevronLeft, Check, Download, Menu, X, Lock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useI18n } from "@/contexts/I18nContext";
import { exportBusinessPlanPDF } from "@/lib/exportPdf";
import { exportOnePagerPDF } from "@/lib/exportOnePager";
import { exportBusinessPlanDOCX } from "@/lib/exportDocx";
import { exportBusinessPlanXLSX } from "@/lib/exportXlsx";
import VersionHistoryPanel from "@/components/editor/VersionHistoryPanel";
import ShareButton from "@/components/editor/ShareButton";
import ImportExcelButton from "@/components/editor/ImportExcelButton";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
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
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { limits, plan: tier } = usePlan();

  const requirePro = (feature: string) => {
    toast.error(
      lang === "fr"
        ? `${feature} : réservé aux plans Pro et Business (actuel : ${tier.toUpperCase()}).`
        : `${feature}: Pro and Business plans only (current: ${tier.toUpperCase()}).`,
      {
        action: {
          label: lang === "fr" ? "Passer Pro" : "Upgrade",
          onClick: () => navigate("/#tarifs"),
        },
      }
    );
  };

  const canDocx = limits.exports.includes("docx");
  const canXlsx = limits.exports.includes("xlsx");
  const canShare = limits.publicSharing;
  const canVersion = limits.versionHistory;

  return (
    <div className="sticky top-0 z-50 h-[52px] bg-card border-b border-border flex items-center px-2 sm:px-4 gap-2 sm:gap-3 shrink-0">
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

      <div className="hidden sm:block h-5 w-px bg-border" />
      <h1 className="text-sm font-bold truncate min-w-0 max-w-[80px] sm:max-w-[300px]">{plan.name}</h1>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3 shrink-0">
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

        <div className="hidden xl:flex items-center gap-3">
        <button
          onClick={() => exportBusinessPlanPDF(plan, content, t)}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
          aria-label="PDF"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button
          onClick={() => exportOnePagerPDF(plan, content, t)}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
          aria-label={t("export.onePager.button")}
          title={t("export.onePager.title")}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("export.onePager.button")}</span>
        </button>

        <button
          onClick={() => canDocx ? exportBusinessPlanDOCX(plan, content, t) : requirePro("Export Word")}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            canDocx
              ? "bg-secondary border border-border text-secondary-foreground hover:border-primary hover:text-primary"
              : "bg-secondary/50 border border-dashed border-border text-muted-foreground"
          }`}
          aria-label="DOCX"
        >
          {canDocx ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">DOCX</span>
        </button>

        <button
          onClick={() => canXlsx ? exportBusinessPlanXLSX(plan, content, t) : requirePro("Export Excel")}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            canXlsx
              ? "bg-secondary border border-border text-secondary-foreground hover:border-primary hover:text-primary"
              : "bg-secondary/50 border border-dashed border-border text-muted-foreground"
          }`}
          aria-label="XLSX"
        >
          {canXlsx ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">XLSX</span>
        </button>

        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="xl:hidden flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary" aria-label={lang === "fr" ? "Exporter" : "Export"}>
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === "fr" ? "Exporter" : "Export"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => exportBusinessPlanPDF(plan, content, t)}>PDF</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => exportOnePagerPDF(plan, content, t)}>{t("export.onePager.button")}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => canDocx ? exportBusinessPlanDOCX(plan, content, t) : requirePro("Export Word")}>{!canDocx && <Lock className="w-3 h-3 mr-2" />}DOCX</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => canXlsx ? exportBusinessPlanXLSX(plan, content, t) : requirePro("Export Excel")}>{!canXlsx && <Lock className="w-3 h-3 mr-2" />}XLSX</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ImportExcelButton onImport={onImportSection} />

        {canVersion ? (
          <VersionHistoryPanel planId={plan.id} content={content} onRestore={onRestore} />
        ) : (
          <button
            onClick={() => requirePro(lang === "fr" ? "Historique des versions" : "Version history")}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary/50 border border-dashed border-border rounded-md text-xs font-semibold text-muted-foreground"
            aria-label="Versions"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{lang === "fr" ? "Versions" : "Versions"}</span>
          </button>
        )}

        {canShare ? (
          <ShareButton planId={plan.id} />
        ) : (
          <button
            onClick={() => requirePro(lang === "fr" ? "Partage public" : "Public sharing")}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary/50 border border-dashed border-border rounded-md text-xs font-semibold text-muted-foreground"
            aria-label="Share"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{lang === "fr" ? "Partager" : "Share"}</span>
          </button>
        )}

        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-primary rounded-md text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
          aria-label={t("editor.save")}
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">{t("editor.save")}</span>
        </button>
      </div>
    </div>
  );
};

export default EditorTopBar;
