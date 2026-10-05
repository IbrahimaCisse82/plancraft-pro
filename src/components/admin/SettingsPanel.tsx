import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { inputCls } from "./AdminToolbar";

const SettingsPanel = () => {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [maintenance, setMaintenance] = useState(false);
  const [msg, setMsg] = useState("");
  const [until, setUntil] = useState("2026-12-31");
  const [contact, setContact] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (!data) return;
      setMaintenance(data.maintenance_mode); setMsg(data.maintenance_message ?? ""); setUntil(data.free_access_until); setContact(data.contact_email ?? "");
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = contact.trim();
    if (c && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) { toast.error(fr ? "Email invalide" : "Invalid email"); return; }
    setSaving(true);
    const { error } = await supabase.from("app_settings").update({
      maintenance_mode: maintenance, maintenance_message: msg.trim().slice(0, 500) || null, free_access_until: until, contact_email: c || null,
    }).eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success(fr ? "Réglages enregistrés" : "Settings saved");
  };

  return (
    <form onSubmit={save} className="max-w-lg bg-card border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold">{fr ? "Mode maintenance" : "Maintenance mode"}</div>
          <div className="text-xs text-muted-foreground">{fr ? "Les utilisateurs (hors admins) voient un écran de maintenance." : "Non-admin users see a maintenance screen."}</div>
        </div>
        <Switch checked={maintenance} onCheckedChange={setMaintenance} aria-label={fr ? "Mode maintenance" : "Maintenance mode"} />
      </div>
      <label className="block text-xs font-bold">{fr ? "Message de maintenance" : "Maintenance message"}
        <textarea rows={3} maxLength={500} value={msg} onChange={(e) => setMsg(e.target.value)} className={`w-full mt-1 font-normal ${inputCls}`} />
      </label>
      <label className="block text-xs font-bold">{fr ? "Fin de la période gratuite" : "Free period end"}
        <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className={`w-full mt-1 font-normal ${inputCls}`} />
      </label>
      <label className="block text-xs font-bold">{fr ? "Email de contact" : "Contact email"}
        <input type="email" maxLength={255} value={contact} onChange={(e) => setContact(e.target.value)} className={`w-full mt-1 font-normal ${inputCls}`} />
      </label>
      <button disabled={saving} className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold disabled:opacity-60">{fr ? "Enregistrer" : "Save"}</button>
    </form>
  );
};

export default SettingsPanel;
