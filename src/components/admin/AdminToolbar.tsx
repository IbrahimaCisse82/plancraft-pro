import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export const inputCls = "px-2 py-1.5 rounded-md bg-secondary text-xs border border-border focus:outline-none focus:ring-1 focus:ring-primary";

export const AdminToolbar = ({
  search, onSearch, placeholder, onExport, children,
}: { search: string; onSearch: (v: string) => void; placeholder: string; onExport?: () => void; children?: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-2 mb-3">
    <div className="relative flex-1 min-w-[180px]">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      <input type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder}
        aria-label={placeholder} className={`w-full pl-8 pr-3 ${inputCls}`} />
    </div>
    {children}
    {onExport && (
      <button onClick={onExport} className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-secondary text-xs font-bold hover:bg-secondary/80 border border-border">
        <Download className="w-3.5 h-3.5" />CSV
      </button>
    )}
  </div>
);

export const Pager = ({ page, pages, total, onPage, fr }: { page: number; pages: number; total: number; onPage: (p: number) => void; fr: boolean }) => (
  <div className="flex items-center justify-between mt-3 text-[0.7rem] text-muted-foreground">
    <span>{total} {fr ? "résultat(s)" : "result(s)"}</span>
    <div className="flex items-center gap-2">
      <button aria-label={fr ? "Page précédente" : "Previous page"} disabled={page <= 1} onClick={() => onPage(page - 1)} className="p-1 rounded bg-secondary disabled:opacity-40"><ChevronLeft className="w-3.5 h-3.5" /></button>
      <span>{page} / {pages}</span>
      <button aria-label={fr ? "Page suivante" : "Next page"} disabled={page >= pages} onClick={() => onPage(page + 1)} className="p-1 rounded bg-secondary disabled:opacity-40"><ChevronRight className="w-3.5 h-3.5" /></button>
    </div>
  </div>
);
