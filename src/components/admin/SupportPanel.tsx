import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { AdminToolbar, Pager, inputCls } from "./AdminToolbar";
import { downloadCsv, paginate } from "@/lib/csv";

type Ticket = { id: string; user_id: string; email: string | null; subject: string; message: string; status: string; admin_note: string | null; created_at: string };
const ST = ["open", "in_progress", "resolved"] as const;

const SupportPanel = () => {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const stLabel: Record<string, string> = fr ? { open: "Ouvert", in_progress: "En cours", resolved: "Résolu" } : { open: "Open", in_progress: "In progress", resolved: "Resolved" };
  const [list, setList] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Ticket[]);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Ticket>) => {
    const { error } = await supabase.from("support_tickets").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(fr ? "Demande mise à jour" : "Ticket updated"); load(); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((t) => (status === "all" || t.status === status) && (!q || `${t.subject} ${t.message} ${t.email}`.toLowerCase().includes(q)));
  }, [list, search, status]);
  const { pageItems, pages, page: cur } = paginate(filtered, page);

  return (
    <div>
      <AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder={fr ? "Rechercher une demande..." : "Search tickets..."}
        onExport={() => downloadCsv("support.csv", ["date", "email", "subject", "message", "status", "note"], filtered.map((t) => [t.created_at, t.email, t.subject, t.message, t.status, t.admin_note]))}>
        <select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={inputCls}>
          <option value="all">{fr ? "Tous statuts" : "All statuses"}</option>
          {ST.map((s) => <option key={s} value={s}>{stLabel[s]}</option>)}
        </select>
      </AdminToolbar>
      <div className="space-y-2">
        {pageItems.length === 0 && <div className="bg-card border border-border rounded-xl p-10 text-center text-xs text-muted-foreground">{fr ? "Aucune demande" : "No tickets"}</div>}
        {pageItems.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-bold flex-1 min-w-0">{t.subject}</span>
              <select aria-label="Status" value={t.status} onChange={(e) => update(t.id, { status: e.target.value })} className={inputCls}>
                {ST.map((s) => <option key={s} value={s}>{stLabel[s]}</option>)}
              </select>
            </div>
            <div className="text-[0.65rem] text-muted-foreground mb-2">{t.email} · {new Date(t.created_at).toLocaleString(fr ? "fr-FR" : "en-US")}</div>
            <p className="text-xs whitespace-pre-wrap mb-3">{t.message}</p>
            <div className="flex gap-2">
              <input aria-label={fr ? "Note interne" : "Internal note"} placeholder={fr ? "Note interne / réponse" : "Internal note / reply"} maxLength={2000}
                value={notes[t.id] ?? t.admin_note ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [t.id]: e.target.value }))} className={`flex-1 ${inputCls}`} />
              <button onClick={() => update(t.id, { admin_note: (notes[t.id] ?? "").trim() || null })} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold">{fr ? "Enregistrer" : "Save"}</button>
            </div>
          </div>
        ))}
      </div>
      <Pager page={cur} pages={pages} total={filtered.length} onPage={setPage} fr={fr} />
    </div>
  );
};

export default SupportPanel;
