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

  // Editor
  "editor.save": { fr: "Sauvegarder", en: "Save" },
  "editor.saving": { fr: "Sauvegarde…", en: "Saving…" },
  "editor.saved": { fr: "Sauvegardé", en: "Saved" },
  "editor.finalize": { fr: "✅ Finaliser", en: "✅ Finalize" },
  "editor.previous": { fr: "Précédent", en: "Previous" },
  "editor.next": { fr: "Suivant", en: "Next" },
  "editor.financial": { fr: "Tableau financier", en: "Financial table" },
  "editor.narrative": { fr: "Section narrative", en: "Narrative section" },
  "editor.sectionOf": { fr: "Section {current} sur {total}", en: "Section {current} of {total}" },

  // TopBar
  "topbar.home": { fr: "🏠 Accueil", en: "🏠 Home" },
  "topbar.logout": { fr: "Déconnexion", en: "Logout" },
  "topbar.admin": { fr: "🛡️ Admin", en: "🛡️ Admin" },

  // Auth
  "auth.login": { fr: "Se connecter", en: "Login" },
  "auth.signup": { fr: "Créer un compte", en: "Sign up" },
  "auth.email": { fr: "Email", en: "Email" },
  "auth.password": { fr: "Mot de passe", en: "Password" },
  "auth.forgotPassword": { fr: "Mot de passe oublié ?", en: "Forgot password?" },

  // Common
  "common.loading": { fr: "Chargement…", en: "Loading…" },
  "common.confirmDelete": { fr: "Supprimer ce business plan ?", en: "Delete this business plan?" },
  "common.irreversible": { fr: "Cette action est irréversible. Toutes les données seront perdues.", en: "This action is irreversible. All data will be lost." },
  "common.deleteConfirm": { fr: "Supprimer définitivement", en: "Delete permanently" },
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
