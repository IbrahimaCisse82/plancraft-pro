import { Link } from "react-router-dom";
import { ChevronLeft, BookOpen, Sparkles, BarChart3, Download, Share2, Users, Shield, FileText } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const guideSections = [
  {
    icon: BookOpen,
    title: "Premiers pas",
    items: [
      "Créez un compte avec votre email professionnel.",
      "Confirmez votre adresse via le lien reçu par mail.",
      "Suivez le tour interactif (5 étapes) au premier login pour découvrir l'éditeur.",
      "Depuis le Dashboard, cliquez « Nouveau plan » pour démarrer un business plan.",
    ],
  },
  {
    icon: FileText,
    title: "Structurer votre business plan (19 sections)",
    items: [
      "Naviguez entre les sections via la barre latérale gauche.",
      "Chaque section dispose de champs guidés : résumé exécutif, marché, stratégie, équipe, etc.",
      "La sauvegarde est automatique toutes les 5 secondes.",
      "Utilisez le bouton « Versions » pour revenir à un état antérieur (plan Pro).",
    ],
  },
  {
    icon: BarChart3,
    title: "Tableaux financiers",
    items: [
      "8 tableaux interconnectés : CA, charges, P&L, BFR, investissements, financement, trésorerie, bilan.",
      "Les calculs sont automatiques (VAN, TRI, ratios bancaires BCEAO).",
      "Les graphiques Recharts se mettent à jour en temps réel.",
      "La fiche synthèse banquier (plan Pro) résume vos ratios clés pour un dossier de financement.",
    ],
  },
  {
    icon: Sparkles,
    title: "Assistant IA",
    items: [
      "Cliquez sur l'icône IA dans n'importe quelle section pour générer du contenu.",
      "Précisez votre contexte (secteur, marché, montant) pour un résultat pertinent.",
      "Quota mensuel : 10 requêtes (Free), 100 (Pro), illimité (Business).",
      "Vos prompts ne sont jamais utilisés pour entraîner les modèles d'IA.",
    ],
  },
  {
    icon: Download,
    title: "Exports et import Excel",
    items: [
      "Export PDF disponible pour tous les plans.",
      "Export Word et Excel : réservés aux plans Pro et Business.",
      "Import Excel : aperçu des feuilles, mapping manuel des colonnes vers vos sections financières.",
      "Vérifiez toujours la prévisualisation avant de valider l'import.",
    ],
  },
  {
    icon: Share2,
    title: "Partage public",
    items: [
      "Générez un lien public sécurisé depuis le bouton « Partager ».",
      "Définissez une durée d'expiration (24h, 7j, 30j ou illimité).",
      "Le destinataire visualise le plan en lecture seule, sans compte requis.",
      "Suivez le nombre de vues depuis le Dashboard Admin.",
    ],
  },
  {
    icon: Users,
    title: "Espace Coach (multi-clients)",
    items: [
      "Réservé aux plans Pro et Business.",
      "Créez une fiche client (nom, secteur, contact) depuis l'onglet « Clients ».",
      "Associez chaque business plan à un client lors de sa création.",
      "Filtrez votre Dashboard par client pour gérer un portefeuille.",
    ],
  },
  {
    icon: Shield,
    title: "Sécurité et confidentialité",
    items: [
      "Vos données sont chiffrées en transit (TLS) et au repos.",
      "Mots de passe vérifiés contre la base HIBP (Have I Been Pwned).",
      "RLS (Row-Level Security) garantit que vous seul accédez à vos plans.",
      "Conformité RGPD et loi sénégalaise n° 2008-12.",
    ],
  },
];

const GuidePage = () => {
  const { lang } = useI18n();

  return (
    <div className="min-h-screen relative z-10">
      <nav className="sticky top-0 bg-background/90 backdrop-blur-xl border-b border-border px-5 md:px-12 py-3.5 flex items-center justify-between z-50">
        <Link to="/" className="font-display text-xl font-bold text-[hsl(var(--gold-light))]">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-secondary-foreground border border-border px-4 py-1.5 rounded-md hover:border-primary hover:text-primary transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {lang === "fr" ? "Retour" : "Back"}
        </Link>
      </nav>

      <header className="px-5 md:px-12 pt-20 pb-12 max-w-[900px] mx-auto">
        <div className="text-[0.65rem] font-bold text-[hsl(var(--gold-light))] uppercase tracking-[2px] mb-3">
          {lang === "fr" ? "Documentation" : "Documentation"}
        </div>
        <h1 className="font-display text-[2.8rem] font-bold leading-tight mb-4">
          {lang === "fr" ? "Guide utilisateur" : "User guide"}
        </h1>
        <p className="text-sm text-secondary-foreground leading-relaxed max-w-[640px]">
          {lang === "fr"
            ? "Tout ce que vous devez savoir pour rédiger un business plan bankable avec PlanCraft Pro, de la création de compte à l'export final."
            : "Everything you need to know to craft a bankable business plan with PlanCraft Pro, from sign-up to final export."}
        </p>
      </header>

      <main className="max-w-[900px] mx-auto px-5 md:px-12 pb-20">
        <nav aria-label="Sommaire" className="bg-card border border-border rounded-2xl p-6 mb-12">
          <h2 className="text-xs font-bold text-[hsl(var(--gold-light))] uppercase tracking-wider mb-4">
            {lang === "fr" ? "Sommaire" : "Table of contents"}
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {guideSections.map((s, i) => (
              <li key={s.title}>
                <a
                  href={`#g${i}`}
                  className="text-xs text-secondary-foreground hover:text-[hsl(var(--gold-light))] transition-colors flex items-center gap-2"
                >
                  <span className="font-mono text-[0.65rem] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {guideSections.map((s, i) => {
          const Icon = s.icon;
          return (
            <section key={s.title} id={`g${i}`} className="mb-12 scroll-mt-20">
              <h2 className="font-display text-2xl font-bold text-[hsl(var(--gold-light))] mb-4 pb-2.5 border-b border-border flex items-center gap-3">
                <Icon className="w-5 h-5" />
                {String(i + 1).padStart(2, "0")}. {s.title}
              </h2>
              <ul className="text-sm text-secondary-foreground leading-relaxed space-y-2.5 pl-1">
                {s.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="text-[hsl(var(--gold-light))] mt-0.5">›</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <div className="mt-16 p-6 bg-[hsl(var(--gold-dim))] border border-primary/15 rounded-2xl text-center">
          <h3 className="font-display text-xl font-bold mb-2">
            {lang === "fr" ? "Une question ?" : "Need help?"}
          </h3>
          <p className="text-xs text-secondary-foreground mb-4">
            {lang === "fr"
              ? "Notre équipe répond sous 24h ouvrées."
              : "Our team replies within 24 business hours."}
          </p>
          <a
            href="mailto:plancraftpro@growhubsenegal.com"
            className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:opacity-90 transition-all"
          >
            plancraftpro@growhubsenegal.com
          </a>
        </div>
      </main>

      <div className="border-t border-border py-8 px-5 md:px-12 max-w-[900px] mx-auto text-center text-xs text-muted-foreground">
        © 2026 Grow Hub SARL ·{" "}
        <Link to="/cgu" className="text-[hsl(var(--gold-light))] underline underline-offset-2">CGU</Link> ·{" "}
        <Link to="/confidentialite" className="text-[hsl(var(--gold-light))] underline underline-offset-2">
          {lang === "fr" ? "Confidentialité" : "Privacy"}
        </Link>
      </div>
    </div>
  );
};

export default GuidePage;
