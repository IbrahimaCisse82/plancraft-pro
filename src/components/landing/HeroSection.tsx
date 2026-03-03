import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 md:px-12 pt-28 pb-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_hsl(43_55%_54%_/_0.15),_transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,_hsl(217_90%_64%_/_0.08),_transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_10%_90%,_hsl(155_62%_53%_/_0.06),_transparent)]" />
      </div>

      {/* Badge */}
      <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 border border-gold/30 rounded-full text-[0.68rem] font-bold text-gold-light uppercase tracking-wider bg-gold-dim mb-7">
        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-dot" />
        ✦ Propulsé par l'Intelligence Artificielle
      </div>

      {/* Heading */}
      <h1 className="relative z-10 font-display text-[clamp(2.8rem,7vw,6rem)] font-bold leading-[1.05] max-w-[900px] mb-5">
        Le Business Plan{" "}
        <em className="italic text-gradient-gold">Bankable</em>
        <br />
        en quelques heures
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 text-base md:text-lg text-secondary-foreground max-w-[580px] leading-relaxed mb-10">
        PlanCraft Pro est la plateforme de référence en Afrique francophone pour créer, structurer et exporter des business plans complets — prêts pour les banques, les investisseurs et les organismes de financement.
      </p>

      {/* CTA */}
      <div className="relative z-10 flex flex-wrap gap-3.5 items-center justify-center">
        <Link
          to="/auth"
          className="px-8 py-3.5 bg-primary rounded-lg text-sm font-bold text-primary-foreground gold-glow hover:bg-gold-light hover:-translate-y-0.5 gold-glow-hover transition-all"
        >
          Créer mon business plan →
        </Link>
        <a
          href="#fonctionnalites"
          className="px-8 py-3.5 border border-border-strong rounded-lg text-sm font-semibold text-foreground hover:border-gold hover:text-gold backdrop-blur-sm transition-all"
        >
          Voir les fonctionnalités
        </a>
      </div>

      {/* Stats */}
      <div className="relative z-10 flex flex-wrap gap-6 md:gap-10 mt-16 pt-10 border-t border-border">
        {[
          { val: "14", label: "Sections structurées" },
          { val: "11", label: "Tableaux financiers" },
          { val: "100%", label: "Fichier autonome" },
          { val: "IA", label: "Génération assistée" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-display text-4xl font-bold text-gold-light">{stat.val}</div>
            <div className="text-[0.7rem] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
