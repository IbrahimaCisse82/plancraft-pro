import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const plans = [
  {
    name: "Gratuit",
    price: "0",
    unit: "FCFA / mois",
    desc: "Pour découvrir et commencer",
    features: [
      { text: "2 business plans maximum", included: true },
      { text: "14 sections structurées", included: true },
      { text: "Génération IA limitée (5 sections)", included: true },
      { text: "Export PDF", included: true },
      { text: "Export Word", included: false },
      { text: "Tableaux financiers avancés", included: false },
      { text: "Fiche synthèse banquier", included: false },
    ],
    cta: "Commencer gratuitement",
    ctaStyle: "outline" as const,
    featured: false,
  },
  {
    name: "Pro",
    price: "15 000",
    unit: "FCFA / mois",
    desc: "Pour les entrepreneurs sérieux",
    badge: "⭐ Recommandé",
    features: [
      { text: "Business plans illimités", included: true },
      { text: "14 sections structurées", included: true },
      { text: "Génération IA illimitée", included: true },
      { text: "Export PDF & Word", included: true },
      { text: "11 tableaux financiers complets", included: true },
      { text: "Fiche synthèse banquier", included: true },
      { text: "Sauvegarde cloud multi-appareils", included: true },
      { text: "Support email prioritaire", included: true },
    ],
    cta: "Démarrer l'essai gratuit",
    ctaStyle: "solid" as const,
    featured: true,
  },
  {
    name: "Entreprise",
    price: "Sur",
    unit: "devis",
    desc: "Pour les incubateurs et structures",
    features: [
      { text: "Tout le plan Pro", included: true },
      { text: "Multi-utilisateurs", included: true },
      { text: "Tableau de bord administrateur", included: true },
      { text: "Personnalisation du template", included: true },
      { text: "Formation et onboarding", included: true },
      { text: "Support dédié", included: true },
    ],
    cta: "Nous contacter",
    ctaStyle: "outline" as const,
    featured: false,
    ctaLink: "mailto:plancraftpro@growhubsenegal.com",
  },
];

const PricingSection = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="tarifs" className="py-24 px-5 md:px-12 max-w-[1200px] mx-auto border-t border-border" ref={ref}>
      <div className="text-[0.68rem] font-bold text-gold-light uppercase tracking-[2px] mb-3">Tarifs</div>
      <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight mb-4">Simple et transparent</h2>
      <p className="text-sm text-secondary-foreground max-w-[520px] leading-relaxed">
        Commencez gratuitement. Passez à Pro quand vous en avez besoin.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 items-start" ref={ref}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`fade-in relative bg-card border rounded-2xl p-8 ${
              plan.featured
                ? "border-gold bg-gradient-to-br from-gold-dim to-card"
                : "border-border"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[0.65rem] font-extrabold px-3.5 py-1 rounded-full tracking-wide uppercase whitespace-nowrap">
                {plan.badge}
              </div>
            )}

            <div className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wider mb-3">{plan.name}</div>
            <div className="font-display text-5xl font-bold text-foreground leading-none">
              {plan.price} <span className="text-base text-secondary-foreground font-sans">{plan.unit}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2 mb-6">{plan.desc}</div>

            <ul className="flex flex-col gap-2.5 mb-7">
              {plan.features.map((feat) => (
                <li key={feat.text} className="flex gap-2 items-start text-xs text-secondary-foreground">
                  <span className={`font-bold shrink-0 ${feat.included ? "text-success" : "text-muted-foreground"}`}>
                    {feat.included ? "✓" : "✗"}
                  </span>
                  {feat.text}
                </li>
              ))}
            </ul>

            {plan.ctaLink ? (
              <a
                href={plan.ctaLink}
                className={`block text-center py-3 rounded-lg text-sm font-bold transition-all ${
                  plan.ctaStyle === "solid"
                    ? "bg-primary text-primary-foreground hover:bg-gold-light"
                    : "border border-border text-secondary-foreground hover:border-gold hover:text-gold"
                }`}
              >
                {plan.cta}
              </a>
            ) : (
              <Link
                to="/auth"
                className={`block text-center py-3 rounded-lg text-sm font-bold transition-all ${
                  plan.ctaStyle === "solid"
                    ? "bg-primary text-primary-foreground hover:bg-gold-light"
                    : "border border-border text-secondary-foreground hover:border-gold hover:text-gold"
                }`}
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
