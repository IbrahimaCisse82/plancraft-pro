import { useEffect, useRef } from "react";

const features = [
  { icon: "✦", title: "Génération IA section par section", desc: "L'IA rédige la vision, la stratégie, l'analyse de marché et les risques en fonction de votre secteur et contexte réel." },
  { icon: "📊", title: "11 tableaux financiers automatiques", desc: "Plan de financement, compte d'exploitation 5 ans, flux de trésorerie, VAN/TRI, bilan prévisionnel — tout calculé et lié." },
  { icon: "💹", title: "Calculs financiers rigoureux", desc: "TRI Newton-Raphson, VAN au CMPC, BFR réel, trésorerie mensuelle et trimestrielle. Pas d'approximations." },
  { icon: "📄", title: "Export Word & PDF professionnel", desc: "Document complet avec table des matières, numérotation, page de garde — prêt à remettre à la banque." },
  { icon: "📋", title: "Fiche synthèse banquier", desc: "Vue condensée avec tous les ratios clés, verdicts ✓/✗ et note méthodologique — ce que le banquier lit en 30 secondes." },
  { icon: "💾", title: "Multi-projets dans le cloud", desc: "Créez et gérez plusieurs business plans depuis n'importe quel appareil. Vos données sont sécurisées et accessibles partout." },
];

const FeaturesSection = () => {
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
    <section id="fonctionnalites" className="py-24 px-5 md:px-12 max-w-[1200px] mx-auto" ref={ref}>
      <div className="text-[0.68rem] font-bold text-gold-light uppercase tracking-[2px] mb-3">Fonctionnalités</div>
      <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight mb-4">
        Tout ce dont vous avez<br />besoin pour convaincre
      </h2>
      <p className="text-sm text-secondary-foreground max-w-[520px] leading-relaxed">
        De la rédaction assistée aux tableaux financiers automatiques — PlanCraft Pro couvre chaque étape du dossier bancaire.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
        {features.map((feat) => (
          <div
            key={feat.title}
            className="fade-in group relative bg-card border border-border rounded-2xl p-7 transition-all duration-300 hover:border-gold/30 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="text-3xl mb-4">{feat.icon}</div>
            <div className="font-bold text-sm mb-2 text-foreground">{feat.title}</div>
            <div className="text-xs text-secondary-foreground leading-relaxed">{feat.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
