/**
 * Sector-specific templates pré-remplis pour démarrer un Business Plan.
 * Chaque template fournit un secteur, des sections narratives seedées et
 * quelques lignes financières d'amorçage. L'utilisateur peut tout modifier.
 */
import type { BPContent } from "@/types/businessPlan";

export interface SectorTemplate {
  id: string;
  labelFr: string;
  labelEn: string;
  emoji: string;
  secteur: string; // pré-rempli dans le champ "secteur"
  descriptionFr: string;
  descriptionEn: string;
  build: () => BPContent;
}

// Helper: ligne financière → objet { Année 1, Année 2, Année 3 }
const yrs = (a: number, b: number, c: number) => ({
  "Année 1": String(a),
  "Année 2": String(b),
  "Année 3": String(c),
});

export const SECTOR_TEMPLATES: SectorTemplate[] = [
  {
    id: "restaurant",
    labelFr: "Restaurant / Restauration",
    labelEn: "Restaurant / Food Service",
    emoji: "🍽️",
    secteur: "Tourisme / Hôtellerie",
    descriptionFr: "Restaurant traditionnel, fast-food, food-truck",
    descriptionEn: "Traditional restaurant, fast-food, food-truck",
    build: () => ({
      resume:
        "Création d'un restaurant proposant une cuisine de qualité dans un cadre chaleureux. " +
        "Capacité de 40 couverts, ouvert midi et soir, avec un service de livraison à domicile. " +
        "Cible : actifs urbains et familles. Objectif CA Année 1 : 60 M FCFA.",
      presentation:
        "Le restaurant se positionne sur le segment milieu de gamme avec un ticket moyen de 8 000 FCFA. " +
        "Carte renouvelée chaque saison, produits frais locaux, ambiance soignée.",
      marche:
        "Le secteur de la restauration en zone urbaine connaît une croissance annuelle de 7%. " +
        "Demande forte en restauration de qualité accessible. Études INS et observations terrain à compléter.",
      concurrence:
        "Concurrents directs : 3 restaurants dans un rayon de 1 km. Différenciation par la qualité produit, " +
        "le service personnalisé et la digitalisation (réservation en ligne, fidélité).",
      strategie_commerciale:
        "Programme de fidélité, partenariats entreprises pour les déjeuners, plateformes de livraison " +
        "(Glovo, Yango Deli). Objectif 80 couverts/jour en rythme de croisière.",
      operations:
        "Cuisine équipée professionnelle, 2 services par jour. Approvisionnement quotidien marché de gros. " +
        "Norme HACCP appliquée. Logiciel de caisse intégré.",
      rh:
        "8 collaborateurs : 1 chef, 2 cuisiniers, 1 plongeur, 3 serveurs, 1 caissier. " +
        "Formation initiale 2 semaines. Recrutement local en priorité.",
      investissements: {
        "Aménagement / Travaux": { Montant: "15000000" },
        "Équipements / Matériel": { Montant: "12000000" },
        "Mobilier de bureau": { Montant: "4000000" },
        "Matériel informatique": { Montant: "1500000" },
        "Stock initial": { Montant: "2500000" },
        "Trésorerie de départ": { Montant: "5000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(60_000_000, 78_000_000, 95_000_000),
        "Achats de marchandises": yrs(21_000_000, 27_000_000, 33_000_000),
        "Charges de personnel": yrs(18_000_000, 21_000_000, 24_000_000),
        "Loyer": yrs(4_800_000, 4_800_000, 4_800_000),
      },
    }),
  },
  {
    id: "tech-saas",
    labelFr: "Tech / SaaS",
    labelEn: "Tech / SaaS",
    emoji: "💻",
    secteur: "Technologie / IT",
    descriptionFr: "Plateforme logicielle B2B en abonnement",
    descriptionEn: "B2B subscription software platform",
    build: () => ({
      resume:
        "Lancement d'une plateforme SaaS B2B destinée aux PME pour automatiser un processus métier clé. " +
        "Modèle d'abonnement mensuel, 3 niveaux de prix. Objectif 200 clients payants à 24 mois.",
      presentation:
        "Application web et mobile responsive. Architecture cloud scalable. " +
        "Différenciation par l'UX simple et le support en français.",
      marche:
        "Marché des PME africaines en pleine digitalisation. " +
        "TAM estimé à 50 000 entreprises cibles dans la zone UEMOA. Croissance digitale +20%/an.",
      concurrence:
        "Concurrents internationaux peu adaptés au contexte local (langue, paiement, support). " +
        "Avantage : pricing local, intégrations mobile money, accompagnement humain.",
      strategie_commerciale:
        "Acquisition via content marketing, SEO, démos en ligne, partenariats experts-comptables. " +
        "Free trial 14 jours, conversion ciblée 8%.",
      marketing:
        "Budget marketing 15% du CA. Canaux : LinkedIn, Google Ads, webinaires, événements PME.",
      operations:
        "Infrastructure cloud (AWS/Scaleway). CI/CD automatisé. Monitoring 24/7. " +
        "SLA 99.5% de disponibilité.",
      rh:
        "Équipe initiale : 2 fondateurs, 2 développeurs, 1 commercial, 1 support. " +
        "Recrutement progressif au rythme de la croissance ARR.",
      investissements: {
        "Frais d'établissement": { Montant: "3000000" },
        "Matériel informatique": { Montant: "5000000" },
        "Aménagement / Travaux": { Montant: "2000000" },
        "Trésorerie de départ": { Montant: "20000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(15_000_000, 60_000_000, 150_000_000),
        "Charges de personnel": yrs(30_000_000, 60_000_000, 90_000_000),
        "Télécommunications": yrs(3_000_000, 6_000_000, 12_000_000),
        "Publicité / Marketing": yrs(4_500_000, 12_000_000, 22_500_000),
      },
    }),
  },
  {
    id: "agriculture",
    labelFr: "Agriculture / Élevage",
    labelEn: "Agriculture / Livestock",
    emoji: "🌾",
    secteur: "Agriculture",
    descriptionFr: "Exploitation agricole, maraîchage, élevage",
    descriptionEn: "Farming, market gardening, livestock",
    build: () => ({
      resume:
        "Mise en place d'une exploitation agricole de 10 hectares (maraîchage + petit élevage). " +
        "Production destinée aux marchés urbains et aux supermarchés. Objectif CA Année 1 : 25 M FCFA.",
      presentation:
        "Exploitation moderne avec irrigation goutte-à-goutte, semences certifiées, " +
        "rotation des cultures. Approche agroécologique.",
      marche:
        "Demande urbaine forte en produits frais locaux. Marché national en croissance. " +
        "Opportunités d'export régional.",
      concurrence:
        "Concurrence majoritairement informelle. Avantage : régularité de l'approvisionnement, " +
        "qualité constante, traçabilité.",
      strategie_commerciale:
        "Contrats d'approvisionnement avec 3 enseignes de distribution. " +
        "Vente directe via marché de gros et plateforme de livraison.",
      operations:
        "Cycles de production planifiés sur 12 mois. Stockage frigorifique. " +
        "Conditionnement sur site.",
      rh:
        "1 chef d'exploitation, 1 technicien agricole, 6 ouvriers permanents, " +
        "saisonniers selon récoltes.",
      investissements: {
        "Terrain / Local": { Montant: "8000000" },
        "Aménagement / Travaux": { Montant: "12000000" },
        "Équipements / Matériel": { Montant: "15000000" },
        "Véhicules": { Montant: "8000000" },
        "Stock initial": { Montant: "3000000" },
        "Trésorerie de départ": { Montant: "5000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(25_000_000, 38_000_000, 50_000_000),
        "Achats de marchandises": yrs(7_500_000, 11_000_000, 14_000_000),
        "Charges de personnel": yrs(9_000_000, 12_000_000, 15_000_000),
      },
    }),
  },
  {
    id: "commerce",
    labelFr: "Commerce / Boutique",
    labelEn: "Retail / Shop",
    emoji: "🛍️",
    secteur: "Commerce",
    descriptionFr: "Boutique de détail, prêt-à-porter, alimentation",
    descriptionEn: "Retail shop, fashion, grocery",
    build: () => ({
      resume:
        "Ouverture d'une boutique de détail proposant des produits sélectionnés. " +
        "Local de 80 m² en zone à fort passage. Objectif CA Année 1 : 45 M FCFA.",
      presentation:
        "Sélection rigoureuse de produits, mise en scène soignée, conseil personnalisé. " +
        "Présence digitale (Instagram, WhatsApp Business) pour drainer du trafic.",
      marche:
        "Pouvoir d'achat urbain en croissance. Clientèle 25-45 ans recherchant qualité et tendance.",
      concurrence:
        "5 boutiques similaires dans la zone. Différenciation par l'assortiment, " +
        "le service client et la fidélisation.",
      strategie_commerciale:
        "Programme fidélité, ventes privées, livraison locale gratuite à partir de 50 000 FCFA. " +
        "Animation commerciale chaque mois.",
      operations:
        "Rotation des stocks 8x/an. Approvisionnement mensuel (import + local). " +
        "Caisse digitale connectée.",
      rh:
        "1 gérant, 2 vendeurs, 1 livreur à temps partiel.",
      investissements: {
        "Aménagement / Travaux": { Montant: "8000000" },
        "Mobilier de bureau": { Montant: "3000000" },
        "Matériel informatique": { Montant: "1500000" },
        "Stock initial": { Montant: "12000000" },
        "Trésorerie de départ": { Montant: "4000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(45_000_000, 58_000_000, 72_000_000),
        "Achats de marchandises": yrs(27_000_000, 34_000_000, 42_000_000),
        "Charges de personnel": yrs(7_200_000, 8_400_000, 9_600_000),
        "Loyer": yrs(3_600_000, 3_600_000, 3_960_000),
      },
    }),
  },
  {
    id: "services",
    labelFr: "Services / Conseil",
    labelEn: "Services / Consulting",
    emoji: "💼",
    secteur: "Services",
    descriptionFr: "Cabinet de conseil, agence, bureau d'études",
    descriptionEn: "Consulting firm, agency, design office",
    build: () => ({
      resume:
        "Création d'un cabinet de services professionnels spécialisé. " +
        "Modèle B2B, missions au forfait et au temps passé. Objectif 8 clients récurrents Année 1.",
      presentation:
        "Expertise reconnue, méthodologie éprouvée, livrables de qualité. " +
        "Mix consultants seniors / juniors pour optimiser la rentabilité.",
      marche:
        "Besoin croissant des entreprises en accompagnement spécialisé. " +
        "Marché peu saturé sur le segment ciblé.",
      concurrence:
        "Grands cabinets internationaux coûteux + freelances peu structurés. " +
        "Positionnement intermédiaire : qualité grand cabinet, agilité d'une boutique.",
      strategie_commerciale:
        "Acquisition via réseau, recommandations, contenu thought-leadership (LinkedIn, blog). " +
        "TJM moyen 250 000 FCFA. Objectif taux d'occupation 70%.",
      operations:
        "Méthodologie de mission documentée. Outils collaboratifs cloud. " +
        "Reporting client mensuel systématique.",
      rh:
        "2 associés, 2 consultants seniors, 3 consultants juniors, 1 assistant administratif.",
      investissements: {
        "Aménagement / Travaux": { Montant: "5000000" },
        "Mobilier de bureau": { Montant: "3500000" },
        "Matériel informatique": { Montant: "6000000" },
        "Frais d'établissement": { Montant: "2000000" },
        "Trésorerie de départ": { Montant: "8000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(48_000_000, 72_000_000, 96_000_000),
        "Charges de personnel": yrs(28_000_000, 38_000_000, 48_000_000),
        "Loyer": yrs(3_000_000, 3_000_000, 3_000_000),
        "Télécommunications": yrs(1_200_000, 1_500_000, 1_800_000),
      },
    }),
  },
  {
    id: "sante",
    labelFr: "Santé / Clinique",
    labelEn: "Health / Clinic",
    emoji: "🏥",
    secteur: "Santé",
    descriptionFr: "Cabinet médical, pharmacie, clinique privée",
    descriptionEn: "Medical office, pharmacy, private clinic",
    build: () => ({
      resume:
        "Ouverture d'un centre de santé de proximité offrant consultations généralistes, " +
        "soins infirmiers et petite imagerie. Objectif 25 patients/jour à 18 mois.",
      presentation:
        "Plateau technique moderne, 3 salles de consultation, laboratoire d'analyses partenaire. " +
        "Personnel qualifié et accueil patient digitalisé.",
      marche:
        "Demande de soins de proximité forte en zone urbaine. Croissance soutenue par la classe moyenne " +
        "et l'assurance maladie en expansion.",
      concurrence:
        "Centres publics saturés, cliniques privées coûteuses. Positionnement qualité/prix accessible, " +
        "rendez-vous en ligne, tiers payant assurances.",
      strategie_commerciale:
        "Conventionnement avec mutuelles et entreprises. Communication locale, application mobile patient.",
      operations:
        "Horaires étendus 7j/7. Stérilisation rigoureuse, dossiers patients informatisés, " +
        "conformité réglementaire ministère de la Santé.",
      rh:
        "2 médecins, 3 infirmiers, 1 sage-femme, 2 agents d'accueil, 1 agent d'entretien.",
      investissements: {
        "Aménagement / Travaux": { Montant: "25000000" },
        "Équipements / Matériel": { Montant: "30000000" },
        "Mobilier de bureau": { Montant: "5000000" },
        "Matériel informatique": { Montant: "3000000" },
        "Trésorerie de départ": { Montant: "10000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(80_000_000, 110_000_000, 140_000_000),
        "Achats de marchandises": yrs(20_000_000, 27_000_000, 35_000_000),
        "Charges de personnel": yrs(36_000_000, 45_000_000, 54_000_000),
        "Loyer": yrs(6_000_000, 6_000_000, 6_000_000),
      },
    }),
  },
  {
    id: "education",
    labelFr: "Éducation / Formation",
    labelEn: "Education / Training",
    emoji: "🎓",
    secteur: "Éducation",
    descriptionFr: "École, centre de formation, e-learning",
    descriptionEn: "School, training center, e-learning",
    build: () => ({
      resume:
        "Création d'un centre de formation professionnelle spécialisé en métiers du numérique. " +
        "Capacité 120 apprenants/an, cycles de 6 mois. Certification reconnue.",
      presentation:
        "Pédagogie par projet, formateurs experts du secteur, partenariats entreprises pour stages " +
        "et insertion. Plateforme e-learning complémentaire.",
      marche:
        "Forte demande en compétences numériques. Chômage des jeunes diplômés et besoin de reconversion " +
        "alimentent une demande structurelle.",
      concurrence:
        "Universités peu adaptées au marché, écoles privées coûteuses. " +
        "Positionnement : court, pratique, employabilité forte.",
      strategie_commerciale:
        "Journées portes ouvertes, témoignages anciens, financement OPCO/CPF, " +
        "partenariats grandes écoles et entreprises tech.",
      operations:
        "3 promotions/an, 60% présentiel + 40% en ligne. Évaluations continues, projet final, " +
        "mentorat individuel.",
      rh:
        "1 directeur pédagogique, 4 formateurs permanents, 8 vacataires, 2 admin, 1 commercial.",
      investissements: {
        "Aménagement / Travaux": { Montant: "10000000" },
        "Mobilier de bureau": { Montant: "5000000" },
        "Matériel informatique": { Montant: "12000000" },
        "Frais d'établissement": { Montant: "3000000" },
        "Trésorerie de départ": { Montant: "8000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(54_000_000, 84_000_000, 120_000_000),
        "Charges de personnel": yrs(24_000_000, 36_000_000, 48_000_000),
        "Loyer": yrs(4_800_000, 4_800_000, 4_800_000),
        "Publicité / Marketing": yrs(4_000_000, 6_000_000, 8_000_000),
      },
    }),
  },
  {
    id: "immobilier",
    labelFr: "Immobilier / BTP",
    labelEn: "Real Estate / Construction",
    emoji: "🏗️",
    secteur: "Immobilier / BTP",
    descriptionFr: "Promotion immobilière, agence, construction",
    descriptionEn: "Real estate development, agency, construction",
    build: () => ({
      resume:
        "Lancement d'une société de promotion immobilière sur le segment résidentiel moyen de gamme. " +
        "Première opération : 24 logements sur 2 ans. Marge brute cible 22%.",
      presentation:
        "Conception bioclimatique, finitions soignées, services à valeur ajoutée (domotique, sécurité). " +
        "Process de commercialisation digitalisé.",
      marche:
        "Déficit de logements urbains structurel. Diaspora et classe moyenne montante " +
        "représentent une demande solvable importante.",
      concurrence:
        "Promoteurs établis sur le haut de gamme et l'informel sur le bas. " +
        "Notre positionnement intermédiaire reste peu adressé avec qualité constante.",
      strategie_commerciale:
        "Showroom + visites virtuelles 3D, paiement échelonné, partenariats bancaires pour crédit acquéreur.",
      operations:
        "Maîtrise d'ouvrage interne, sous-traitance corps d'état spécialisés. " +
        "Contrôle qualité hebdomadaire, certification environnementale.",
      rh:
        "1 directeur général, 1 directeur technique, 2 conducteurs de travaux, 2 commerciaux, " +
        "1 architecte, 2 admin/compta.",
      investissements: {
        "Terrain / Local": { Montant: "150000000" },
        "Frais d'établissement": { Montant: "5000000" },
        "Matériel informatique": { Montant: "4000000" },
        "Véhicules": { Montant: "15000000" },
        "Trésorerie de départ": { Montant: "50000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(0, 600_000_000, 720_000_000),
        "Achats de marchandises": yrs(0, 420_000_000, 504_000_000),
        "Charges de personnel": yrs(45_000_000, 60_000_000, 72_000_000),
      },
    }),
  },
  {
    id: "transport",
    labelFr: "Transport / Logistique",
    labelEn: "Transport / Logistics",
    emoji: "🚚",
    secteur: "Transport / Logistique",
    descriptionFr: "Transport de marchandises, VTC, livraison",
    descriptionEn: "Freight transport, ride-hailing, delivery",
    build: () => ({
      resume:
        "Création d'une société de transport de marchandises B2B avec une flotte initiale de 5 véhicules. " +
        "Couverture nationale, contrats récurrents avec industriels et distributeurs.",
      presentation:
        "Flotte récente, géolocalisation temps réel, traçabilité colis, assurance tous risques. " +
        "Plateforme client de suivi en ligne.",
      marche:
        "Croissance du e-commerce et de la distribution moderne. " +
        "Besoin de fiabilité que peu d'acteurs informels satisfont.",
      concurrence:
        "Transporteurs informels (prix bas, qualité aléatoire) et grands logisticiens (peu flexibles). " +
        "Notre niche : PME industrielles cherchant qualité et flexibilité.",
      strategie_commerciale:
        "Démarche commerciale directe auprès des chargeurs, contrats annuels, " +
        "tarification au km et au volume.",
      operations:
        "Maintenance préventive flotte, optimisation des tournées, télématique embarquée, " +
        "formation continue des chauffeurs.",
      rh:
        "1 directeur, 1 responsable exploitation, 5 chauffeurs, 1 mécanicien, 2 admin.",
      investissements: {
        "Véhicules": { Montant: "75000000" },
        "Aménagement / Travaux": { Montant: "5000000" },
        "Matériel informatique": { Montant: "3000000" },
        "Frais d'établissement": { Montant: "2000000" },
        "Trésorerie de départ": { Montant: "15000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(72_000_000, 96_000_000, 120_000_000),
        "Charges de personnel": yrs(18_000_000, 22_000_000, 26_000_000),
        "Carburant / Énergie": yrs(18_000_000, 24_000_000, 30_000_000),
        "Entretien / Réparations": yrs(6_000_000, 8_000_000, 10_000_000),
      },
    }),
  },
  {
    id: "artisanat",
    labelFr: "Artisanat / Production",
    labelEn: "Crafts / Production",
    emoji: "🛠️",
    secteur: "Artisanat",
    descriptionFr: "Atelier de production, artisan, made in local",
    descriptionEn: "Workshop, artisan, made-locally",
    build: () => ({
      resume:
        "Mise en place d'un atelier artisanal de production (mobilier, textile ou cosmétique selon le porteur). " +
        "Vente B2C et B2B, marque locale forte. Objectif CA Année 1 : 30 M FCFA.",
      presentation:
        "Production artisanale de qualité, matières premières locales, design contemporain. " +
        "Boutique physique + e-commerce + marchés.",
      marche:
        "Engouement pour le made in local, valorisation du savoir-faire artisanal, " +
        "diaspora et touristes constituent une clientèle complémentaire.",
      concurrence:
        "Productions importées bon marché et artisans isolés. Notre force : marque, " +
        "qualité constante, capacité de production structurée.",
      strategie_commerciale:
        "Présence sur marchés artisanaux, plateformes e-commerce, partenariats hôtels et boutiques cadeaux. " +
        "Communication Instagram et collaborations créateurs.",
      operations:
        "Atelier organisé en postes, contrôle qualité systématique, gestion des stocks rigoureuse, " +
        "expédition nationale et internationale.",
      rh:
        "1 chef d'atelier, 4 artisans, 1 vendeur boutique, 1 community manager temps partiel.",
      investissements: {
        "Aménagement / Travaux": { Montant: "6000000" },
        "Équipements / Matériel": { Montant: "10000000" },
        "Mobilier de bureau": { Montant: "2000000" },
        "Stock initial": { Montant: "4000000" },
        "Trésorerie de départ": { Montant: "4000000" },
      },
      compte_resultat: {
        "Chiffre d'affaires": yrs(30_000_000, 45_000_000, 60_000_000),
        "Achats de marchandises": yrs(12_000_000, 18_000_000, 24_000_000),
        "Charges de personnel": yrs(9_600_000, 12_000_000, 14_400_000),
        "Loyer": yrs(2_400_000, 2_400_000, 2_400_000),
      },
    }),
  },
];

export const getTemplate = (id: string) => SECTOR_TEMPLATES.find((t) => t.id === id);
