import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BP_SECTIONS } from "@/components/editor/sectionConfig";
import EditorTopBar from "@/components/editor/EditorTopBar";
import EditorSidebar from "@/components/editor/EditorSidebar";
import EditorMainContent from "@/components/editor/EditorMainContent";
import { useAutoSave } from "@/hooks/useAutoSave";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { applyCrossTableLinks } from "@/lib/financialFormulas";
import type { BusinessPlan, BPContent } from "@/types/businessPlan";

const BusinessPlanEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
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
        setPlan(data as unknown as BusinessPlan);
        setContent((data.content as BPContent) || {});
      }
      setLoading(false);
    };
    fetchPlan();
  }, [id, navigate]);

  const handleSectionChange = useCallback((sectionId: string, value: any) => {
    setContent(prev => {
      const next = { ...prev, [sectionId]: value };
      // Apply cross-table links
      const linked = applyCrossTableLinks(next);
      scheduleAutoSave(linked);
      return linked;
    });
  }, [scheduleAutoSave]);

  const handleRestoreVersion = (restoredContent: Record<string, any>) => {
    setContent(restoredContent);
    saveContent(restoredContent);
  };

  const handleImportSection = (sectionId: string, data: Record<string, Record<string, string>>) => {
    setContent(prev => {
      const merged = { ...prev };
      merged[sectionId] = { ...(merged[sectionId] || {}), ...data };
      const linked = applyCrossTableLinks(merged);
      scheduleAutoSave(linked);
      return linked;
    });
  };

  if (loading) return <FullPageSpinner />;
  if (!plan) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <EditorTopBar
        plan={plan}
        content={content}
        saving={saving}
        saved={saved}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onSave={() => saveContent(content)}
        onRestore={handleRestoreVersion}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:relative z-40 top-[52px] bottom-0 left-0
          w-[260px] shrink-0 bg-card border-r border-border overflow-y-auto transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <EditorSidebar
            content={content}
            activeSection={activeSection}
            sidebarSearch={sidebarSearch}
            onSearchChange={setSidebarSearch}
            onSelectSection={(id) => { setActiveSection(id); setSidebarOpen(false); }}
          />
        </aside>

        <EditorMainContent
          plan={plan}
          content={content}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onNavigate={setActiveSection}
          onSave={() => saveContent(content)}
        />
      </div>
    </div>
  );
};

export default BusinessPlanEditor;
