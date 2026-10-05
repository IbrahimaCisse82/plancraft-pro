import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

const MfaSection = () => {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactorId(data?.totp?.find((f) => f.status === "verified")?.id ?? null);
  };
  useEffect(() => { load(); }, []);

  const start = async () => {
    setBusy(true);
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `admin-${Date.now()}` });
    setBusy(false);
    if (error) return toast.error(error.message);
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enroll) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
    setBusy(false);
    if (error) return toast.error(fr ? "Code invalide" : "Invalid code");
    toast.success(fr ? "Double authentification activée" : "Two-factor enabled");
    setEnroll(null); setCode(""); load();
  };

  const disable = async () => {
    if (!factorId || !confirm(fr ? "Désactiver la double authentification ?" : "Disable two-factor?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) return toast.error(error.message);
    toast.success(fr ? "Double authentification désactivée" : "Two-factor disabled");
    load();
  };

  return (
    <div className="max-w-md bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <h2 className="font-heading text-lg">{fr ? "Double authentification" : "Two-factor authentication"}</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {fr ? "Un code à 6 chiffres (Google Authenticator, Authy…) sera demandé à chaque connexion au back-office."
            : "A 6-digit code (Google Authenticator, Authy…) will be required at every back-office sign-in."}
      </p>
      {factorId ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-success">{fr ? "Activée ✓" : "Enabled ✓"}</p>
          <button onClick={disable} className="w-full px-4 py-2 rounded-md bg-destructive/10 text-destructive text-xs font-bold">{fr ? "Désactiver" : "Disable"}</button>
        </div>
      ) : enroll ? (
        <form onSubmit={verify} className="space-y-3">
          <p className="text-xs">{fr ? "1. Scannez ce QR code avec votre application." : "1. Scan this QR code with your app."}</p>
          <img src={enroll.qr} alt="QR code" className="w-44 h-44 bg-white p-2 rounded mx-auto" />
          <p className="text-[0.65rem] text-muted-foreground break-all text-center">{enroll.secret}</p>
          <p className="text-xs">{fr ? "2. Saisissez le code affiché." : "2. Enter the displayed code."}</p>
          <input aria-label={fr ? "Code à 6 chiffres" : "6-digit code"} inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2 rounded-md bg-background border border-border text-center tracking-[0.4em] text-lg" />
          <button disabled={busy || code.length !== 6} className="w-full flex justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}{fr ? "Vérifier et activer" : "Verify and enable"}
          </button>
        </form>
      ) : (
        <button onClick={start} disabled={busy} className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold disabled:opacity-60">{fr ? "Activer" : "Enable"}</button>
      )}
    </div>
  );
};

export default MfaSection;
