import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="font-display text-8xl font-bold text-[hsl(var(--gold-light))] mb-4">404</div>
        <h1 className="font-display text-2xl font-bold mb-2">Page introuvable</h1>
        <p className="text-sm text-muted-foreground mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 transition-all"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
