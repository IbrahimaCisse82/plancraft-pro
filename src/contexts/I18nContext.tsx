import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "fr" | "en";

type Translations = Record<string, Record<string, string>>;

const translations: Translations = {
  // Navbar / Landing
  "nav.features": { fr: "Fonctionnalités", en: "Features" },
  "nav.howItWorks": { fr: "Comment ça marche", en: "How it works" },
  "nav.pricing": { fr: "Tarifs", en: "Pricing" },
  "nav.cgu": { fr: "CGU", en: "Terms" },
  "nav.login": { fr: "Connexion", en: "Login" },
  "nav.start": { fr: "Commencer gratuitement", en: "Start for free" },
  "nav.dashboard": { fr: "Mon Dashboard", en: "My Dashboard" },

  // Dashboard
  "dashboard.title": { fr: "Mes Business Plans", en: "My Business Plans" },
  "dashboard.subtitle": { fr: "Créez, gérez et exportez vos dossiers depuis un seul endroit.", en: "Create, manage and export your plans from one place." },
  "dashboard.newPlan": { fr: "+ Nouveau Business Plan", en: "+ New Business Plan" },
  "dashboard.plans": { fr: "Business plans", en: "Business plans" },
  "dashboard.finalized": { fr: "Finalisés", en: "Finalized" },
  "dashboard.inProgress": { fr: "En cours", en: "In progress" },
  "dashboard.avgProgress": { fr: "Progression moy.", en: "Avg. progress" },
  "dashboard.search": { fr: "Rechercher un business plan…", en: "Search a business plan…" },
  "dashboard.all": { fr: "Tous", en: "All" },
  "dashboard.drafts": { fr: "Brouillons", en: "Drafts" },
  "dashboard.archived": { fr: "Archivés", en: "Archived" },
  "dashboard.duplicate": { fr: "Dupliquer", en: "Duplicate" },
  "dashboard.archive": { fr: "Archiver", en: "Archive" },
  "dashboard.restore": { fr: "Restaurer", en: "Restore" },
  "dashboard.delete": { fr: "Supprimer", en: "Delete" },
  "dashboard.noResults": { fr: "Aucun résultat pour ces filtres.", en: "No results for these filters." },
  "dashboard.allSectors": { fr: "Tous les secteurs", en: "All sectors" },
  "dashboard.sortBy": { fr: "Trier par", en: "Sort by" },
  "dashboard.sortRecent": { fr: "Plus récents", en: "Most recent" },
  "dashboard.sortOldest": { fr: "Plus anciens", en: "Oldest" },
  "dashboard.sortName": { fr: "Nom (A-Z)", en: "Name (A-Z)" },
  "dashboard.sortProgress": { fr: "Progression", en: "Progress" },
  "dashboard.newBpTitle": { fr: "Nouveau Business Plan", en: "New Business Plan" },
  "dashboard.newBpSubtitle": { fr: "Donnez un nom à votre projet pour commencer.", en: "Name your project to get started." },
  "dashboard.projectName": { fr: "Nom du projet *", en: "Project name *" },
  "dashboard.sector": { fr: "Secteur d'activité", en: "Business sector" },
  "dashboard.currency": { fr: "Devise", en: "Currency" },
  "dashboard.cancel": { fr: "Annuler", en: "Cancel" },
  "dashboard.create": { fr: "Créer le projet →", en: "Create project →" },
  "dashboard.creating": { fr: "Création…", en: "Creating…" },
  "dashboard.progression": { fr: "Progression", en: "Progress" },
  "dashboard.newPlanCard": { fr: "Nouveau business plan", en: "New business plan" },
  "dashboard.selectSector": { fr: "Sélectionner un secteur", en: "Select a sector" },
  "dashboard.other": { fr: "Autre", en: "Other" },

  // Sectors
  "sector.agri": { fr: "Agroalimentaire", en: "Agrifood" },
  "sector.commerce": { fr: "Commerce", en: "Commerce" },
  "sector.services": { fr: "Services", en: "Services" },
  "sector.tech": { fr: "Technologie / IT", en: "Technology / IT" },
  "sector.btp": { fr: "BTP / Construction", en: "Construction" },
  "sector.education": { fr: "Éducation / Formation", en: "Education / Training" },
  "sector.health": { fr: "Santé", en: "Healthcare" },
  "sector.transport": { fr: "Transport / Logistique", en: "Transport / Logistics" },
  "sector.tourism": { fr: "Tourisme / Hôtellerie", en: "Tourism / Hospitality" },
  "sector.agriculture": { fr: "Agriculture", en: "Agriculture" },
  "sector.industry": { fr: "Industrie / Manufacture", en: "Industry / Manufacturing" },
  "sector.energy": { fr: "Énergie", en: "Energy" },
  "sector.realestate": { fr: "Immobilier", en: "Real Estate" },

  // Editor
  "editor.save": { fr: "Sauvegarder", en: "Save" },
  "editor.saving": { fr: "Sauvegarde…", en: "Saving…" },
  "editor.saved": { fr: "Sauvegardé", en: "Saved" },
  "editor.finalize": { fr: "✅ Finaliser", en: "✅ Finalize" },
  "editor.previous": { fr: "Précédent", en: "Previous" },
  "editor.next": { fr: "Suivant", en: "Next" },
  "editor.financial": { fr: "Tableau financier", en: "Financial table" },
  "editor.narrative": { fr: "Section narrative", en: "Narrative section" },
  "editor.swot": { fr: "Matrice SWOT", en: "SWOT Matrix" },
  "editor.matrix": { fr: "Tableau qualitatif", en: "Qualitative matrix" },
  "editor.sectionOf": { fr: "Section {current} sur {total}", en: "Section {current} of {total}" },
  "editor.searchPlan": { fr: "Rechercher dans le plan…", en: "Search in plan…" },
  "editor.sections": { fr: "Sections", en: "Sections" },
  "editor.post": { fr: "Poste", en: "Item" },
  "editor.auto": { fr: "(auto)", en: "(auto)" },

  // Section titles
  "section.resume.title": { fr: "Résumé exécutif", en: "Executive Summary" },
  "section.resume.placeholder": { fr: "Décrivez votre projet en quelques paragraphes clés…", en: "Describe your project in a few key paragraphs…" },
  "section.resume.hint": { fr: "C'est la section la plus lue par les investisseurs. Résumez votre projet, votre marché cible, votre avantage concurrentiel et vos besoins de financement.", en: "This is the section most read by investors. Summarize your project, target market, competitive advantage and funding needs." },

  "section.presentation.title": { fr: "Présentation du projet", en: "Project Presentation" },
  "section.presentation.placeholder": { fr: "Décrivez votre projet, sa vision, sa mission et ses objectifs…", en: "Describe your project, its vision, mission and objectives…" },
  "section.presentation.hint": { fr: "Incluez : nom du projet, forme juridique, localisation, date de création prévue, vision et mission.", en: "Include: project name, legal form, location, planned creation date, vision and mission." },

  "section.promoteur.title": { fr: "Présentation du promoteur", en: "Promoter Presentation" },
  "section.promoteur.placeholder": { fr: "Présentez le(s) porteur(s) de projet, leur parcours et motivations…", en: "Introduce the project leader(s), their background and motivations…" },
  "section.promoteur.hint": { fr: "Parcours professionnel, compétences clés, motivation, rôle dans le projet.", en: "Professional background, key skills, motivation, role in the project." },

  "section.marche.title": { fr: "Étude de marché", en: "Market Study" },
  "section.marche.placeholder": { fr: "Analysez votre marché : taille, tendances, segmentation, clients cibles…", en: "Analyze your market: size, trends, segmentation, target clients…" },
  "section.marche.hint": { fr: "Taille du marché, tendances, segmentation clients, comportement d'achat, réglementation.", en: "Market size, trends, client segmentation, purchasing behavior, regulation." },

  "section.concurrence.title": { fr: "Analyse de la concurrence", en: "Competitive Analysis" },
  "section.concurrence.placeholder": { fr: "Identifiez vos concurrents directs et indirects, leurs forces et faiblesses…", en: "Identify your direct and indirect competitors, their strengths and weaknesses…" },
  "section.concurrence.hint": { fr: "Concurrents directs/indirects, parts de marché, positionnement, avantages concurrentiels.", en: "Direct/indirect competitors, market share, positioning, competitive advantages." },

  "section.strategie_commerciale.title": { fr: "Stratégie commerciale", en: "Sales Strategy" },
  "section.strategie_commerciale.placeholder": { fr: "Décrivez votre offre de produits/services, votre politique de prix…", en: "Describe your product/service offering, pricing policy…" },
  "section.strategie_commerciale.hint": { fr: "Offre produits/services, politique de prix, canaux de distribution, force de vente.", en: "Product/service offering, pricing policy, distribution channels, sales force." },

  "section.marketing.title": { fr: "Stratégie marketing", en: "Marketing Strategy" },
  "section.marketing.placeholder": { fr: "Détaillez votre plan marketing : communication, promotion, branding…", en: "Detail your marketing plan: communication, promotion, branding…" },
  "section.marketing.hint": { fr: "Mix marketing (4P), stratégie de communication, budget marketing, actions prévues.", en: "Marketing mix (4P), communication strategy, marketing budget, planned actions." },

  "section.operations.title": { fr: "Plan opérationnel", en: "Operational Plan" },
  "section.operations.placeholder": { fr: "Décrivez le fonctionnement quotidien de votre activité…", en: "Describe the daily operations of your business…" },
  "section.operations.hint": { fr: "Processus de production/service, fournisseurs, logistique, technologie, localisation.", en: "Production/service process, suppliers, logistics, technology, location." },

  "section.rh.title": { fr: "Ressources humaines", en: "Human Resources" },
  "section.rh.placeholder": { fr: "Détaillez votre organisation et vos besoins en personnel…", en: "Detail your organization and staffing needs…" },
  "section.rh.hint": { fr: "Organigramme, postes clés, profils recherchés, politique salariale, plan de recrutement.", en: "Organization chart, key positions, desired profiles, salary policy, recruitment plan." },

  "section.investissements.title": { fr: "Plan d'investissement", en: "Investment Plan" },
  "section.investissements.hint": { fr: "Listez tous les investissements nécessaires au démarrage et leur coût.", en: "List all investments needed for startup and their cost." },

  "section.plan_financement.title": { fr: "Plan de financement", en: "Financing Plan" },
  "section.plan_financement.hint": { fr: "Détaillez les sources de financement (apports, emprunts, subventions) face aux emplois (investissements, BFR).", en: "Detail funding sources (contributions, loans, subsidies) against uses (investments, working capital)." },

  "section.bfr_detaille.title": { fr: "BFR détaillé (méthode normative)", en: "Detailed Working Capital (normative method)" },
  "section.bfr_detaille.hint": { fr: "Calcul du Besoin en Fonds de Roulement en jours de CA. Renseignez les délais (stocks, clients, fournisseurs) ; les montants et la variation se calculent automatiquement. CA et Achats sont récupérés du compte de résultat.", en: "Working Capital Requirement in days of revenue. Fill in days (inventory, customers, suppliers); amounts and variation auto-calculate. Revenue and Purchases are fetched from the income statement." },

  "section.bilan_previsionnel.title": { fr: "Bilan prévisionnel", en: "Projected Balance Sheet" },
  "section.bilan_previsionnel.hint": { fr: "Projetez l'actif et le passif de votre entreprise sur 3 ans.", en: "Project your company's assets and liabilities over 3 years." },

  "section.seuil_rentabilite.title": { fr: "Seuil de rentabilité", en: "Break-Even Analysis" },
  "section.seuil_rentabilite.hint": { fr: "Calculez votre point mort : le chiffre d'affaires minimum pour couvrir toutes vos charges.", en: "Calculate your break-even point: the minimum revenue to cover all expenses." },

  "section.amortissement_emprunts.title": { fr: "Tableau d'amortissement des emprunts", en: "Loan Amortization Schedule" },
  "section.amortissement_emprunts.hint": { fr: "Détaillez le remboursement de chaque emprunt : capital, intérêts, annuités.", en: "Detail the repayment of each loan: principal, interest, installments." },

  "section.charges_personnel.title": { fr: "Charges du personnel", en: "Personnel Costs" },
  "section.charges_personnel.hint": { fr: "Détaillez les salaires bruts, charges sociales et coût total par poste.", en: "Detail gross salaries, social charges and total cost per position." },

  "section.compte_resultat.title": { fr: "Compte de résultat prévisionnel", en: "Projected Income Statement" },
  "section.compte_resultat.hint": { fr: "Projetez vos revenus et charges sur 3 ans.", en: "Project your revenue and expenses over 3 years." },

  "section.tresorerie.title": { fr: "Plan de trésorerie", en: "Cash Flow Plan" },
  "section.tresorerie.hint": { fr: "Suivez mois par mois vos encaissements et décaissements pour la première année.", en: "Track your monthly receipts and disbursements for the first year." },

  "section.swot.title": { fr: "Analyse SWOT", en: "SWOT Analysis" },
  "section.swot.hint": { fr: "Forces, Faiblesses, Opportunités et Menaces de votre projet.", en: "Strengths, Weaknesses, Opportunities and Threats of your project." },

  "section.risques.title": { fr: "Analyse des risques", en: "Risk Analysis" },
  "section.risques.placeholder": { fr: "Identifiez les risques potentiels et les mesures d'atténuation…", en: "Identify potential risks and mitigation measures…" },
  "section.risques.hint": { fr: "Risques commerciaux, financiers, opérationnels, réglementaires. Mesures préventives.", en: "Commercial, financial, operational, regulatory risks. Preventive measures." },

  "section.garanties.title": { fr: "Garanties proposées", en: "Proposed Collateral" },
  "section.garanties.hint": { fr: "Listez les garanties offertes à la banque : nature, valeur estimée, quotité retenue. La quotité reflète la décote prudentielle (ex: hypothèque 70%, nantissement matériel 50%, caution personnelle 100%).", en: "List collateral offered to the bank: type, estimated value, retained quota. The quota reflects the prudential haircut (e.g. mortgage 70%, equipment pledge 50%, personal guarantee 100%)." },

  "section.matrice_risques.title": { fr: "Matrice des risques", en: "Risk Matrix" },
  "section.matrice_risques.hint": { fr: "Évaluez chaque risque sur 2 axes : Probabilité (1=très rare, 5=quasi certain) et Impact (1=mineur, 5=critique). La Criticité = Probabilité × Impact se calcule automatiquement. Définissez une mesure de mitigation et un responsable pour chaque risque.", en: "Rate each risk on 2 axes: Probability (1=very rare, 5=almost certain) and Impact (1=minor, 5=critical). Criticality = Probability × Impact is auto-computed. Define a mitigation measure and an owner for each risk." },

  "matrix.lowRisk": { fr: "Faible (1-7)", en: "Low (1-7)" },
  "matrix.medRisk": { fr: "Moyen (8-14)", en: "Medium (8-14)" },
  "matrix.highRisk": { fr: "Critique (15-25)", en: "Critical (15-25)" },

  // Sensitivity analysis
  "editor.sensitivity": { fr: "Analyse de sensibilité", en: "Sensitivity analysis" },
  "section.sensibilite.title": { fr: "Analyse de Sensibilité & Stress Tests", en: "Sensitivity Analysis & Stress Tests" },
  "section.sensibilite.hint": { fr: "Simulez 3 scénarios (Pessimiste / Base / Optimiste) en ajustant le CA, les charges variables et le taux d'intérêt. Les indicateurs clés (Résultat, EBE, Point mort, DSCR, VAN, TRI) se recalculent automatiquement. Indispensable pour un comité de crédit : démontre la résilience du projet face aux chocs.", en: "Simulate 3 scenarios (Pessimistic / Base / Optimistic) by adjusting revenue, variable charges and interest rate. Key indicators (Net result, EBITDA, Break-even, DSCR, NPV, IRR) recalculate automatically. Essential for a credit committee: demonstrates resilience under shocks." },
  "sensitivity.pessimiste": { fr: "Pessimiste", en: "Pessimistic" },
  "sensitivity.base": { fr: "Base", en: "Base" },
  "sensitivity.optimiste": { fr: "Optimiste", en: "Optimistic" },
  "sensitivity.caDelta": { fr: "Δ CA", en: "Δ Revenue" },
  "sensitivity.chargesDelta": { fr: "Δ Charges var.", en: "Δ Var. charges" },
  "sensitivity.rateDelta": { fr: "Δ Taux", en: "Δ Rate" },
  "sensitivity.indicator": { fr: "Indicateur", en: "Indicator" },
  "sensitivity.caY1": { fr: "CA Année 1", en: "Revenue Y1" },
  "sensitivity.caY3": { fr: "CA Année 3", en: "Revenue Y3" },
  "sensitivity.ebeY1": { fr: "EBE Année 1", en: "EBITDA Y1" },
  "sensitivity.resultatNetY1": { fr: "Résultat net A1", en: "Net result Y1" },
  "sensitivity.resultatNetY3": { fr: "Résultat net A3", en: "Net result Y3" },
  "sensitivity.pointMortY1": { fr: "Point mort A1", en: "Break-even Y1" },
  "sensitivity.dscrY1": { fr: "DSCR A1", en: "DSCR Y1" },
  "sensitivity.van": { fr: "VAN", en: "NPV" },
  "sensitivity.tri": { fr: "TRI", en: "IRR" },
  "sensitivity.verdict": { fr: "Verdict bancaire", en: "Banking verdict" },
  "sensitivity.verdict.ok": { fr: "Robuste", en: "Robust" },
  "sensitivity.verdict.warn": { fr: "Surveillé", en: "Watch" },
  "sensitivity.verdict.ko": { fr: "Critique", en: "Critical" },
  "sensitivity.needData": { fr: "Renseignez d'abord le Compte de résultat et les Investissements pour activer l'analyse de sensibilité.", en: "Fill the Income statement and Investments first to enable sensitivity analysis." },
  "sensitivity.footnote": { fr: "Méthodologie : CA et charges variables choqués en %, taux d'intérêt en points absolus. EBE = CA − Charges variables − Charges fixes. DSCR = (Résultat + Amortissements + Charges financières) / Service de la dette. Verdict : Robuste (DSCR ≥ 1,2 et VAN ≥ 0), Surveillé (DSCR 1-1,2 ou VAN < 0), Critique (résultat < 0 ou DSCR < 1).", en: "Methodology: Revenue and variable charges shocked in %, interest rate in absolute points. EBITDA = Revenue − Variable charges − Fixed charges. DSCR = (Net result + D&A + Interest) / Debt service. Verdict: Robust (DSCR ≥ 1.2 and NPV ≥ 0), Watch (DSCR 1-1.2 or NPV < 0), Critical (result < 0 or DSCR < 1)." },

  // Share
  "share.button": { fr: "Partager", en: "Share" },
  "share.title": { fr: "Partage public", en: "Public sharing" },
  "share.description": { fr: "Toute personne avec ce lien peut consulter votre business plan en lecture seule.", en: "Anyone with this link can view your business plan in read-only mode." },
  "share.createDesc": { fr: "Créez un lien public pour partager votre business plan en lecture seule.", en: "Create a public link to share your business plan in read-only mode." },
  "share.createBtn": { fr: "Créer un lien de partage", en: "Create a share link" },
  "share.creating": { fr: "Création…", en: "Creating…" },
  "share.deleteLink": { fr: "Supprimer le lien", en: "Delete link" },
  "share.linkCreated": { fr: "Lien de partage créé !", en: "Share link created!" },
  "share.linkDeleted": { fr: "Lien de partage supprimé", en: "Share link deleted" },
  "share.linkCopied": { fr: "Lien copié !", en: "Link copied!" },
  "share.createError": { fr: "Erreur lors de la création du lien", en: "Error creating link" },

  // Versions
  "versions.title": { fr: "Historique des versions", en: "Version history" },
  "versions.button": { fr: "Versions", en: "Versions" },
  "versions.saveSnapshot": { fr: "Sauvegarder un snapshot", en: "Save a snapshot" },
  "versions.empty": { fr: "Aucune version sauvegardée. Créez un snapshot pour pouvoir restaurer plus tard.", en: "No saved versions. Create a snapshot to restore later." },
  "versions.restore": { fr: "Restaurer", en: "Restore" },
  "versions.restoreTitle": { fr: "Restaurer cette version ?", en: "Restore this version?" },
  "versions.restoreDesc": { fr: "Le contenu actuel sera remplacé par cette version. Pensez à sauvegarder un snapshot avant.", en: "Current content will be replaced by this version. Consider saving a snapshot first." },

  // AI Assistant
  "ai.button": { fr: "Assistant IA", en: "AI Assistant" },
  "ai.title": { fr: "Assistant IA", en: "AI Assistant" },
  "ai.placeholder": { fr: "Posez votre question…", en: "Ask your question…" },
  "ai.helpIntro": { fr: "Je peux vous aider à rédiger cette section. Posez une question ou choisissez un prompt rapide :", en: "I can help you write this section. Ask a question or choose a quick prompt:" },
  "ai.copy": { fr: "Copier", en: "Copy" },
  "ai.copied": { fr: "Copié (texte brut) !", en: "Copied (plain text)!" },
  "ai.insert": { fr: "Insérer dans la section", en: "Insert into section" },
  "ai.inserted": { fr: "Texte inséré dans la section !", en: "Text inserted into section!" },
  "ai.newConversation": { fr: "Nouvelle conversation", en: "New conversation" },
  "ai.stop": { fr: "Arrêter", en: "Stop" },
  "ai.send": { fr: "Envoyer", en: "Send" },
  "ai.financial.1": { fr: "Aide-moi à remplir ce tableau", en: "Help me fill in this table" },
  "ai.financial.2": { fr: "Quels montants sont réalistes ?", en: "What amounts are realistic?" },
  "ai.financial.3": { fr: "Explique chaque ligne du tableau", en: "Explain each row of the table" },
  "ai.financial.4": { fr: "Donne un exemple chiffré pour mon secteur", en: "Give a numerical example for my sector" },
  "ai.swot.1": { fr: "Analyse les forces de mon projet", en: "Analyze my project's strengths" },
  "ai.swot.2": { fr: "Identifie les faiblesses possibles", en: "Identify possible weaknesses" },
  "ai.swot.3": { fr: "Quelles opportunités exploiter ?", en: "What opportunities to exploit?" },
  "ai.swot.4": { fr: "Quelles menaces anticiper ?", en: "What threats to anticipate?" },
  "ai.narrative.1": { fr: "Rédige cette section pour moi", en: "Write this section for me" },
  "ai.narrative.2": { fr: "Améliore le texte existant", en: "Improve the existing text" },
  "ai.narrative.3": { fr: "Donne-moi un plan détaillé", en: "Give me a detailed outline" },
  "ai.narrative.4": { fr: "Quels points clés inclure ?", en: "What key points to include?" },

  // SWOT
  "swot.strengths": { fr: "Forces", en: "Strengths" },
  "swot.weaknesses": { fr: "Faiblesses", en: "Weaknesses" },
  "swot.opportunities": { fr: "Opportunités", en: "Opportunities" },
  "swot.threats": { fr: "Menaces", en: "Threats" },
  "swot.strengthsPlaceholder": { fr: "Quels sont vos atouts et avantages concurrentiels ?", en: "What are your strengths and competitive advantages?" },
  "swot.weaknessesPlaceholder": { fr: "Quels sont vos points faibles ou manques ?", en: "What are your weak points or gaps?" },
  "swot.opportunitiesPlaceholder": { fr: "Quelles opportunités du marché pouvez-vous exploiter ?", en: "What market opportunities can you exploit?" },
  "swot.threatsPlaceholder": { fr: "Quelles menaces externes pourraient vous impacter ?", en: "What external threats could impact you?" },

  // Auth
  "auth.login": { fr: "Se connecter", en: "Login" },
  "auth.signup": { fr: "Créer un compte", en: "Sign up" },
  "auth.email": { fr: "Email", en: "Email" },
  "auth.password": { fr: "Mot de passe", en: "Password" },
  "auth.forgotPassword": { fr: "Mot de passe oublié ?", en: "Forgot password?" },
  "auth.welcomeTitle": { fr: "Bienvenue", en: "Welcome" },
  "auth.welcomeSub": { fr: "Connectez-vous avec votre email et mot de passe.", en: "Sign in with your email and password." },
  "auth.registerTitle": { fr: "Créer un compte", en: "Create an account" },
  "auth.registerSub": { fr: "Créez un compte gratuitement pour commencer.", en: "Create a free account to get started." },
  "auth.forgotTitle": { fr: "Mot de passe oublié", en: "Forgot password" },
  "auth.forgotSub": { fr: "Entrez votre email pour recevoir un lien de réinitialisation.", en: "Enter your email to receive a reset link." },
  "auth.fullName": { fr: "Nom complet", en: "Full name" },
  "auth.loginBtn": { fr: "Se connecter →", en: "Sign in →" },
  "auth.registerBtn": { fr: "Créer le compte →", en: "Create account →" },
  "auth.sendLinkBtn": { fr: "Envoyer le lien →", en: "Send link →" },
  "auth.loading": { fr: "Chargement…", en: "Loading…" },
  "auth.or": { fr: "ou", en: "or" },
  "auth.continueGoogle": { fr: "Continuer avec Google", en: "Continue with Google" },
  "auth.noAccount": { fr: "Pas encore de compte ? Créer un compte", en: "No account yet? Create one" },
  "auth.hasAccount": { fr: "Déjà un compte ? Se connecter", en: "Already have an account? Sign in" },
  "auth.firstTime": { fr: "Première connexion ?", en: "First time here?" },
  "auth.firstTimeDesc": { fr: "Créez un compte et commencez à rédiger votre business plan immédiatement.", en: "Create an account and start writing your business plan right away." },
  "auth.termsIntro": { fr: "En vous connectant, vous acceptez nos", en: "By signing in, you agree to our" },
  "auth.termsLink": { fr: "Conditions Générales d'Utilisation", en: "Terms of Service" },
  "auth.privacyAnd": { fr: "et notre", en: "and our" },
  "auth.privacyLink": { fr: "Politique de confidentialité", en: "Privacy Policy" },
  "auth.emailConfirmed": { fr: "Email confirmé ! Vous pouvez maintenant vous connecter.", en: "Email confirmed! You can now sign in." },
  "auth.resetSent": { fr: "Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.", en: "A reset email has been sent. Check your inbox." },

  // Email confirmation page
  "emailConfirm.title": { fr: "Vérifiez votre email", en: "Check your email" },
  "emailConfirm.description": { fr: "Un email de confirmation a été envoyé à votre adresse. Cliquez sur le lien dans l'email pour activer votre compte.", en: "A confirmation email has been sent to your address. Click the link in the email to activate your account." },
  "emailConfirm.spam": { fr: "Si vous ne trouvez pas l'email, vérifiez votre dossier", en: "If you can't find the email, check your" },
  "emailConfirm.spamFolder": { fr: "spam", en: "spam" },
  "emailConfirm.orJunk": { fr: "ou", en: "or" },
  "emailConfirm.junkFolder": { fr: "courrier indésirable", en: "junk mail" },
  "emailConfirm.backToLogin": { fr: "Retour à la connexion →", en: "Back to login →" },
  "emailConfirm.noEmail": { fr: "Vous n'avez pas reçu d'email ?", en: "Didn't receive an email?" },
  "emailConfirm.retry": { fr: "Réessayer l'inscription", en: "Try signing up again" },

  // Reset password
  "reset.title": { fr: "Nouveau mot de passe", en: "New password" },
  "reset.subtitle": { fr: "Choisissez un nouveau mot de passe sécurisé.", en: "Choose a new secure password." },
  "reset.newPassword": { fr: "Nouveau mot de passe *", en: "New password *" },
  "reset.confirmPassword": { fr: "Confirmer le mot de passe *", en: "Confirm password *" },
  "reset.submit": { fr: "Mettre à jour le mot de passe →", en: "Update password →" },
  "reset.submitting": { fr: "Mise à jour…", en: "Updating…" },
  "reset.mismatch": { fr: "Les mots de passe ne correspondent pas", en: "Passwords don't match" },
  "reset.tooShort": { fr: "Le mot de passe doit contenir au moins 6 caractères", en: "Password must be at least 6 characters" },
  "reset.success": { fr: "Mot de passe mis à jour avec succès !", en: "Password updated successfully!" },

  // Profile
  "profile.title": { fr: "Mon Profil", en: "My Profile" },
  "profile.displayName": { fr: "Nom d'affichage", en: "Display name" },
  "profile.namePlaceholder": { fr: "Votre nom", en: "Your name" },
  "profile.emailLabel": { fr: "Email", en: "Email" },
  "profile.emailHint": { fr: "L'email ne peut pas être modifié.", en: "Email cannot be changed." },
  "profile.save": { fr: "Sauvegarder", en: "Save" },
  "profile.saving": { fr: "Sauvegarde…", en: "Saving…" },
  "profile.saved": { fr: "Profil mis à jour !", en: "Profile updated!" },
  "profile.error": { fr: "Erreur : ", en: "Error: " },

  // Onboarding
  "onboarding.step": { fr: "Étape {current} / {total}", en: "Step {current} / {total}" },
  "onboarding.close": { fr: "Fermer", en: "Close" },
  "onboarding.previous": { fr: "Précédent", en: "Previous" },
  "onboarding.next": { fr: "Suivant", en: "Next" },
  "onboarding.start": { fr: "Commencer", en: "Get started" },
  "onboarding.step1.title": { fr: "Bienvenue sur PlanCraft Pro ! 🎉", en: "Welcome to PlanCraft Pro! 🎉" },
  "onboarding.step1.desc": { fr: "Créez des business plans professionnels en quelques minutes grâce à notre éditeur intelligent.", en: "Create professional business plans in minutes with our smart editor." },
  "onboarding.step2.title": { fr: "Créez votre premier plan", en: "Create your first plan" },
  "onboarding.step2.desc": { fr: "Cliquez sur « + Nouveau Business Plan » pour démarrer. Choisissez un nom, un secteur et une devise.", en: "Click '+ New Business Plan' to start. Choose a name, sector and currency." },
  "onboarding.step3.title": { fr: "19 sections structurées", en: "19 structured sections" },
  "onboarding.step3.desc": { fr: "Parcourez les sections narratives, financières et SWOT. Les tableaux financiers calculent automatiquement les totaux.", en: "Browse narrative, financial and SWOT sections. Financial tables calculate totals automatically." },
  "onboarding.step4.title": { fr: "Assistant IA intégré", en: "Built-in AI Assistant" },
  "onboarding.step4.desc": { fr: "L'assistant IA vous aide à rédiger chaque section. Posez-lui des questions ou demandez-lui de générer du contenu.", en: "The AI assistant helps you write each section. Ask questions or have it generate content." },
  "onboarding.step5.title": { fr: "Exportez et partagez", en: "Export and share" },
  "onboarding.step5.desc": { fr: "Exportez en PDF, Word ou Excel. Partagez un lien public en lecture seule avec vos partenaires.", en: "Export to PDF, Word or Excel. Share a read-only public link with your partners." },

  // TopBar
  "topbar.home": { fr: "🏠 Accueil", en: "🏠 Home" },
  "topbar.logout": { fr: "Déconnexion", en: "Logout" },
  "topbar.admin": { fr: "🛡️ Admin", en: "🛡️ Admin" },

  // Admin
  "admin.title": { fr: "Administration", en: "Administration" },
  "admin.subtitle": { fr: "Vue globale de tous les utilisateurs et business plans.", en: "Global view of all users and business plans." },
  "admin.users": { fr: "Utilisateurs", en: "Users" },
  "admin.businessPlans": { fr: "Business plans", en: "Business plans" },
  "admin.finalized": { fr: "Finalisés", en: "Finalized" },
  "admin.avgProgress": { fr: "Progression moy.", en: "Avg. progress" },
  "admin.completionRate": { fr: "Taux complétion", en: "Completion rate" },
  "admin.analytics": { fr: "Analytiques", en: "Analytics" },
  "admin.monthlyCreations": { fr: "📈 Créations mensuelles", en: "📈 Monthly creations" },
  "admin.statusDistribution": { fr: "📊 Répartition par statut", en: "📊 Status distribution" },
  "admin.sectorDistribution": { fr: "🏢 Répartition par secteur", en: "🏢 Sector distribution" },
  "admin.noData": { fr: "Aucune donnée", en: "No data" },
  "admin.name": { fr: "Nom", en: "Name" },
  "admin.user": { fr: "Utilisateur", en: "User" },
  "admin.sectorCol": { fr: "Secteur", en: "Sector" },
  "admin.progress": { fr: "Progrès", en: "Progress" },
  "admin.status": { fr: "Statut", en: "Status" },
  "admin.actions": { fr: "Actions", en: "Actions" },
  "admin.registrationDate": { fr: "Date d'inscription", en: "Registration date" },
  "admin.drafts": { fr: "Brouillons", en: "Drafts" },
  "admin.archived": { fr: "Archivés", en: "Archived" },
  "admin.deleted": { fr: "Supprimé", en: "Deleted" },
  "admin.undefined": { fr: "Non défini", en: "Undefined" },
  "admin.shareViews": { fr: "Vues partagées", en: "Share Views" },
  "admin.shareViewTrend": { fr: "Vues des liens partagés (7 jours)", en: "Share link views (7 days)" },

  // Landing - Hero
  "hero.badge": { fr: "✦ Propulsé par l'Intelligence Artificielle", en: "✦ Powered by Artificial Intelligence" },
  "hero.heading1": { fr: "Le Business Plan", en: "The" },
  "hero.headingHighlight": { fr: "Bankable", en: "Bankable" },
  "hero.heading2": { fr: "en quelques heures", en: "Business Plan in hours" },
  "hero.subtitle": { fr: "PlanCraft Pro est la plateforme de référence en Afrique francophone pour créer, structurer et exporter des business plans complets — prêts pour les banques, les investisseurs et les organismes de financement.", en: "PlanCraft Pro is the leading platform in Francophone Africa for creating, structuring and exporting complete business plans — ready for banks, investors and funding organizations." },
  "hero.cta": { fr: "Créer mon business plan →", en: "Create my business plan →" },
  "hero.seeFeatures": { fr: "Voir les fonctionnalités", en: "See features" },
  "hero.stat1": { fr: "Sections structurées", en: "Structured sections" },
  "hero.stat2": { fr: "Tableaux financiers", en: "Financial tables" },
  "hero.stat3": { fr: "Fichier autonome", en: "Standalone file" },
  "hero.stat4": { fr: "Génération assistée", en: "AI-assisted generation" },

  // Landing - Features
  "features.label": { fr: "Fonctionnalités", en: "Features" },
  "features.heading": { fr: "Tout ce dont vous avez\nbesoin pour convaincre", en: "Everything you need\nto convince" },
  "features.subtitle": { fr: "De la rédaction assistée aux tableaux financiers automatiques — PlanCraft Pro couvre chaque étape du dossier bancaire.", en: "From AI-assisted writing to automatic financial tables — PlanCraft Pro covers every step of your banking application." },
  "features.1.title": { fr: "Génération IA section par section", en: "AI generation section by section" },
  "features.1.desc": { fr: "L'IA rédige la vision, la stratégie, l'analyse de marché et les risques en fonction de votre secteur et contexte réel.", en: "AI writes the vision, strategy, market analysis and risks based on your sector and real context." },
  "features.2.title": { fr: "11 tableaux financiers automatiques", en: "11 automatic financial tables" },
  "features.2.desc": { fr: "Plan de financement, compte d'exploitation 5 ans, flux de trésorerie, VAN/TRI, bilan prévisionnel — tout calculé et lié.", en: "Financing plan, 5-year P&L, cash flow, NPV/IRR, projected balance sheet — all calculated and linked." },
  "features.3.title": { fr: "Calculs financiers rigoureux", en: "Rigorous financial calculations" },
  "features.3.desc": { fr: "TRI Newton-Raphson, VAN au CMPC, BFR réel, trésorerie mensuelle et trimestrielle. Pas d'approximations.", en: "IRR Newton-Raphson, NPV at WACC, real working capital, monthly and quarterly cash flow. No approximations." },
  "features.4.title": { fr: "Export Word & PDF professionnel", en: "Professional Word & PDF export" },
  "features.4.desc": { fr: "Document complet avec table des matières, numérotation, page de garde — prêt à remettre à la banque.", en: "Complete document with table of contents, numbering, cover page — ready to submit to the bank." },
  "features.5.title": { fr: "Fiche synthèse banquier", en: "Banker summary sheet" },
  "features.5.desc": { fr: "Vue condensée avec tous les ratios clés, verdicts ✓/✗ et note méthodologique — ce que le banquier lit en 30 secondes.", en: "Condensed view with all key ratios, ✓/✗ verdicts and methodology note — what the banker reads in 30 seconds." },
  "features.6.title": { fr: "Multi-projets dans le cloud", en: "Multi-projects in the cloud" },
  "features.6.desc": { fr: "Créez et gérez plusieurs business plans depuis n'importe quel appareil. Vos données sont sécurisées et accessibles partout.", en: "Create and manage multiple business plans from any device. Your data is secure and accessible everywhere." },

  // Landing - How it works
  "howItWorks.label": { fr: "Comment ça marche", en: "How it works" },
  "howItWorks.heading": { fr: "De l'idée au dossier\nen 4 étapes", en: "From idea to file\nin 4 steps" },
  "howItWorks.step1.title": { fr: "Décrivez votre projet", en: "Describe your project" },
  "howItWorks.step1.desc": { fr: "Renseignez les informations de base : nom, secteur, localisation, montant recherché. PlanCraft configure automatiquement l'ensemble de l'environnement.", en: "Enter basic information: name, sector, location, amount sought. PlanCraft automatically configures the entire environment." },
  "howItWorks.step2.title": { fr: "Laissez l'IA rédiger", en: "Let AI write" },
  "howItWorks.step2.desc": { fr: "Cliquez sur \"✦ Tout générer\" — l'IA rédige les 14 sections en quelques minutes. Relisez, ajustez, personnalisez selon votre connaissance terrain.", en: "Click \"✦ Generate all\" — AI writes all 14 sections in minutes. Review, adjust, customize based on your field knowledge." },
  "howItWorks.step3.title": { fr: "Renseignez vos chiffres", en: "Enter your numbers" },
  "howItWorks.step3.desc": { fr: "Entrez votre CA prévisionnel, vos charges, vos effectifs. Les 11 tableaux financiers se calculent et se mettent à jour en temps réel.", en: "Enter your projected revenue, expenses, and headcount. The 11 financial tables calculate and update in real time." },
  "howItWorks.step4.title": { fr: "Exportez et déposez", en: "Export and submit" },
  "howItWorks.step4.desc": { fr: "Exportez en Word ou PDF, vérifiez la fiche synthèse banquier avec les ratios clés, puis remettez votre dossier — complet et professionnel.", en: "Export to Word or PDF, review the banker summary sheet with key ratios, then submit your file — complete and professional." },

  // Landing - Pricing
  "pricing.label": { fr: "Tarifs", en: "Pricing" },
  "pricing.heading": { fr: "Simple et transparent", en: "Simple and transparent" },
  "pricing.subtitle": { fr: "Commencez gratuitement. Passez à Pro quand vous en avez besoin.", en: "Start for free. Upgrade to Pro when you need it." },
  "pricing.free": { fr: "Gratuit", en: "Free" },
  "pricing.pro": { fr: "Pro", en: "Pro" },
  "pricing.enterprise": { fr: "Entreprise", en: "Enterprise" },
  "pricing.freeDesc": { fr: "Pour découvrir et commencer", en: "To discover and get started" },
  "pricing.proDesc": { fr: "Pour les entrepreneurs sérieux", en: "For serious entrepreneurs" },
  "pricing.enterpriseDesc": { fr: "Pour les incubateurs et structures", en: "For incubators and organizations" },
  "pricing.recommended": { fr: "⭐ Recommandé", en: "⭐ Recommended" },
  "pricing.startFree": { fr: "Commencer gratuitement", en: "Start for free" },
  "pricing.startTrial": { fr: "Démarrer l'essai gratuit", en: "Start free trial" },
  "pricing.contact": { fr: "Nous contacter", en: "Contact us" },
  "pricing.onQuote": { fr: "Sur", en: "On" },
  "pricing.quote": { fr: "devis", en: "quote" },

  // Footer
  "footer.description": { fr: "La plateforme de référence pour créer des business plans bankables en Afrique francophone.", en: "The leading platform for creating bankable business plans in Francophone Africa." },
  "footer.product": { fr: "Produit", en: "Product" },
  "footer.features": { fr: "Fonctionnalités", en: "Features" },
  "footer.pricing": { fr: "Tarifs", en: "Pricing" },
  "footer.howItWorks": { fr: "Comment ça marche", en: "How it works" },
  "footer.signIn": { fr: "Se connecter", en: "Sign in" },
  "footer.legal": { fr: "Légal", en: "Legal" },
  "footer.terms": { fr: "Conditions d'utilisation", en: "Terms of Service" },
  "footer.privacy": { fr: "Politique de confidentialité", en: "Privacy Policy" },
  "footer.dataProtection": { fr: "Protection des données", en: "Data Protection" },
  "footer.contact": { fr: "Contact", en: "Contact" },
  "footer.rights": { fr: "Tous droits réservés.", en: "All rights reserved." },

  // Auth page left panel
  "auth.tagline": { fr: "✦ Afrique francophone · SaaS", en: "✦ Francophone Africa · SaaS" },
  "auth.leftHeading1": { fr: "Créez votre", en: "Create your" },
  "auth.leftHeading2": { fr: "business plan", en: "business plan" },
  "auth.leftHeadingHighlight": { fr: "bankable", en: "bankable" },
  "auth.leftDesc": { fr: "PlanCraft Pro est la plateforme de référence pour créer des business plans complets, professionnels et prêts pour les banques — avec l'assistance de l'intelligence artificielle.", en: "PlanCraft Pro is the leading platform for creating complete, professional and bank-ready business plans — with AI assistance." },
  "auth.pill1": { fr: "📊 11 tableaux financiers", en: "📊 11 financial tables" },
  "auth.pill2": { fr: "✦ Génération IA", en: "✦ AI Generation" },
  "auth.pill3": { fr: "📄 Export PDF", en: "📄 PDF Export" },
  "auth.pill4": { fr: "☁️ Multi-appareils", en: "☁️ Multi-device" },
  "auth.pill5": { fr: "🔒 Données sécurisées", en: "🔒 Secure data" },

  // Shared plan page
  "shared.readOnly": { fr: "Consultation en lecture seule", en: "Read-only view" },
  "shared.accessDenied": { fr: "Accès refusé", en: "Access denied" },
  "shared.invalidLink": { fr: "Ce lien de partage est invalide ou expiré.", en: "This share link is invalid or expired." },
  "shared.planNotFound": { fr: "Business plan introuvable.", en: "Business plan not found." },
  "shared.invalidUrl": { fr: "Lien invalide", en: "Invalid link" },
  "shared.generatedWith": { fr: "Généré avec", en: "Generated with" },

  // Export
  "export.generatedOn": { fr: "Généré le", en: "Generated on" },
  "export.currency": { fr: "Devise", en: "Currency" },
  "export.sector": { fr: "Secteur", en: "Sector" },
  "export.post": { fr: "Poste", en: "Item" },

  // Validation
  "validation.emailInvalid": { fr: "Adresse email invalide", en: "Invalid email address" },
  "validation.emailTooLong": { fr: "Email trop long", en: "Email too long" },
  "validation.passwordMin": { fr: "Le mot de passe doit contenir au moins 6 caractères", en: "Password must be at least 6 characters" },
  "validation.passwordMax": { fr: "Mot de passe trop long", en: "Password too long" },
  "validation.nameTooLong": { fr: "Nom trop long", en: "Name too long" },
  "validation.nameRequired": { fr: "Le nom est requis", en: "Name is required" },
  "validation.nameEmpty": { fr: "Le nom ne peut pas être vide", en: "Name cannot be empty" },
  "validation.sectorTooLong": { fr: "Secteur trop long", en: "Sector too long" },
  "validation.currencyRequired": { fr: "La devise est requise", en: "Currency is required" },

  // Banker Summary
  "section.synthese_banquier.title": { fr: "Fiche Synthèse Banquier", en: "Banker Summary Sheet" },
  "section.synthese_banquier.hint": { fr: "Vue condensée de tous les ratios clés avec verdicts ✓/✗ — ce que le banquier lit en 30 secondes.", en: "Condensed view of all key ratios with ✓/✗ verdicts — what the banker reads in 30 seconds." },
  "banker.noData": { fr: "Remplissez les tableaux financiers (investissements, compte de résultat) pour voir la synthèse banquier.", en: "Fill in the financial tables (investments, income statement) to see the banker summary." },
  "banker.totalInvestment": { fr: "Investissement total", en: "Total Investment" },
  "banker.personalContribution": { fr: "Apport personnel", en: "Personal Contribution" },
  "banker.apportOk": { fr: "≥ 20% : bien", en: "≥ 20%: good" },
  "banker.apportLow": { fr: "< 20% : insuffisant", en: "< 20%: insufficient" },
  "banker.revenueY1": { fr: "CA Année 1", en: "Revenue Year 1" },
  "banker.revenueY3": { fr: "CA Année 3", en: "Revenue Year 3" },
  "banker.growthOk": { fr: "Croissance positive", en: "Positive growth" },
  "banker.growthLow": { fr: "Pas de croissance", en: "No growth" },
  "banker.netResultY1": { fr: "Résultat net Année 1", en: "Net Result Year 1" },
  "banker.grossMargin": { fr: "Taux de marge brute", en: "Gross Margin Rate" },
  "banker.profitability": { fr: "Taux de rentabilité nette", en: "Net Profitability Rate" },
  "banker.breakEven": { fr: "Seuil de rentabilité", en: "Break-Even Point" },
  "banker.breakEvenOk": { fr: "CA > seuil ✓", en: "Revenue > threshold ✓" },
  "banker.breakEvenKo": { fr: "CA < seuil ✗", en: "Revenue < threshold ✗" },
  "banker.deadPoint": { fr: "Point mort", en: "Dead Point" },
  "banker.days": { fr: "jours", en: "days" },
  "banker.dscr": { fr: "Capacité de remboursement (DSCR)", en: "Debt Service Coverage Ratio" },
  "banker.dscrOk": { fr: "≥ 1.2 : confortable", en: "≥ 1.2: comfortable" },
  "banker.dscrLow": { fr: "< 1.2 : risqué", en: "< 1.2: risky" },
  "banker.npv": { fr: "VAN (Valeur Actuelle Nette)", en: "NPV (Net Present Value)" },
  "banker.npvOk": { fr: "Projet créateur de valeur", en: "Value-creating project" },
  "banker.npvKo": { fr: "Projet destructeur de valeur", en: "Value-destroying project" },
  "banker.irr": { fr: "TRI (Taux de Rendement Interne)", en: "IRR (Internal Rate of Return)" },
  "banker.irrOk": { fr: "> 10% : attractif", en: "> 10%: attractive" },
  "banker.irrLow": { fr: "< 10% : faible", en: "< 10%: weak" },
  "banker.score": { fr: "Score de bankabilité", en: "Bankability Score" },
  "banker.criteria": { fr: "critères validés", en: "criteria passed" },
  "banker.indicator": { fr: "Indicateur", en: "Indicator" },
  "banker.valueCol": { fr: "Valeur", en: "Value" },
  "banker.verdictCol": { fr: "Verdict", en: "Verdict" },
  "banker.methodology": { fr: "Méthodologie : VAN calculée au taux d'actualisation de 10%. TRI calculé par méthode Newton-Raphson. DSCR = (Résultat net + Amortissements) / Annuité de remboursement. Apport personnel minimum recommandé : 20% de l'investissement total.", en: "Methodology: NPV calculated at 10% discount rate. IRR calculated using Newton-Raphson method. DSCR = (Net Result + Depreciation) / Annual Repayment. Recommended minimum personal contribution: 20% of total investment." },
  "banker.crossTableNote": { fr: "⚡ Liaison inter-tableaux active : les charges du personnel et les investissements alimentent automatiquement les autres tableaux.", en: "⚡ Cross-table linking active: personnel costs and investments automatically feed into other tables." },
  "banker.revenueEvolution": { fr: "Évolution CA & Résultat", en: "Revenue & Result Evolution" },
  "banker.cashEvolution": { fr: "Trésorerie mensuelle", en: "Monthly Cash Flow" },
  "banker.cumulBalance": { fr: "Solde cumulé", en: "Cumulative Balance" },
  "banker.receipts": { fr: "Encaissements", en: "Receipts" },
  "banker.disbursements": { fr: "Décaissements", en: "Disbursements" },

  // Import
  "import.button": { fr: "Importer", en: "Import" },
  "import.success": { fr: "{count} section(s) importée(s) depuis Excel", en: "{count} section(s) imported from Excel" },
  "import.noMatch": { fr: "Aucune section financière correspondante trouvée dans le fichier", en: "No matching financial section found in the file" },
  "import.error": { fr: "Erreur lors de l'import du fichier Excel", en: "Error importing Excel file" },
  "import.previewTitle": { fr: "Aperçu et mapping de l'import Excel", en: "Preview & map Excel import" },
  "import.previewDesc": { fr: "Vérifiez la correspondance des feuilles, colonnes et lignes avant l'import.", en: "Check the mapping of sheets, columns and rows before importing." },
  "import.target": { fr: "Cible :", en: "Target:" },
  "import.skipSheet": { fr: "— Ignorer cette feuille —", en: "— Skip this sheet —" },
  "import.skip": { fr: "— Ignorer —", en: "— Skip —" },
  "import.confirm": { fr: "Importer la sélection", en: "Import selection" },

  // Financial Validation
  "validation.title": { fr: "Diagnostic financier", en: "Financial Diagnostic" },
  "validation.zeroRevenue": { fr: "Le chiffre d'affaires Année 1 est à 0", en: "Year 1 revenue is 0" },
  "validation.revenueDrop": { fr: "Le CA baisse fortement entre Année 2 et 3", en: "Revenue drops sharply between Year 2 and 3" },
  "validation.chargesExceedMargin": { fr: "Les charges dépassent la marge brute en Année 1", en: "Expenses exceed gross margin in Year 1" },
  "validation.alwaysLoss": { fr: "Résultat net négatif sur les 3 années — projet non viable en l'état", en: "Net result negative for all 3 years — project not viable as-is" },
  "validation.lossY1": { fr: "Résultat net négatif en Année 1 (fréquent au démarrage)", en: "Net result negative in Year 1 (common at startup)" },
  "validation.noInvestment": { fr: "Aucun investissement renseigné", en: "No investments entered" },
  "validation.noFinancing": { fr: "Aucune source de financement renseignée", en: "No funding sources entered" },
  "validation.lowContribution": { fr: "Apport personnel < 10% — risque de refus bancaire", en: "Personal contribution < 10% — bank rejection risk" },
  "validation.negativeBfr": { fr: "Le BFR est négatif — vérifiez vos hypothèses", en: "Working capital is negative — check your assumptions" },
  "validation.breakEvenTooHigh": { fr: "Le seuil de rentabilité est plus de 2× le CA prévu", en: "Break-even is more than 2× projected revenue" },
  "validation.cashNegative6m": { fr: "Trésorerie négative 6+ mois — risque de cessation de paiement", en: "Negative cash flow for 6+ months — risk of insolvency" },
  "validation.cashNegative3m": { fr: "Trésorerie négative pendant 3+ mois", en: "Negative cash flow for 3+ months" },
  "validation.unbalancedSheet": { fr: "Bilan non équilibré (Actif ≠ Passif)", en: "Unbalanced sheet (Assets ≠ Liabilities)" },
  "validation.allGood": { fr: "Tous les indicateurs financiers sont cohérents ✓", en: "All financial indicators are consistent ✓" },
  "validation.coherenceCaSeuil": { fr: "Incohérence : CA du Compte de résultat ≠ CA du Seuil de rentabilité (Année 1)", en: "Inconsistency: Income statement revenue ≠ Break-even revenue (Year 1)" },
  "validation.coherenceCaBfr": { fr: "Incohérence : CA du Compte de résultat ≠ CA du BFR détaillé (Année 1)", en: "Inconsistency: Income statement revenue ≠ BFR detailed revenue (Year 1)" },
  "validation.coherenceAchatsBfr": { fr: "Incohérence : Achats du Compte de résultat ≠ Achats du BFR détaillé (Année 1)", en: "Inconsistency: Income statement purchases ≠ BFR detailed purchases (Year 1)" },
  "validation.coherenceChargesVarSeuil": { fr: "Incohérence : Charges variables (Seuil) ≠ Achats (Compte de résultat) — vérifiez la cohérence", en: "Inconsistency: Variable costs (Break-even) ≠ Purchases (Income statement) — please verify" },
  "validation.coherenceTresoCa": { fr: "Incohérence : Somme des encaissements mensuels ≠ CA annuel (écart > 5%)", en: "Inconsistency: Sum of monthly receipts ≠ Annual revenue (gap > 5%)" },
  "validation.coherenceTresoAchats": { fr: "Incohérence : Somme des achats mensuels ≠ Achats annuels (écart > 5%)", en: "Inconsistency: Sum of monthly purchases ≠ Annual purchases (gap > 5%)" },
  "validation.coherenceBfrPlan": { fr: "Incohérence : BFR détaillé ≠ BFR du Plan de financement (Année 1)", en: "Inconsistency: Detailed BFR ≠ BFR in Funding plan (Year 1)" },
  "export.onePager.title": { fr: "One-pager exécutif", en: "Executive one-pager" },
  "export.onePager.button": { fr: "One-pager", en: "One-pager" },
  "export.onePager.keyFigures": { fr: "Chiffres clés", en: "Key figures" },
  "export.onePager.loan": { fr: "Emprunt sollicité", en: "Loan requested" },
  "export.onePager.revenueY3": { fr: "CA Année 3", en: "Revenue Y3" },
  "export.onePager.netResultY3": { fr: "Résultat net A3", en: "Net result Y3" },
  "export.onePager.payback": { fr: "Cumul cash-flows A3", en: "Cumul. cash flows Y3" },
  "export.onePager.marketStrategy": { fr: "Marché & stratégie", en: "Market & strategy" },
  "export.onePager.fundingRequest": { fr: "Demande de financement", en: "Funding request" },
  "export.onePager.disclaimer": { fr: "Document synthétique — voir business plan complet pour le détail des hypothèses.", en: "Summary document — see full business plan for assumption details." },

  // Presence
  "presence.viewing": { fr: "consulte aussi ce plan", en: "also viewing this plan" },

  // Common
  "common.loading": { fr: "Chargement…", en: "Loading…" },
  "common.confirmDelete": { fr: "Supprimer ce business plan ?", en: "Delete this business plan?" },
  "common.irreversible": { fr: "Cette action est irréversible. Toutes les données seront perdues.", en: "This action is irreversible. All data will be lost." },
  "common.deleteConfirm": { fr: "Supprimer définitivement", en: "Delete permanently" },
  "common.saveError": { fr: "Erreur de sauvegarde", en: "Save error" },
  "common.loadError": { fr: "Erreur lors du chargement des business plans", en: "Error loading business plans" },
  "common.notFound": { fr: "Business plan introuvable", en: "Business plan not found" },
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "plancraft_lang";

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === "en" ? "en" : "fr") as Lang;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[key]?.[lang] || translations[key]?.["fr"] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
