import { useEffect, useRef } from "react";
import { useI18n } from "@/contexts/I18nContext";

const FeaturesSection = () => {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  const features = [
    { icon: "✦", title: t("features.1.title"), desc: t("features.1.desc") },
    { icon: "📊", title: t("features.2.title"), desc: t("features.2.desc") },
    { icon: "💹", title: t("features.3.title"), desc: t("features.3.desc") },
    { icon: "📄", title: t("features.4.title"), desc: t("features.4.desc") },
    { icon: "📋", title: t("features.5.title"), desc: t("features.5.desc") },
    { icon: "💾", title: t("features.6.title"), desc: t("features.6.desc") },
  ];

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
      <div className="text-[0.68rem] font-bold text-gold-light uppercase tracking-[2px] mb-3">{t("features.label")}</div>
      <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight mb-4 whitespace-pre-line">
        {t("features.heading")}
      </h2>
      <p className="text-sm text-secondary-foreground max-w-[520px] leading-relaxed">
        {t("features.subtitle")}
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
