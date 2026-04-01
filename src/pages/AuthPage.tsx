import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/validation";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user, signIn, signUp, resetPassword, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "true") {
      toast.success(t("auth.emailConfirmed"), { duration: 6000 });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    if (mode === "forgot") {
      const result = forgotPasswordSchema.safeParse({ email });
      if (!result.success) {
        setErrors(Object.fromEntries(result.error.errors.map(e => [e.path[0], e.message])));
        setSubmitting(false);
        return;
      }
      const { error } = await resetPassword(result.data.email);
      setSubmitting(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t("auth.resetSent"));
        setMode("login");
      }
      return;
    }

    if (mode === "login") {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        setErrors(Object.fromEntries(result.error.errors.map(e => [e.path[0], e.message])));
        setSubmitting(false);
        return;
      }
      const { error } = await signIn(result.data.email, result.data.password);
      setSubmitting(false);
      if (error) toast.error(error.message);
    } else {
      const result = registerSchema.safeParse({ email, password, displayName: displayName || undefined });
      if (!result.success) {
        setErrors(Object.fromEntries(result.error.errors.map(e => [e.path[0], e.message])));
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(result.data.email, result.data.password, result.data.displayName);
      setSubmitting(false);
      if (error) {
        toast.error(error.message);
      } else {
        navigate("/email-confirmation");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const titles = {
    login: { heading: t("auth.welcomeTitle"), sub: t("auth.welcomeSub") },
    register: { heading: t("auth.registerTitle"), sub: t("auth.registerSub") },
    forgot: { heading: t("auth.forgotTitle"), sub: t("auth.forgotSub") },
  };

  const clearErrors = () => setErrors({});

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_-10%_50%,_hsl(43_55%_54%_/_0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_110%_20%,_hsl(217_90%_64%_/_0.07),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_110%,_hsl(155_62%_53%_/_0.05),_transparent_60%)]" />
      </div>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(hsl(0_0%_100%_/_0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%_/_0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-[72px] relative z-10">
        <Link to="/" className="font-display text-2xl font-bold text-[hsl(var(--gold-light))] tracking-wide block mb-16">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </Link>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-primary/25 rounded-full text-[0.62rem] font-bold text-[hsl(var(--gold-light))] uppercase tracking-[1.5px] bg-[hsl(var(--gold-dim))] mb-6 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {t("auth.tagline")}
        </div>
        <h1 className="font-display text-[clamp(2.4rem,4vw,3.8rem)] font-bold leading-[1.07] mb-5">
          {t("auth.leftHeading1")}<br />{t("auth.leftHeading2")}<br />
          <em className="italic text-[hsl(var(--gold-light))]">{t("auth.leftHeadingHighlight")}</em>
        </h1>
        <p className="text-sm text-secondary-foreground leading-relaxed max-w-[480px] mb-12">
          {t("auth.leftDesc")}
        </p>
        <div className="flex flex-wrap gap-2">
          {[t("auth.pill1"), t("auth.pill2"), t("auth.pill3"), t("auth.pill4"), t("auth.pill5")].map((pill) => (
            <div key={pill} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-card border border-border rounded-full text-xs text-secondary-foreground">
              {pill}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full lg:w-[460px] shrink-0 bg-card border-l border-border flex flex-col items-center justify-center px-8 md:px-12 py-14">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

        <Link to="/" className="font-display text-xl font-bold text-[hsl(var(--gold-light))] block text-center mb-10">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </Link>

        <h2 className="text-center font-display text-3xl font-bold mb-2.5">
          {titles[mode].heading}
        </h2>
        <p className="text-center text-xs text-secondary-foreground leading-relaxed mb-9 max-w-[300px]">
          {titles[mode].sub}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-secondary-foreground mb-1.5">{t("auth.fullName")}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); clearErrors(); }}
                placeholder="Ex : Moussa Diop"
                maxLength={100}
                className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              {errors.displayName && <p className="text-xs text-destructive mt-1">{errors.displayName}</p>}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-secondary-foreground mb-1.5">{t("auth.email")} *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
              placeholder="votre@email.com"
              maxLength={255}
              className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          {mode !== "forgot" && (
            <div>
              <label className="block text-xs font-bold text-secondary-foreground mb-1.5">{t("auth.password")} *</label>
              <input
                type="password"
                required
                minLength={6}
                maxLength={128}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-primary rounded-xl text-sm font-bold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 mt-2"
          >
            {submitting
              ? t("auth.loading")
              : mode === "login"
              ? t("auth.loginBtn")
              : mode === "register"
              ? t("auth.registerBtn")
              : t("auth.sendLinkBtn")
            }
          </button>
        </form>

        {mode === "login" && (
          <button
            onClick={() => { setMode("forgot"); clearErrors(); }}
            className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {t("auth.forgotPassword")}
          </button>
        )}

        {mode !== "forgot" && (
          <>
            <div className="w-full flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">{t("auth.or")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (error) toast.error(error.message);
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3 bg-secondary border border-border rounded-xl text-sm font-semibold text-foreground hover:border-primary/30 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t("auth.continueGoogle")}
            </button>
          </>
        )}

        <button
          onClick={() => { setMode(mode === "login" ? "register" : "login"); clearErrors(); }}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === "login" || mode === "forgot"
            ? t("auth.noAccount")
            : t("auth.hasAccount")}
        </button>

        <div className="mt-5 p-3 px-4 bg-[hsl(var(--gold-dim))] border border-primary/15 rounded-lg text-xs text-secondary-foreground leading-relaxed w-full">
          <strong className="text-[hsl(var(--gold-light))]">{t("auth.firstTime")}</strong><br />
          {t("auth.firstTimeDesc")}
        </div>

        <div className="mt-auto pt-8 border-t border-border w-full text-center text-[0.67rem] text-muted-foreground leading-relaxed">
          {t("auth.termsIntro")}<br />
          <Link to="/cgu" className="text-[hsl(var(--gold-light))] hover:opacity-80 transition-opacity">{t("auth.termsLink")}</Link>
          {" "}{t("auth.privacyAnd")}{" "}
          <Link to="/confidentialite" className="text-[hsl(var(--gold-light))] hover:opacity-80 transition-opacity">{t("auth.privacyLink")}</Link>
          <br /><br />
          <strong className="text-secondary-foreground">Grow Hub SARL</strong> · Entreprise de droit sénégalais<br />
          <a href="mailto:plancraftpro@growhubsenegal.com" className="text-[hsl(var(--gold-light))] hover:opacity-80 transition-opacity">
            plancraftpro@growhubsenegal.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
