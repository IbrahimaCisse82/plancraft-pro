import { useEffect, useRef } from "react";
import { useI18n } from "@/contexts/I18nContext";

const HowItWorksSection = () => {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  const steps = [
    { num: "01", title: t("howItWorks.step1.title"), desc: t("howItWorks.step1.desc") },
    { num: "02", title: t("howItWorks.step2.title"), desc: t("howItWorks.step2.desc") },
    { num: "03", title: t("howItWorks.step3.title"), desc: t("howItWorks.step3.desc") },
    { num: "04", title: t("howItWorks.step4.title"), desc: t("howItWorks.step4.desc") },
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
    <section id="comment" className="py-24 px-5 md:px-12 max-w-[1200px] mx-auto border-t border-border" ref={ref}>
      <div className="text-[0.68rem] font-bold text-gold-light uppercase tracking-[2px] mb-3">{t("howItWorks.label")}</div>
      <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight mb-4 whitespace-pre-line">
        {t("howItWorks.heading")}
      </h2>

      <div className="flex flex-col gap-0 mt-16 relative">
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
