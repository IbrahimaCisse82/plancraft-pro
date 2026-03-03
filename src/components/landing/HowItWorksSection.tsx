import { useEffect, useRef } from "react";

const steps = [
  { num: "01", title: "Décrivez votre projet", desc: "Renseignez les informations de base : nom, secteur, localisation, montant recherché. PlanCraft configure automatiquement l'ensemble de l'environnement." },
  { num: "02", title: "Laissez l'IA rédiger", desc: "Cliquez sur \"✦ Tout générer\" — l'IA rédige les 14 sections en quelques minutes. Relisez, ajustez, personnalisez selon votre connaissance terrain." },
  { num: "03", title: "Renseignez vos chiffres", desc: "Entrez votre CA prévisionnel, vos charges, vos effectifs. Les 11 tableaux financiers se calculent et se mettent à jour en temps réel." },
  { num: "04", title: "Exportez et déposez", desc: "Exportez en Word ou PDF, vérifiez la fiche synthèse banquier avec les ratios clés, puis remettez votre dossier — complet et professionnel." },
];

const HowItWorksSection = () => {
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
    <section id="comment" className="py-24 px-5 md:px-12 max-w-[1200px] mx-auto border-t border-border" ref={ref}>
      <div className="text-[0.68rem] font-bold text-gold-light uppercase tracking-[2px] mb-3">Comment ça marche</div>
      <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight mb-4">
        De l'idée au dossier<br />en 4 étapes
      </h2>

      <div className="flex flex-col gap-0 mt-16 relative">
        {/* Vertical line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-gold to-transparent" />

        {steps.map((step) => (
          <div key={step.num} className="fade-in flex gap-6 pb-10 relative">
            <div className="w-[54px] h-[54px] rounded-full border border-gold bg-secondary flex items-center justify-center font-mono text-xs text-gold-light font-medium shrink-0 z-10">
              {step.num}
            </div>
            <div className="pt-2.5">
              <div className="font-bold text-base mb-1.5">{step.title}</div>
              <div className="text-sm text-secondary-foreground leading-relaxed">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
