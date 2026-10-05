import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { inputCls } from "./AdminToolbar";

type Ann = { id: string; title: string; message: string; kind: string; is_active: boolean; starts_at: string; ends_at: string | null };

const AnnouncementsPanel = () => {
  const { user } = useAuth();
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [list, setList] = useState<Ann[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState("info");
  const [endsAt, setEndsAt] = useState("");

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Ann[]);
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim(), m = message.trim();
    if (!t || !m || t.length > 200 || m.length > 2000) { toast.error(fr ? "Titre et message requis" : "Title and message required"); return; }
    const { error } = await supabase.from("announcements").insert({
      title: t, message: m, kind, created_by: user?.id, ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    });
    if (error) return toast.error(error.message);
    setTitle(""); setMessage(""); setEndsAt("");
    toast.success(fr ? "Annonce publiée" : "Announcement published");
    load();
  };

  const toggle = async (a: Ann) => {
    const { error } = await supabase.from("announcements").update({ is_active: !a.is_active }).eq("id", a.id);
    if (error) toast.error(error.message); else load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <form onSubmit={create} className="bg-card border border-border rounded-xl p-5 space-y-3 h-fit">
        <h3 className="text-sm font-bold">{fr ? "Nouvelle annonce" : "New announcement"}</h3>
        <input aria-label={fr ? "Titre" : "Title"} placeholder={fr ? "Titre" : "Title"} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full ${inputCls}`} />
        <textarea aria-label="Message" placeholder="Message" maxLength={2000} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={`w-full ${inputCls}`} />
        <div className="flex gap-2 flex-wrap">
          <select aria-label="Type" value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
            <option value="info">Info</option><option value="warning">{fr ? "Alerte" : "Warning"}</option><option value="success">{fr ? "Succès" : "Success"}</option>
          </select>
          <label className="text-xs flex items-center gap-1">{fr ? "Fin :" : "Ends:"}
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputCls} />
          </label>
        </div>
        <button className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold">{fr ? "Publier" : "Publish"}</button>
      </form>
      <div className="space-y-2">
        {list.length === 0 && <p className="text-xs text-muted-foreground">{fr ? "Aucune annonce" : "No announcements"}</p>}
        {list.map((a) => (
          <div key={a.id} className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold">{a.title} <span className="text-[0.6rem] uppercase text-muted-foreground">· {a.kind}</span></div>
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{a.message}</p>
                {a.ends_at && <p className="text-[0.6rem] text-muted-foreground mt-1">{fr ? "Fin" : "Ends"} : {new Date(a.ends_at).toLocaleString(fr ? "fr-FR" : "en-US")}</p>}
              </div>
              <button onClick={() => toggle(a)} className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${a.is_active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>
                {a.is_active ? (fr ? "active" : "active") : (fr ? "inactive" : "inactive")}
              </button>
              <button aria-label={fr ? "Supprimer" : "Delete"} onClick={() => remove(a.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPanel;
