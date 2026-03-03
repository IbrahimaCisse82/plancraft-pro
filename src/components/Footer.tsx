import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary pt-12 pb-6 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-10 flex-wrap">
        <div>
          <Link to="/" className="font-display text-xl font-bold text-gold-light block mb-2">
            Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
          </Link>
          <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
            La plateforme de référence pour créer des business plans bankables en Afrique francophone.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">📧 plancraftpro@growhubsenegal.com</p>
        </div>

        <div className="flex gap-16 flex-wrap">
          <div>
            <h4 className="text-[0.7rem] font-bold text-secondary-foreground uppercase tracking-wider mb-3.5">Produit</h4>
            <a href="#fonctionnalites" className="block text-xs text-muted-foreground hover:text-gold-light transition-colors mb-2">Fonctionnalités</a>
            <a href="#tarifs" className="block text-xs text-muted-foreground hover:text-gold-light transition-colors mb-2">Tarifs</a>
            <a href="#comment" className="block text-xs text-muted-foreground hover:text-gold-light transition-colors mb-2">Comment ça marche</a>
            <Link to="/auth" className="block text-xs text-muted-foreground hover:text-gold-light transition-colors mb-2">Se connecter</Link>
          </div>
          <div>
            <h4 className="text-[0.7rem] font-bold text-secondary-foreground uppercase tracking-wider mb-3.5">Légal</h4>
            <Link to="/cgu" className="block text-xs text-muted-foreground hover:text-gold-light transition-colors mb-2">Conditions d'utilisation</Link>
            <Link to="/cgu#confidentialite" className="block text-xs text-muted-foreground hover:text-gold-light transition-colors mb-2">Politique de confidentialité</Link>
            <Link to="/cgu#donnees" className="block text-xs text-muted-foreground hover:text-gold-light transition-colors mb-2">Protection des données</Link>
            <a href="mailto:plancraftpro@growhubsenegal.com" className="block text-xs text-muted-foreground hover:text-gold-light transition-colors mb-2">Contact</a>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-[0.7rem] text-muted-foreground">
        <span>© 2025 Grow Hub SARL — Entreprise de droit sénégalais. Tous droits réservés.</span>
        <span>Dakar, Sénégal · NINEA : XXXXXXXXX</span>
      </div>
    </footer>
  );
};

export default Footer;
