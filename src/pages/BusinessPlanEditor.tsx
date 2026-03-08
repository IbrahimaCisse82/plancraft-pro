import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, ChevronLeft, Check, Download, Menu, X, Search } from "lucide-react";
import { exportBusinessPlanPDF } from "@/lib/exportPdf";
import { exportBusinessPlanDOCX } from "@/lib/exportDocx";
import { BP_SECTIONS, SectionConfig } from "@/components/editor/sectionConfig";
import NarrativeSection from "@/components/editor/NarrativeSection";
import AIAssistantPanel from "@/components/editor/AIAssistantPanel";
import FinancialSection from "@/components/editor/FinancialSection";
import SwotSection from "@/components/editor/SwotSection";
import VersionHistoryPanel from "@/components/editor/VersionHistoryPanel";
import { useAutoSave } from "@/hooks/useAutoSave";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";

type BPContent = Record<string, any>;

const BusinessPlanEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<BPContent>({});
  const [activeSection, setActiveSection] = useState(BP_SECTIONS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const { saving, saved, saveContent, scheduleAutoSave } = useAutoSave(id);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("business_plans")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        toast.error("Business plan introuvable");
        navigate("/dashboard");
      } else {
        setPlan(data);
        setContent((data.content as BPContent) || {});
      }
      setLoading(false);
    };
    fetchPlan();
  }, [id, navigate]);

  const handleSectionChange = (sectionId: string, value: any) => {
    const next = { ...content, [sectionId]: value };
    setContent(next);
    scheduleAutoSave(next);
  };

  const handleRestoreVersion = (restoredContent: Record<string, any>) => {
    setContent(restoredContent);
    saveContent(restoredContent);
  };

  // Search sections by content
  const searchMatchingSections = useMemo(() => {
    if (!sidebarSearch.trim()) return new Set<string>();
    const q = sidebarSearch.toLowerCase();
    const matches = new Set<string>();
    BP_SECTIONS.forEach((section) => {
      // Match section title
      if (section.title.toLowerCase().includes(q)) {
        matches.add(section.id);
        return;
      }
      const val = content[section.id];
      if (!val) return;
      if (typeof val === "string" && val.toLowerCase().includes(q)) {
        matches.add(section.id);
      } else if (typeof val === "object") {
        if (JSON.stringify(val).toLowerCase().includes(q)) {
          matches.add(section.id);
        }
      }
    });
    return matches;
  }, [sidebarSearch, content]);

  const currentSection = BP_SECTIONS.find((s) => s.id === activeSection)!;

  if (loading) return <FullPageSpinner />;
  if (!plan) return null;

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case "narrative":
        return (
          <NarrativeSection
            section={section}
            value={content[section.id] || ""}
            onChange={(val) => handleSectionChange(section.id, val)}
          />
        );
      case "financial":
        return (
          <FinancialSection
            section={section}
            value={content[section.id] || {}}
            onChange={(val) => handleSectionChange(section.id, val)}
            devise={plan.devise}
          />
        );
      case "swot":
        return (
          <SwotSection
            section={section}
            value={content[section.id] || { forces: "", faiblesses: "", opportunites: "", menaces: "" }}
            onChange={(val) => handleSectionChange(section.id, val)}
          />
        );
    }
  };

  const filledCount = BP_SECTIONS.filter((s) => {
    const val = content[s.id];
    if (!val) return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (typeof val === "object") return Object.keys(val).length > 0;
    return false;
  }).length;

  const filteredSections = sidebarSearch.trim()
    ? BP_SECTIONS.filter((s) => searchMatchingSections.has(s.id))
    : BP_SECTIONS;

  const SidebarContent = () => (
    <div className="p-4">
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={sidebarSearch}
          onChange={(e) => setSidebarSearch(e.target.value)}
          placeholder="Rechercher dans le plan…"
          className="w-full pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
          Sections ({filledCount}/{BP_SECTIONS.length})
        </span>
        <span className="text-[0.6rem] text-primary font-bold">
          {Math.round((filledCount / BP_SECTIONS.length) * 100)}%
        </span>
      </div>
      <div className="h-1 bg-secondary rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-primary to-[hsl(var(--gold-light))] rounded-full transition-all duration-500"
          style={{ width: `${(filledCount / BP_SECTIONS.length) * 100}%` }}
        />
      </div>

      <nav className="space-y-0.5">
        {filteredSections.map((section) => {
          const isFilled = (() => {
            const val = content[section.id];
            if (!val) return false;
            if (typeof val === "string") return val.trim().length > 0;
            if (typeof val === "object") return Object.keys(val).length > 0;
            return false;
          })();

          return (
            <button
              key={section.id}
              onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-xs ${
                activeSection === section.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-secondary-foreground hover:bg-secondary border border-transparent"
              }`}
            >
              <span className="text-base shrink-0">{section.icon}</span>
              <span className="truncate font-medium">{section.title}</span>
              {isFilled && <Check className="w-3 h-3 text-success ml-auto shrink-0" />}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 h-[52px] bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
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
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saving && (
              <>
                <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Sauvegarde…</span>
              </>
            )}
            {saved && (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-success hidden sm:inline">Sauvegardé</span>
              </>
            )}
          </div>

          <span className="text-[0.6rem] text-muted-foreground font-mono hidden sm:inline">{plan.devise}</span>

          <button
            onClick={() => exportBusinessPlanPDF(plan, content)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
            aria-label="Exporter en PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={() => exportBusinessPlanDOCX(plan, content)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
            aria-label="Exporter en Word"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DOCX</span>
          </button>

          <VersionHistoryPanel planId={id!} content={content} onRestore={handleRestoreVersion} />

          <button
            onClick={() => saveContent(content)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-primary rounded-md text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
            aria-label="Sauvegarder"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sauvegarder</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:relative z-40 top-[52px] bottom-0 left-0
          w-[260px] shrink-0 bg-card border-r border-border overflow-y-auto transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Section header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{currentSection.icon}</span>
                <h2 className="font-display text-xl sm:text-2xl font-bold">{currentSection.title}</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="uppercase tracking-wider font-bold">
                  {currentSection.type === "financial" ? "Tableau financier" : currentSection.type === "swot" ? "Matrice SWOT" : "Section narrative"}
                </span>
                <span>·</span>
                <span>Section {BP_SECTIONS.findIndex((s) => s.id === activeSection) + 1} sur {BP_SECTIONS.length}</span>
              </div>
            </div>

            {renderSection(currentSection)}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              {BP_SECTIONS.findIndex((s) => s.id === activeSection) > 0 ? (
                <button
                  onClick={() => {
                    const idx = BP_SECTIONS.findIndex((s) => s.id === activeSection);
                    setActiveSection(BP_SECTIONS[idx - 1].id);
                  }}
                  className="px-3 sm:px-4 py-2 bg-secondary border border-border rounded-lg text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
                >
                  ← <span className="hidden sm:inline">{BP_SECTIONS[BP_SECTIONS.findIndex((s) => s.id === activeSection) - 1].title}</span>
                  <span className="sm:hidden">Précédent</span>
                </button>
              ) : <div />}

              {BP_SECTIONS.findIndex((s) => s.id === activeSection) < BP_SECTIONS.length - 1 ? (
                <button
                  onClick={() => {
                    const idx = BP_SECTIONS.findIndex((s) => s.id === activeSection);
                    setActiveSection(BP_SECTIONS[idx + 1].id);
                  }}
                  className="px-3 sm:px-4 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
                >
                  <span className="hidden sm:inline">{BP_SECTIONS[BP_SECTIONS.findIndex((s) => s.id === activeSection) + 1].title}</span>
                  <span className="sm:hidden">Suivant</span> →
                </button>
              ) : (
                <button
                  onClick={() => { saveContent(content); toast.success("Business plan sauvegardé !"); }}
                  className="px-3 sm:px-4 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
                >
                  ✅ Finaliser
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* AI Assistant — available for ALL section types */}
      <AIAssistantPanel
        key={currentSection.id}
        sectionTitle={currentSection.title}
        sectionHint={currentSection.hint}
        currentContent={
          currentSection.type === "narrative"
            ? content[currentSection.id] || ""
            : currentSection.type === "swot"
            ? JSON.stringify(content[currentSection.id] || {}, null, 2)
            : JSON.stringify(content[currentSection.id] || {}, null, 2)
        }
        planName={plan.name}
        secteur={plan.secteur}
        devise={plan.devise}
        sectionType={currentSection.type}
        onInsertText={
          currentSection.type === "narrative"
            ? (text) => handleSectionChange(currentSection.id, (content[currentSection.id] || "") + "\n\n" + text)
            : undefined
        }
      />
    </div>
  );
};

export default BusinessPlanEditor;
