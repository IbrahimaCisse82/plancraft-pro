import { Link } from "react-router-dom";

const sections = [
  { id: "editeur", num: "01", title: "Éditeur de la plateforme", content: (
    <>
      <div className="bg-[hsl(var(--gold-dim))] border border-primary/15 rounded-lg p-5 mb-4">
        <p className="text-sm"><strong>PlanCraft Pro</strong> est une plateforme SaaS éditée et exploitée par <strong>Grow Hub SARL</strong>, société à responsabilité limitée de droit sénégalais, immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) de Dakar.</p>
      </div>
      <p><strong>Raison sociale :</strong> Grow Hub SARL</p>
      <p><strong>Forme juridique :</strong> SARL de droit sénégalais</p>
      <p><strong>Email :</strong> <a href="mailto:plancraftpro@growhubsenegal.com" className="text-[hsl(var(--gold-light))]">plancraftpro@growhubsenegal.com</a></p>
      <p><strong>Service client :</strong> Lundi – Vendredi, 8h00 – 18h00 (GMT)</p>
    </>
  )},
  { id: "objet", num: "02", title: "Objet et champ d'application", content: (
    <>
      <p>Les présentes CGU régissent l'accès et l'utilisation de la plateforme PlanCraft Pro.</p>
      <p>La Plateforme propose un service en ligne permettant de créer, structurer, rédiger et exporter des business plans professionnels, avec l'assistance d'outils d'intelligence artificielle et de modèles financiers automatisés.</p>
      <p>Toute utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU.</p>
    </>
  )},
  { id: "acces", num: "03", title: "Accès au service et inscription", content: (
    <>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Création de compte</h3>
      <p>L'accès nécessite la création d'un compte utilisateur avec des informations exactes et à jour.</p>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Sécurité du compte</h3>
      <p>L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion. En cas de perte ou d'utilisation non autorisée, il doit en informer immédiatement Grow Hub SARL.</p>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Âge minimum</h3>
      <p>La Plateforme est réservée aux personnes majeures (18 ans ou plus).</p>
    </>
  )},
  { id: "plans", num: "04", title: "Plans d'abonnement", content: (
    <>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Plan Gratuit</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>2 business plans maximum</li>
        <li>14 sections structurées</li>
        <li>Génération IA limitée à 5 sections</li>
        <li>Export PDF uniquement</li>
      </ul>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Plan Pro</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Business plans illimités</li>
        <li>Génération IA illimitée</li>
        <li>Export Word & PDF</li>
        <li>11 tableaux financiers complets</li>
        <li>Fiche synthèse banquier</li>
        <li>Support email prioritaire</li>
      </ul>
      <div className="bg-[hsl(var(--gold-dim))] border border-primary/15 rounded-lg p-4 mt-4">
        <p className="text-sm">⚠️ <strong>Absence de remboursement :</strong> Les paiements effectués ne sont pas remboursables sauf disposition contraire prévue par la loi applicable.</p>
      </div>
    </>
  )},
  { id: "donnees", num: "05", title: "Données personnelles et confidentialité", content: (
    <>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Données collectées</h3>
      <p>Grow Hub SARL collecte les données suivantes :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
        <li><strong>Données d'utilisation :</strong> business plans créés, historique de navigation</li>
        <li><strong>Données techniques :</strong> adresse IP, navigateur, appareil</li>
      </ul>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Hébergement et sécurité</h3>
      <p>Les données sont hébergées par <strong>Supabase Inc.</strong> avec chiffrement TLS en transit et au repos. Les serveurs sont situés dans l'Union Européenne.</p>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Droits de l'utilisateur</h3>
      <p>Conformément à la Loi n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel au Sénégal et au RGPD, vous disposez des droits suivants :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Droit d'accès à vos données personnelles</li>
        <li>Droit de rectification des données inexactes</li>
        <li>Droit d'effacement ("droit à l'oubli")</li>
        <li>Droit à la portabilité de vos données</li>
        <li>Droit d'opposition au traitement</li>
      </ul>
      <p className="mt-3">Pour exercer vos droits : <a href="mailto:plancraftpro@growhubsenegal.com" className="text-[hsl(var(--gold-light))]">plancraftpro@growhubsenegal.com</a></p>
    </>
  )},
  { id: "propriete", num: "06", title: "Propriété intellectuelle", content: (
    <>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Contenus de la plateforme</h3>
      <p>L'ensemble des éléments de la Plateforme (design, textes, logos, algorithmes, code source) sont la propriété exclusive de Grow Hub SARL et sont protégés par le droit de la propriété intellectuelle.</p>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Contenus de l'utilisateur</h3>
      <p>L'utilisateur conserve l'entière propriété intellectuelle sur les business plans qu'il crée sur la Plateforme. Grow Hub SARL n'acquiert aucun droit sur ces contenus.</p>
      <p>L'utilisateur accorde toutefois à Grow Hub SARL une licence limitée et non exclusive pour stocker, traiter et afficher ses contenus dans le cadre du fonctionnement du service.</p>
    </>
  )},
  { id: "responsabilite", num: "07", title: "Limitation de responsabilité", content: (
    <>
      <p>La Plateforme est fournie "en l'état". Grow Hub SARL ne garantit pas :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>L'absence d'interruptions ou d'erreurs dans le fonctionnement du service</li>
        <li>L'exactitude des contenus générés par l'intelligence artificielle</li>
        <li>La compatibilité avec tous les navigateurs et appareils</li>
        <li>L'obtention de financements ou de résultats commerciaux suite à l'utilisation d'un business plan créé sur la Plateforme</li>
      </ul>
      <div className="bg-destructive/5 border border-destructive/15 rounded-lg p-4 mt-4">
        <p className="text-sm">⚠️ En aucun cas Grow Hub SARL ne pourra être tenue responsable des dommages indirects, pertes de données, manque à gagner ou préjudices commerciaux résultant de l'utilisation de la Plateforme.</p>
      </div>
    </>
  )},
  { id: "ia", num: "08", title: "Utilisation de l'Intelligence Artificielle", content: (
    <>
      <p>La Plateforme intègre des fonctionnalités d'intelligence artificielle pour assister l'utilisateur dans la rédaction de ses business plans.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Les contenus générés par l'IA sont fournis à titre indicatif et de suggestion</li>
        <li>Les projections financières générées sont des estimations prévisionnelles, non des prévisions garanties</li>
        <li>L'utilisateur assume l'entière responsabilité de la validation et de l'utilisation des contenus générés</li>
        <li>L'utilisateur doit vérifier et adapter les contenus générés avant toute utilisation professionnelle</li>
      </ul>
      <div className="bg-[hsl(var(--gold-dim))] border border-primary/15 rounded-lg p-4 mt-4">
        <p className="text-sm">⚠️ <strong>Avertissement :</strong> PlanCraft Pro ne remplace pas le conseil d'un expert-comptable, d'un avocat ou d'un conseiller financier professionnel.</p>
      </div>
    </>
  )},
  { id: "obligations", num: "09", title: "Obligations de l'utilisateur", content: (
    <>
      <p>L'utilisateur s'engage à :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Fournir des informations exactes et à jour lors de son inscription</li>
        <li>Ne pas utiliser la Plateforme à des fins illicites ou contraires aux bonnes mœurs</li>
        <li>Ne pas tenter de contourner les mesures de sécurité de la Plateforme</li>
        <li>Ne pas revendre, copier ou redistribuer le service sans autorisation</li>
        <li>Respecter les droits de propriété intellectuelle de Grow Hub SARL et des tiers</li>
        <li>Ne pas utiliser de robots, scrapers ou outils automatisés pour accéder à la Plateforme</li>
      </ul>
      <p className="mt-3">Tout manquement à ces obligations peut entraîner la suspension ou la résiliation du compte sans préavis ni remboursement.</p>
    </>
  )},
  { id: "resiliation", num: "10", title: "Résiliation et suppression de compte", content: (
    <>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Par l'utilisateur</h3>
      <p>L'utilisateur peut résilier son compte à tout moment depuis les paramètres de son profil. La résiliation entraîne la suppression définitive de toutes les données associées dans un délai de 30 jours.</p>
      <h3 className="text-sm font-bold mt-5 mb-2.5">Par Grow Hub SARL</h3>
      <p>Grow Hub SARL se réserve le droit de suspendre ou supprimer un compte en cas de :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Violation des présentes CGU</li>
        <li>Utilisation frauduleuse ou abusive du service</li>
        <li>Non-paiement des frais d'abonnement</li>
        <li>Inactivité prolongée (plus de 12 mois sans connexion)</li>
      </ul>
    </>
  )},
  { id: "cookies", num: "11", title: "Cookies et traceurs", content: (
    <>
      <p>La Plateforme utilise des cookies essentiels au fonctionnement du service :</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Cookies de session :</strong> maintien de votre connexion</li>
        <li><strong>Cookies de préférences :</strong> langue, thème d'affichage</li>
        <li><strong>Cookies analytiques :</strong> mesure d'audience anonymisée</li>
      </ul>
      <p className="mt-3">Aucun cookie publicitaire ni de pistage tiers n'est utilisé.</p>
    </>
  )},
  { id: "droit", num: "12", title: "Droit applicable et litiges", content: (
    <>
      <p>Les présentes CGU sont régies par le <strong>droit sénégalais</strong>.</p>
      <p>En cas de litige, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours. À défaut d'accord, le litige sera soumis aux tribunaux compétents de <strong>Dakar, Sénégal</strong>.</p>
      <p className="mt-3">Pour tout litige transfrontalier impliquant un consommateur de l'Union Européenne, le règlement RGPD s'applique en complément.</p>
    </>
  )},
  { id: "modifications", num: "13", title: "Modifications des CGU", content: (
    <>
      <p>Grow Hub SARL se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email ou notification sur la Plateforme au moins 15 jours avant l'entrée en vigueur des modifications.</p>
      <p>La poursuite de l'utilisation de la Plateforme après notification vaut acceptation des nouvelles CGU.</p>
    </>
  )},
  { id: "contact", num: "14", title: "Contact", content: (
    <div className="bg-[hsl(var(--gold-dim))] border border-primary/15 rounded-lg p-5">
      <p className="text-sm">
        <strong>Grow Hub SARL — PlanCraft Pro</strong><br />
        📧 <a href="mailto:plancraftpro@growhubsenegal.com" className="text-[hsl(var(--gold-light))]">plancraftpro@growhubsenegal.com</a><br />
        🕐 Lundi – Vendredi, 8h00 – 18h00 (GMT)<br />
        🇸🇳 Dakar, Sénégal
      </p>
    </div>
  )},
];

const CGUPage = () => {
  return (
    <div className="min-h-screen relative z-10">
      {/* Nav */}
      <nav className="sticky top-0 bg-background/90 backdrop-blur-xl border-b border-border px-5 md:px-12 py-3.5 flex items-center justify-between z-50">
        <Link to="/" className="font-display text-xl font-bold text-[hsl(var(--gold-light))]">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </Link>
        <Link to="/" className="text-xs text-secondary-foreground border border-border px-4 py-1.5 rounded-md hover:border-primary hover:text-primary transition-all">
          ← Retour
        </Link>
      </nav>

      {/* Hero */}
      <div className="px-5 md:px-12 pt-20 pb-12 max-w-[860px] mx-auto">
        <div className="text-[0.65rem] font-bold text-[hsl(var(--gold-light))] uppercase tracking-[2px] mb-3">Documents légaux</div>
        <h1 className="font-display text-[2.8rem] font-bold leading-tight mb-4">
          Conditions Générales<br />d'Utilisation
        </h1>
        <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">📅 Dernière mise à jour : 1er mars 2025</span>
          <span className="flex items-center gap-1.5">🏢 Grow Hub SARL</span>
          <span className="flex items-center gap-1.5">🇸🇳 Droit sénégalais</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[860px] mx-auto px-5 md:px-12 pb-20">
        {/* Table of contents */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-12">
          <h3 className="text-xs font-bold text-[hsl(var(--gold-light))] uppercase tracking-wider mb-4">Table des matières</h3>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-xs text-secondary-foreground hover:text-[hsl(var(--gold-light))] transition-colors flex items-center gap-2">
                  <span className="font-mono text-[0.65rem] text-muted-foreground">{String(i + 1).padStart(2, "0")}.</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-12 scroll-mt-20">
            <h2 className="font-display text-2xl font-bold text-[hsl(var(--gold-light))] mb-4 pb-2.5 border-b border-border flex items-center gap-2.5">
              {section.num}. {section.title}
            </h2>
            <div className="text-sm text-secondary-foreground leading-relaxed space-y-3.5">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8 px-5 md:px-12 max-w-[860px] mx-auto text-center text-xs text-muted-foreground leading-relaxed">
        © 2025 <strong className="text-secondary-foreground">Grow Hub SARL</strong> — Tous droits réservés.<br />
        <Link to="/" className="text-[hsl(var(--gold-light))]">Accueil</Link> · <Link to="/auth" className="text-[hsl(var(--gold-light))]">Connexion</Link> · <a href="mailto:plancraftpro@growhubsenegal.com" className="text-[hsl(var(--gold-light))]">Contact</a>
      </div>
    </div>
  );
};

export default CGUPage;
