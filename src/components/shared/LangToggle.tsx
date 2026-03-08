import { useI18n } from "@/contexts/I18nContext";

const LangToggle = () => {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="px-2 py-1 rounded-md text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all uppercase tracking-wider"
      aria-label="Toggle language"
    >
      {lang === "fr" ? "EN" : "FR"}
    </button>
  );
};

export default LangToggle;
