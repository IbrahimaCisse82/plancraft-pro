import { Link } from "react-router-dom";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877f2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const AuthPage = () => {
  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Background art */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_-10%_50%,_hsl(43_55%_54%_/_0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_110%_20%,_hsl(217_90%_64%_/_0.07),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_110%,_hsl(155_62%_53%_/_0.05),_transparent_60%)]" />
      </div>
      {/* Grid overlay */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(hsl(0_0%_100%_/_0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%_/_0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

      {/* Left pitch */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-[72px] relative z-10">
        <Link to="/" className="font-display text-2xl font-bold text-gold-light tracking-wide block mb-16">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-gold/25 rounded-full text-[0.62rem] font-bold text-gold-light uppercase tracking-[1.5px] bg-gold-dim mb-6 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-dot" />
          ✦ Afrique francophone · SaaS
        </div>

        <h1 className="font-display text-[clamp(2.4rem,4vw,3.8rem)] font-bold leading-[1.07] mb-5">
          Créez votre<br />business plan<br />
          <em className="italic text-gold-light">bankable</em>
        </h1>

        <p className="text-sm text-secondary-foreground leading-relaxed max-w-[480px] mb-12">
          PlanCraft Pro est la plateforme de référence pour créer des business plans complets,
          professionnels et prêts pour les banques — avec l'assistance de l'intelligence artificielle.
        </p>

        <div className="flex flex-wrap gap-2">
          {["📊 11 tableaux financiers", "✦ Génération IA", "📄 Export Word & PDF", "☁️ Multi-appareils", "💼 Fiche synthèse banquier", "🔒 Données sécurisées"].map((pill) => (
            <div key={pill} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-card border border-border rounded-full text-xs text-secondary-foreground">
              {pill}
            </div>
          ))}
        </div>
      </div>

      {/* Right auth panel */}
      <div className="relative z-10 w-full lg:w-[460px] shrink-0 bg-card border-l border-border flex flex-col items-center justify-center px-8 md:px-12 py-14">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <Link to="/" className="font-display text-xl font-bold text-gold-light block text-center mb-10">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </Link>

        <h2 className="text-center font-display text-3xl font-bold mb-2.5">Bienvenue</h2>
        <p className="text-center text-xs text-secondary-foreground leading-relaxed mb-9 max-w-[300px]">
          Connectez-vous ou créez un compte gratuitement — en un seul clic, sans mot de passe.
        </p>

        {/* Google OAuth */}
        <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl bg-surface-2 border border-border-strong text-foreground font-bold text-sm cursor-pointer hover:border-foreground/20 hover:bg-surface-2/80 transition-all mb-3 relative overflow-hidden group">
          <div className="w-[22px] h-[22px] shrink-0 flex items-center justify-center"><GoogleIcon /></div>
          <div className="flex-1 text-left">
            Continuer avec Google
            <div className="text-[0.6rem] text-foreground/50 font-normal">Compte Google personnel ou professionnel</div>
          </div>
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/[0.04] transition-all" />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2 w-full text-[0.65rem] text-muted-foreground font-semibold uppercase tracking-wider">
          <div className="flex-1 h-px bg-border" />
          ou
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Facebook OAuth */}
        <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl bg-info/10 border border-info/30 text-info font-bold text-sm cursor-pointer hover:bg-info/15 hover:border-info/50 transition-all mt-3 relative overflow-hidden group">
          <div className="w-[22px] h-[22px] shrink-0 flex items-center justify-center"><FacebookIcon /></div>
          <div className="flex-1 text-left">
            Continuer avec Facebook
            <div className="text-[0.6rem] opacity-60 font-normal">Profil Facebook personnel ou professionnel</div>
          </div>
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/[0.04] transition-all" />
        </button>

        {/* Info box */}
        <div className="mt-5 p-3 px-4 bg-gold-dim border border-gold/15 rounded-lg text-xs text-secondary-foreground leading-relaxed w-full">
          <strong className="text-gold-light">Première connexion ?</strong><br />
          Un compte PlanCraft Pro sera automatiquement créé avec votre profil. Aucune information supplémentaire requise.
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-border w-full text-center text-[0.67rem] text-muted-foreground leading-relaxed">
          En vous connectant, vous acceptez nos<br />
          <Link to="/cgu" className="text-gold-light hover:opacity-80 transition-opacity">Conditions Générales d'Utilisation</Link>
          {" "}et notre{" "}
          <Link to="/cgu#confidentialite" className="text-gold-light hover:opacity-80 transition-opacity">Politique de confidentialité</Link>
          <br /><br />
          <strong className="text-secondary-foreground">Grow Hub SARL</strong> · Entreprise de droit sénégalais<br />
          <a href="mailto:plancraftpro@growhubsenegal.com" className="text-gold-light hover:opacity-80 transition-opacity">
            plancraftpro@growhubsenegal.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
