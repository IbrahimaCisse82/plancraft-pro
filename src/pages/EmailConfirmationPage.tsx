import { Link } from "react-router-dom";
import { CheckCircle, Mail } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const EmailConfirmationPage = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_-10%_50%,_hsl(43_55%_54%_/_0.12),_transparent_60%)]" />
      </div>

      <div className="relative z-10 bg-card border border-border rounded-2xl p-8 sm:p-10 max-w-md w-full text-center shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-success" />
        </div>

        <h1 className="font-display text-2xl font-bold mb-3">{t("emailConfirm.title")}</h1>

        <p className="text-sm text-secondary-foreground leading-relaxed mb-6">
          {t("emailConfirm.description")}
        </p>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              {t("emailConfirm.spam")} <strong className="text-foreground">{t("emailConfirm.spamFolder")}</strong> {t("emailConfirm.orJunk")} <strong className="text-foreground">{t("emailConfirm.junkFolder")}</strong>.
            </span>
          </div>
        </div>

        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary rounded-xl text-sm font-bold text-primary-foreground hover:opacity-90 transition-all"
        >
          {t("emailConfirm.backToLogin")}
        </Link>

        <p className="text-[0.65rem] text-muted-foreground mt-6">
          {t("emailConfirm.noEmail")}{" "}
          <Link to="/auth" className="text-primary hover:opacity-80 transition-opacity">
            {t("emailConfirm.retry")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
