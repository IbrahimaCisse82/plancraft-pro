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
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { useI18n } from "@/contexts/I18nContext";
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
  const presenceUsers = useRealtimePresence(id);
  const { t } = useI18n();

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
        onImportSection={handleImportSection}
      />

      {presenceUsers.length > 0 && (
        <div className="h-7 bg-accent/30 border-b border-border flex items-center px-4 gap-2">
          <div className="flex -space-x-1.5">
            {presenceUsers.map(u => (
              <div
                key={u.user_id}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-primary-foreground border border-background"
                style={{ backgroundColor: u.color }}
                title={u.display_name}
              >
                {u.display_name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-[0.6rem] text-muted-foreground">
            {presenceUsers.map(u => u.display_name).join(", ")} {t("presence.viewing")}
          </span>
        </div>
      )}

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
