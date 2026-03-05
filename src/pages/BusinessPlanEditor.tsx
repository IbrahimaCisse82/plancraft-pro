import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Save, ChevronLeft, Check } from "lucide-react";
import { BP_SECTIONS, SectionConfig } from "@/components/editor/sectionConfig";
import NarrativeSection from "@/components/editor/NarrativeSection";
import FinancialSection from "@/components/editor/FinancialSection";
import SwotSection from "@/components/editor/SwotSection";
import type { Json } from "@/integrations/supabase/types";

type BPContent = Record<string, any>;

const BusinessPlanEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [content, setContent] = useState<BPContent>({});
  const [activeSection, setActiveSection] = useState(BP_SECTIONS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const saveContent = useCallback(async (newContent: BPContent) => {
    if (!id) return;
    setSaving(true);
    setSaved(false);

    // Calculate progress based on filled sections
    const filledSections = BP_SECTIONS.filter((s) => {
      const val = newContent[s.id];
      if (!val) return false;
      if (typeof val === "string") return val.trim().length > 0;
      if (typeof val === "object") return Object.keys(val).length > 0;
      return false;
    }).length;
    const progress = Math.round((filledSections / BP_SECTIONS.length) * 100);

    const { error } = await supabase
      .from("business_plans")
      .update({ content: newContent as unknown as Json, progress })
      .eq("id", id);

    setSaving(false);
    if (error) {
      toast.error("Erreur de sauvegarde");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }, [id]);

  const handleSectionChange = (sectionId: string, value: any) => {
    const next = { ...content, [sectionId]: value };
    setContent(next);

    // Auto-save after 1.5s of inactivity
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveContent(next), 1500);
  };

  const currentSection = BP_SECTIONS.find((s) => s.id === activeSection)!;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 h-[52px] bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="h-5 w-px bg-border" />

        <h1 className="text-sm font-bold truncate max-w-[200px] sm:max-w-[300px]">{plan.name}</h1>

        <div className="ml-auto flex items-center gap-3">
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saving && (
              <>
                <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                <span>Sauvegarde…</span>
              </>
            )}
            {saved && (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-500">Sauvegardé</span>
              </>
            )}
          </div>

          <span className="text-[0.6rem] text-muted-foreground font-mono">{plan.devise}</span>

          <button
            onClick={() => saveContent(content)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary rounded-md text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-[260px]" : "w-0"} shrink-0 bg-card border-r border-border overflow-y-auto transition-all duration-200`}>
          <div className="p-4">
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
              {BP_SECTIONS.map((section) => {
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
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-xs ${
                      activeSection === section.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-secondary-foreground hover:bg-secondary border border-transparent"
                    }`}
                  >
                    <span className="text-base shrink-0">{section.icon}</span>
                    <span className="truncate font-medium">{section.title}</span>
                    {isFilled && <Check className="w-3 h-3 text-green-500 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[860px] mx-auto px-6 py-8">
            {/* Section header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{currentSection.icon}</span>
                <h2 className="font-display text-2xl font-bold">{currentSection.title}</h2>
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
                  className="px-4 py-2 bg-secondary border border-border rounded-lg text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
                >
                  ← {BP_SECTIONS[BP_SECTIONS.findIndex((s) => s.id === activeSection) - 1].title}
                </button>
              ) : <div />}

              {BP_SECTIONS.findIndex((s) => s.id === activeSection) < BP_SECTIONS.length - 1 ? (
                <button
                  onClick={() => {
                    const idx = BP_SECTIONS.findIndex((s) => s.id === activeSection);
                    setActiveSection(BP_SECTIONS[idx + 1].id);
                  }}
                  className="px-4 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
                >
                  {BP_SECTIONS[BP_SECTIONS.findIndex((s) => s.id === activeSection) + 1].title} →
                </button>
              ) : (
                <button
                  onClick={() => { saveContent(content); toast.success("Business plan sauvegardé !"); }}
                  className="px-4 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
                >
                  ✅ Finaliser
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusinessPlanEditor;
