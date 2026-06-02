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
];

export const getTemplate = (id: string) => SECTOR_TEMPLATES.find((t) => t.id === id);
