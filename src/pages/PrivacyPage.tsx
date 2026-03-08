import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_-10%_50%,_hsl(43_55%_54%_/_0.08),_transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-[800px] mx-auto px-5 md:px-8 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <h1 className="font-display text-4xl font-bold mb-2">Politique de Confidentialité</h1>
        <p className="text-sm text-muted-foreground mb-10">Dernière mise à jour : 8 mars 2026</p>

        <div className="space-y-8 text-sm text-secondary-foreground leading-relaxed">

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Identité du responsable de traitement</h2>
            <p>
              La plateforme <strong className="text-foreground">PlanCraft Pro</strong> est éditée par <strong className="text-foreground">Grow Hub SARL</strong>, 
              entreprise de droit sénégalais immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) de Dakar.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Siège social : Dakar, Sénégal</li>
              <li>Email : <a href="mailto:plancraftpro@growhubsenegal.com" className="text-primary hover:opacity-80 transition-opacity">plancraftpro@growhubsenegal.com</a></li>
              <li>Délégué à la protection des données (DPO) : joignable à l'adresse ci-dessus</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Données collectées</h2>
            <p>Nous collectons les catégories de données suivantes :</p>
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-card border border-border rounded-lg">
                <h3 className="font-bold text-foreground mb-1">Données d'identification</h3>
                <p>Nom complet, adresse email, mot de passe (hashé), photo de profil (optionnelle).</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <h3 className="font-bold text-foreground mb-1">Données de contenu</h3>
                <p>Business plans rédigés (textes, tableaux financiers, analyses SWOT), versions sauvegardées, fichiers exportés.</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <h3 className="font-bold text-foreground mb-1">Données techniques</h3>
                <p>Adresse IP, type de navigateur, système d'exploitation, pages visitées, horodatage des connexions.</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <h3 className="font-bold text-foreground mb-1">Données d'utilisation de l'IA</h3>
                <p>Prompts envoyés à l'assistant IA, réponses générées (non conservées après la session), métadonnées de requête.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Finalités du traitement</h2>
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Création et gestion de votre compte utilisateur</li>
              <li>Sauvegarde et restauration de vos business plans</li>
              <li>Fonctionnement de l'assistant IA (génération de contenu contextuel)</li>
              <li>Export de documents (PDF, DOCX)</li>
              <li>Amélioration de la plateforme et analyse d'usage (données anonymisées)</li>
              <li>Communication de service (emails transactionnels)</li>
              <li>Respect des obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Base légale du traitement</h2>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary">
                    <th className="text-left px-4 py-2.5 font-bold text-foreground border-b border-border">Finalité</th>
                    <th className="text-left px-4 py-2.5 font-bold text-foreground border-b border-border">Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Gestion du compte", "Exécution du contrat"],
                    ["Sauvegarde des business plans", "Exécution du contrat"],
                    ["Assistant IA", "Consentement (activation volontaire)"],
                    ["Analyses d'usage", "Intérêt légitime"],
                    ["Emails transactionnels", "Exécution du contrat"],
                    ["Obligations légales", "Obligation légale"],
                  ].map(([finalite, base], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                      <td className="px-4 py-2 border-b border-border/50">{finalite}</td>
                      <td className="px-4 py-2 border-b border-border/50">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Destinataires des données</h2>
            <p>Vos données peuvent être communiquées aux destinataires suivants :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-foreground">Hébergeur :</strong> nos données sont hébergées sur des serveurs sécurisés conformes aux normes internationales de sécurité</li>
              <li><strong className="text-foreground">Fournisseur IA :</strong> les prompts sont transmis à nos fournisseurs d'intelligence artificielle pour la génération de contenu. Aucune donnée n'est conservée après traitement</li>
              <li><strong className="text-foreground">Prestataires techniques :</strong> services d'envoi d'emails, d'analyse et de monitoring</li>
            </ul>
            <p className="mt-2">Nous ne vendons, ne louons et ne partageons jamais vos données personnelles à des tiers à des fins commerciales.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Transfert de données hors du Sénégal</h2>
            <p>
              Certaines données peuvent être transférées vers des serveurs situés en dehors du Sénégal (Union Européenne, États-Unis) 
              dans le cadre de l'hébergement et des services d'IA. Ces transferts sont encadrés par des garanties appropriées 
              (clauses contractuelles types, certifications de sécurité) conformément à la loi n° 2008-12 du 25 janvier 2008 
              sur la protection des données à caractère personnel au Sénégal et au RGPD.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Durée de conservation</h2>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary">
                    <th className="text-left px-4 py-2.5 font-bold text-foreground border-b border-border">Type de données</th>
                    <th className="text-left px-4 py-2.5 font-bold text-foreground border-b border-border">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Données de compte", "Durée de l'inscription + 3 ans après suppression"],
                    ["Business plans", "Durée de l'inscription + 6 mois après suppression du compte"],
                    ["Versions sauvegardées", "Durée de l'inscription"],
                    ["Données d'utilisation IA", "Non conservées après la session"],
                    ["Logs techniques", "12 mois"],
                    ["Données de facturation", "10 ans (obligation légale)"],
                  ].map(([type, duree], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                      <td className="px-4 py-2 border-b border-border/50">{type}</td>
                      <td className="px-4 py-2 border-b border-border/50">{duree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Vos droits</h2>
            <p>
              Conformément à la loi sénégalaise n° 2008-12 et au RGPD (pour les utilisateurs situés dans l'UE), 
              vous disposez des droits suivants :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {[
                { title: "Droit d'accès", desc: "Obtenir une copie de vos données personnelles" },
                { title: "Droit de rectification", desc: "Corriger des données inexactes ou incomplètes" },
                { title: "Droit à l'effacement", desc: "Demander la suppression de vos données" },
                { title: "Droit à la portabilité", desc: "Recevoir vos données dans un format structuré" },
                { title: "Droit d'opposition", desc: "Vous opposer au traitement de vos données" },
                { title: "Droit à la limitation", desc: "Restreindre le traitement de vos données" },
              ].map((right) => (
                <div key={right.title} className="p-3 bg-card border border-border rounded-lg">
                  <h3 className="font-bold text-foreground text-xs mb-0.5">{right.title}</h3>
                  <p className="text-[0.7rem] text-muted-foreground">{right.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-3">
              Pour exercer vos droits, contactez-nous à{" "}
              <a href="mailto:plancraftpro@growhubsenegal.com" className="text-primary hover:opacity-80 transition-opacity">
                plancraftpro@growhubsenegal.com
              </a>. 
              Nous répondrons dans un délai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">9. Sécurité des données</h2>
            <p>Nous mettons en œuvre les mesures de sécurité suivantes :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Chiffrement des données en transit (TLS/SSL) et au repos</li>
              <li>Mots de passe hashés avec des algorithmes cryptographiques modernes (bcrypt)</li>
              <li>Politiques de sécurité au niveau des lignes (Row-Level Security) sur toutes les tables</li>
              <li>Authentification par jetons JWT avec renouvellement automatique</li>
              <li>Contrôle d'accès basé sur les rôles (RBAC)</li>
              <li>Sauvegardes automatiques régulières</li>
              <li>Audits de sécurité périodiques</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">10. Cookies et technologies similaires</h2>
            <p>PlanCraft Pro utilise les technologies suivantes :</p>
            <div className="overflow-x-auto border border-border rounded-lg mt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary">
                    <th className="text-left px-4 py-2.5 font-bold text-foreground border-b border-border">Type</th>
                    <th className="text-left px-4 py-2.5 font-bold text-foreground border-b border-border">Finalité</th>
                    <th className="text-left px-4 py-2.5 font-bold text-foreground border-b border-border">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Session d'authentification", "Maintien de la connexion", "7 jours"],
                    ["Préférences de thème", "Mémorisation du mode clair/sombre", "Indéfinie"],
                    ["localStorage", "Sauvegarde locale temporaire", "Session"],
                  ].map(([type, finalite, duree], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                      <td className="px-4 py-2 border-b border-border/50">{type}</td>
                      <td className="px-4 py-2 border-b border-border/50">{finalite}</td>
                      <td className="px-4 py-2 border-b border-border/50">{duree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2">
              PlanCraft Pro n'utilise pas de cookies publicitaires ni de traceurs tiers à des fins marketing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">11. Traitement par intelligence artificielle</h2>
            <p>
              L'assistant IA de PlanCraft Pro traite vos prompts et le contenu de la section en cours pour générer des suggestions. 
              Concernant l'utilisation de l'IA :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Les conversations IA ne sont <strong className="text-foreground">pas conservées</strong> après la session</li>
              <li>Le contenu de vos business plans n'est <strong className="text-foreground">jamais utilisé pour entraîner</strong> des modèles d'IA</li>
              <li>Les données transmises aux fournisseurs d'IA sont limitées au strict nécessaire (contexte de la section)</li>
              <li>Vous êtes seul responsable de la vérification et de l'utilisation du contenu généré par l'IA</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">12. Mineurs</h2>
            <p>
              PlanCraft Pro n'est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas sciemment 
              de données personnelles auprès de mineurs. Si vous êtes parent ou tuteur et estimez que votre enfant 
              nous a fourni des données personnelles, contactez-nous pour les faire supprimer.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">13. Modifications de la politique</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
              Les modifications seront publiées sur cette page avec la date de mise à jour. 
              En cas de modification substantielle, nous vous informerons par email ou via une notification dans l'application.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">14. Autorité de contrôle</h2>
            <p>
              Si vous estimez que le traitement de vos données n'est pas conforme, vous pouvez adresser une réclamation à :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-foreground">Commission de Protection des Données Personnelles (CDP)</strong> du Sénégal — <a href="https://www.cdp.sn" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 transition-opacity">www.cdp.sn</a></li>
              <li>Pour les utilisateurs dans l'UE : la <strong className="text-foreground">CNIL</strong> ou l'autorité de contrôle de votre pays de résidence</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">15. Contact</h2>
            <div className="p-4 bg-card border border-border rounded-lg">
              <p>
                Pour toute question relative à cette politique de confidentialité ou à vos données personnelles :
              </p>
              <ul className="list-none mt-2 space-y-1">
                <li>📧 <a href="mailto:plancraftpro@growhubsenegal.com" className="text-primary hover:opacity-80 transition-opacity">plancraftpro@growhubsenegal.com</a></li>
                <li>🏢 Grow Hub SARL — Dakar, Sénégal</li>
              </ul>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <Link to="/cgu" className="text-primary hover:opacity-80 transition-opacity">Conditions Générales d'Utilisation</Link>
          {" · "}
          <Link to="/" className="text-primary hover:opacity-80 transition-opacity">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
