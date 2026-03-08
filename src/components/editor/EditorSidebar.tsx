import { useMemo } from "react";
import { Search, Check } from "lucide-react";
import { BP_SECTIONS } from "@/components/editor/sectionConfig";
import type { BPContent } from "@/types/businessPlan";

interface Props {
  content: BPContent;
  activeSection: string;
  sidebarSearch: string;
  onSearchChange: (val: string) => void;
  onSelectSection: (id: string) => void;
}

const EditorSidebar = ({ content, activeSection, sidebarSearch, onSearchChange, onSelectSection }: Props) => {
  const filledCount = BP_SECTIONS.filter((s) => {
    const val = content[s.id];
    if (!val) return false;
    if (typeof val === "string") return val.trim().length > 0;
    if (typeof val === "object") return Object.keys(val).length > 0;
    return false;
  }).length;

  const searchMatchingSections = useMemo(() => {
    if (!sidebarSearch.trim()) return new Set<string>();
    const q = sidebarSearch.toLowerCase();
    const matches = new Set<string>();
    BP_SECTIONS.forEach((section) => {
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

  const filteredSections = sidebarSearch.trim()
    ? BP_SECTIONS.filter((s) => searchMatchingSections.has(s.id))
    : BP_SECTIONS;

  return (
    <div className="p-4">
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={sidebarSearch}
          onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onSelectSection(section.id)}
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
};

export default EditorSidebar;
