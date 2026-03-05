import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, loading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 md:px-12 py-4 bg-background/80 backdrop-blur-xl border-b border-border">
      <Link to="/" className="font-display text-2xl font-bold text-gold-light tracking-wide">
        Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
      </Link>

      <div className="hidden md:flex gap-8 mx-auto">
        {[
          { label: "Fonctionnalités", href: "#fonctionnalites" },
          { label: "Comment ça marche", href: "#comment" },
          { label: "Tarifs", href: "#tarifs" },
          { label: "CGU", href: "/cgu" },
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

      <div className="flex gap-2.5 items-center ml-auto md:ml-0">
        {!loading && user ? (
          <Link
            to="/dashboard"
            className="px-5 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:bg-gold-light hover:-translate-y-0.5 transition-all"
          >
            Mon Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/auth"
              className="px-5 py-2 border border-border rounded-lg text-xs font-bold text-secondary-foreground hover:border-gold hover:text-gold transition-all"
            >
              Connexion
            </Link>
            <Link
              to="/auth"
              className="px-5 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:bg-gold-light hover:-translate-y-0.5 transition-all"
            >
              Commencer gratuitement
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
