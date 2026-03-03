import { Link } from "react-router-dom";

const sections = [
  { id: "editeur", num: "01", title: "Éditeur de la plateforme", content: (
    <>
      <div className="bg-gold-dim border border-gold/15 rounded-lg p-5 mb-4">
        <p className="text-sm"><strong>PlanCraft Pro</strong> est une plateforme SaaS éditée et exploitée par <strong>Grow Hub SARL</strong>, société à responsabilité limitée de droit sénégalais, immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) de Dakar.</p>
      </div>
      <p><strong>Raison sociale :</strong> Grow Hub SARL</p>
      <p><strong>Forme juridique :</strong> SARL de droit sénégalais</p>
      <p><strong>Email :</strong> <a href="mailto:plancraftpro@growhubsenegal.com" className="text-gold-light">plancraftpro@growhubsenegal.com</a></p>
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
      <p>L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion.</p>
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
      <div className="bg-gold-dim border border-gold/15 rounded-lg p-4 mt-4">
        <p className="text-sm">⚠️ <strong>Absence de remboursement :</strong> Les paiements effectués ne sont pas remboursables sauf disposition contraire.</p>
      </div>
    </>
  )},
  { id: "donnees", num: "05", title: "Données personnelles et confidentialité", content: (
    <>
      <p>Grow Hub SARL collecte les données d'identification, d'utilisation et techniques nécessaires au fonctionnement de la plateforme.</p>
      <p>Les données sont hébergées par <strong>Supabase Inc.</strong> avec chiffrement TLS.</p>
      <p>Conformément à la Loi n° 2008-12 du Sénégal, vous disposez des droits d'accès, de rectification, d'effacement et de portabilité.</p>
      <p>Contact : <a href="mailto:plancraftpro@growhubsenegal.com" className="text-gold-light">plancraftpro@growhubsenegal.com</a></p>
    </>
  )},
  { id: "ia", num: "08", title: "Utilisation de l'Intelligence Artificielle", content: (
    <>
      <ul className="list-disc pl-5 space-y-1">
        <li>Les contenus générés par l'IA sont fournis à titre indicatif</li>
        <li>Les projections financières sont des estimations prévisionnelles</li>
        <li>L'utilisateur assume l'entière responsabilité de l'utilisation des documents</li>
      </ul>
      <div className="bg-gold-dim border border-gold/15 rounded-lg p-4 mt-4">
        <p className="text-sm">⚠️ <strong>Avertissement :</strong> PlanCraft Pro ne remplace pas le conseil d'un expert-comptable ou juriste.</p>
      </div>
    </>
  )},
  { id: "droit", num: "12", title: "Droit applicable et litiges", content: (
    <p>Les présentes CGU sont régies par le <strong>droit sénégalais</strong>. Tout litige sera soumis aux tribunaux de <strong>Dakar</strong>.</p>
  )},
  { id: "contact", num: "13", title: "Contact", content: (
    <div className="bg-gold-dim border border-gold/15 rounded-lg p-5">
      <p className="text-sm">
        <strong>Grow Hub SARL — PlanCraft Pro</strong><br />
        📧 <a href="mailto:plancraftpro@growhubsenegal.com" className="text-gold-light">plancraftpro@growhubsenegal.com</a><br />
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
        <Link to="/" className="font-display text-xl font-bold text-gold-light">
          Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
        </Link>
        <Link to="/" className="text-xs text-secondary-foreground border border-border px-4 py-1.5 rounded-md hover:border-gold hover:text-gold transition-all">
          ← Retour
        </Link>
      </nav>

      {/* Hero */}
      <div className="px-5 md:px-12 pt-20 pb-12 max-w-[860px] mx-auto">
        <div className="text-[0.65rem] font-bold text-gold-light uppercase tracking-[2px] mb-3">Documents légaux</div>
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
          <h3 className="text-xs font-bold text-gold-light uppercase tracking-wider mb-4">Table des matières</h3>
          <ol className="flex flex-col gap-1.5">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-xs text-secondary-foreground hover:text-gold-light transition-colors flex items-center gap-2">
                  <span className="font-mono text-[0.65rem] text-muted-foreground">{String(i + 1).padStart(2, "0")}.</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-12">
            <h2 className="font-display text-2xl font-bold text-gold-light mb-4 pb-2.5 border-b border-border flex items-center gap-2.5">
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
        <Link to="/" className="text-gold-light">Accueil</Link> · <Link to="/auth" className="text-gold-light">Connexion</Link> · <a href="mailto:plancraftpro@growhubsenegal.com" className="text-gold-light">Contact</a>
      </div>
    </div>
  );
};

export default CGUPage;
