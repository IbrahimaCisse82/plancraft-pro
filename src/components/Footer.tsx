import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";

const Footer = () => {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary pt-12 pb-6 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-10 flex-wrap">
        <div>
          <Link to="/" className="font-display text-xl font-bold text-[hsl(var(--gold-light))] block mb-2">
            Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
          </Link>
          <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
            {t("footer.description")}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">📧 plancraftpro@growhubsenegal.com</p>
        </div>

        <div className="flex gap-16 flex-wrap">
          <div>
            <h4 className="text-[0.7rem] font-bold text-secondary-foreground uppercase tracking-wider mb-3.5">{t("footer.product")}</h4>
            <a href="#fonctionnalites" className="block text-xs text-muted-foreground hover:text-[hsl(var(--gold-light))] transition-colors mb-2">{t("footer.features")}</a>
            <a href="#tarifs" className="block text-xs text-muted-foreground hover:text-[hsl(var(--gold-light))] transition-colors mb-2">{t("footer.pricing")}</a>
            <a href="#comment" className="block text-xs text-muted-foreground hover:text-[hsl(var(--gold-light))] transition-colors mb-2">{t("footer.howItWorks")}</a>
            <Link to="/auth" className="block text-xs text-muted-foreground hover:text-[hsl(var(--gold-light))] transition-colors mb-2">{t("footer.signIn")}</Link>
          </div>
          <div>
            <h4 className="text-[0.7rem] font-bold text-secondary-foreground uppercase tracking-wider mb-3.5">{t("footer.legal")}</h4>
            <Link to="/cgu" className="block text-xs text-muted-foreground hover:text-[hsl(var(--gold-light))] transition-colors mb-2">{t("footer.terms")}</Link>
            <Link to="/confidentialite" className="block text-xs text-muted-foreground hover:text-[hsl(var(--gold-light))] transition-colors mb-2">{t("footer.privacy")}</Link>
            <Link to="/guide" className="block text-xs text-muted-foreground hover:text-[hsl(var(--gold-light))] transition-colors mb-2">Guide</Link>
            <a href="mailto:plancraftpro@growhubsenegal.com" className="block text-xs text-muted-foreground hover:text-[hsl(var(--gold-light))] transition-colors mb-2">{t("footer.contact")}</a>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-[0.7rem] text-muted-foreground">
        <span>© {year} Grow Hub SARL — Entreprise de droit sénégalais. {t("footer.rights")}</span>
        <span>Dakar, Sénégal</span>
      </div>
    </footer>
  );
};

export default Footer;
