import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { X, LifeBuoy, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Ann = { id: string; title: string; message: string; kind: string };
const kindCls: Record<string, string> = {
  info: "bg-primary/10 border-primary/30",
  warning: "bg-destructive/10 border-destructive/30",
  success: "bg-success/10 border-success/30",
};

const GlobalOverlays = () => {
  const { user, isAdmin, loading } = useAuth();
  const { lang } = useI18n();
  const fr = lang === "fr";
  const { pathname } = useLocation();
  const [anns, setAnns] = useState<Ann[]>([]);
  const [maint, setMaint] = useState<{ on: boolean; msg: string | null }>({ on: false, msg: null });
  const [dismissed, setDismissed] = useState<string[]>(() => JSON.parse(localStorage.getItem("pcp:dismissed-ann") || "[]"));
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("maintenance_mode, maintenance_message").eq("id", 1).maybeSingle()
      .then(({ data }) => data && setMaint({ on: data.maintenance_mode, msg: data.maintenance_message }));
  }, [pathname]);

  useEffect(() => {
    if (!user) { setAnns([]); return; }
    supabase.from("announcements").select("id, title, message, kind").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => setAnns((data ?? []) as Ann[]));
  }, [user]);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("pcp:dismissed-ann", JSON.stringify(next));
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const s = subject.trim(), m = message.trim();
    if (!user || !s || !m || s.length > 200 || m.length > 4000) { toast.error(fr ? "Sujet et message requis" : "Subject and message required"); return; }
    setSending(true);
    const { error } = await supabase.from("support_tickets").insert({ user_id: user.id, email: user.email, subject: s, message: m });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success(fr ? "Demande envoyée, nous revenons vers vous rapidement." : "Request sent, we'll get back to you soon.");
    setSubject(""); setMessage(""); setOpen(false);
  };

  const isAdminArea = pathname.startsWith("/admin");
  const publicOk = ["/admin/login", "/auth"].includes(pathname);

  if (!loading && maint.on && !isAdmin && !publicOk) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <Wrench className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold mb-2">{fr ? "Maintenance en cours" : "Under maintenance"}</h1>
          <p className="text-sm text-muted-foreground">{maint.msg || (fr ? "L'application revient très vite. Merci de votre patience." : "We'll be back shortly. Thanks for your patience.")}</p>
        </div>
      </div>
    );
  }

  const visible = anns.filter((a) => !dismissed.includes(a.id));

  return (
    <>
      {user && !isAdminArea && visible.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:w-96 z-50 space-y-2">
          {visible.slice(0, 2).map((a) => (
            <div key={a.id} role="status" className={`bg-card border rounded-lg p-3 shadow-lg ${kindCls[a.kind] ?? kindCls.info}`}>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold">{a.title}</div>
                  <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{a.message}</p>
                </div>
                <button aria-label={fr ? "Fermer" : "Close"} onClick={() => dismiss(a.id)} className="p-0.5 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {user && !isAdminArea && !pathname.startsWith("/share") && (
        <button onClick={() => setOpen(true)} aria-label={fr ? "Aide" : "Help"}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
          <LifeBuoy className="w-4 h-4" /><span className="hidden sm:inline">{fr ? "Aide" : "Help"}</span>
        </button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-display">{fr ? "Contacter le support" : "Contact support"}</DialogTitle></DialogHeader>
          <form onSubmit={send} className="space-y-3">
            <input aria-label={fr ? "Sujet" : "Subject"} placeholder={fr ? "Sujet" : "Subject"} maxLength={200} value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm" />
            <textarea aria-label="Message" placeholder={fr ? "Décrivez votre demande..." : "Describe your request..."} rows={5} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm" />
            <button disabled={sending} className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-bold disabled:opacity-60">{fr ? "Envoyer" : "Send"}</button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalOverlays;
