import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface Step {
  title: string;
  description: string;
  icon: string;
}

const STEPS: Step[] = [
  {
    title: "Bienvenue sur PlanCraft Pro ! 🎉",
    description: "Créez des business plans professionnels en quelques minutes grâce à notre éditeur intelligent.",
    icon: "🚀",
  },
  {
    title: "Créez votre premier plan",
    description: "Cliquez sur « + Nouveau Business Plan » pour démarrer. Choisissez un nom, un secteur et une devise.",
    icon: "📋",
  },
  {
    title: "19 sections structurées",
    description: "Parcourez les sections narratives, financières et SWOT. Les tableaux financiers calculent automatiquement les totaux.",
    icon: "📊",
  },
  {
    title: "Assistant IA intégré",
    description: "L'assistant IA vous aide à rédiger chaque section. Posez-lui des questions ou demandez-lui de générer du contenu.",
    icon: "🤖",
  },
  {
    title: "Exportez et partagez",
    description: "Exportez en PDF, Word ou Excel. Partagez un lien public en lecture seule avec vos partenaires.",
    icon: "📤",
  },
];

const STORAGE_KEY = "plancraft_onboarding_done";

interface Props {
  forceShow?: boolean;
}

const OnboardingTour = ({ forceShow = false }: Props) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceShow) {
      setVisible(true);
      setStep(0);
      return;
    }
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so it doesn't flash on page load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [forceShow]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-[480px] max-w-[95vw] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-primary to-[hsl(var(--gold-light))] transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Close button */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Étape {step + 1} / {STEPS.length}</span>
            </div>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center">
            <div className="text-5xl mb-4">{current.icon}</div>
            <h3 className="font-display text-2xl font-bold mb-3">{current.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[380px] mx-auto">
              {current.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prev}
              disabled={step === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Précédent
            </button>

            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
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
              {step === STEPS.length - 1 ? "Commencer" : "Suivant"}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
