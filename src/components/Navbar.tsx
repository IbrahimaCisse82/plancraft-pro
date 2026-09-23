import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { CountdownBanner } from "@/components/shared/Countdown";
import LangToggle from "@/components/shared/LangToggle";

const Navbar = () => {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <CountdownBanner />
    <nav className="flex items-center gap-2 px-4 sm:px-6 md:px-12 py-4 bg-background/80 backdrop-blur-xl border-b border-border">
      <Link to="/" className="font-display text-xl sm:text-2xl font-bold whitespace-nowrap shrink-0 text-gold-light tracking-wide">
        Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
      </Link>

      <div className="hidden md:flex gap-8 mx-auto">
        {[
          { label: t("nav.features"), href: "#fonctionnalites" },
          { label: t("nav.howItWorks"), href: "#comment" },
          { label: t("nav.pricing"), href: "#tarifs" },
          { label: t("nav.cgu"), href: "/cgu" },
        ].map((link) => (
          link.href.startsWith("#") ? (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold text-secondary-foreground tracking-wide hover:text-gold-light transition-colors"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              to={link.href}
              className="text-xs font-semibold text-secondary-foreground tracking-wide hover:text-gold-light transition-colors"
            >
              {link.label}
            </Link>
          )
        ))}
      </div>

      <div className="flex gap-1.5 sm:gap-2.5 items-center ml-auto md:ml-0 shrink-0">
        <LangToggle />
        <ThemeToggle />
        {!loading && user ? (
          <Link
            to="/dashboard"
            className="px-3 sm:px-5 py-2 whitespace-nowrap bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:bg-gold-light hover:-translate-y-0.5 transition-all"
          >
            {t("nav.dashboard")}
          </Link>
        ) : (
          <>
            <Link
              to="/auth"
              className="hidden sm:inline-block px-5 py-2 border border-border rounded-lg text-xs font-bold text-secondary-foreground hover:border-gold hover:text-gold transition-all"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/auth"
              className="px-3 sm:px-5 py-2 whitespace-nowrap bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:bg-gold-light hover:-translate-y-0.5 transition-all"
            >
              {t("nav.start")}
            </Link>
          </>
        )}
      </div>
    </nav>
    </header>
  );
};

export default Navbar;
