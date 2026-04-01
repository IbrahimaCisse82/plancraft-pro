import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";

const STEP_ICONS = ["🚀", "📋", "📊", "🤖", "📤"];

interface Props {
  forceShow?: boolean;
}

const OnboardingTour = ({ forceShow = false }: Props) => {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    { title: t("onboarding.step1.title"), description: t("onboarding.step1.desc"), icon: STEP_ICONS[0] },
    { title: t("onboarding.step2.title"), description: t("onboarding.step2.desc"), icon: STEP_ICONS[1] },
    { title: t("onboarding.step3.title"), description: t("onboarding.step3.desc"), icon: STEP_ICONS[2] },
    { title: t("onboarding.step4.title"), description: t("onboarding.step4.desc"), icon: STEP_ICONS[3] },
    { title: t("onboarding.step5.title"), description: t("onboarding.step5.desc"), icon: STEP_ICONS[4] },
  ];

  useEffect(() => {
    if (forceShow) {
      setVisible(true);
      setStep(0);
      return;
    }
    if (profile && !(profile as any).onboarding_done) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [forceShow, profile]);

  const dismiss = async () => {
    setVisible(false);
    if (user) {
      await supabase
        .from("profiles")
        .update({ onboarding_done: true } as any)
        .eq("user_id", user.id);
    }
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else dismiss();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-[480px] max-w-[95vw] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-primary to-[hsl(var(--gold-light))] transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{t("onboarding.step", { current: String(step + 1), total: String(steps.length) })}</span>
            </div>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label={t("onboarding.close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center">
            <div className="text-5xl mb-4">{current.icon}</div>
            <h3 className="font-display text-2xl font-bold mb-3">{current.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[380px] mx-auto">
              {current.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prev}
              disabled={step === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {t("onboarding.previous")}
            </button>

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i === step ? "bg-primary w-5" : "bg-secondary"}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex items-center gap-1 px-5 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
            >
              {step === steps.length - 1 ? t("onboarding.start") : t("onboarding.next")}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
