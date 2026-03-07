import { Link } from "react-router-dom";
import { CheckCircle, Mail } from "lucide-react";

const EmailConfirmationPage = () => {
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

        <h1 className="font-display text-2xl font-bold mb-3">Vérifiez votre email</h1>

        <p className="text-sm text-secondary-foreground leading-relaxed mb-6">
          Un email de confirmation a été envoyé à votre adresse. Cliquez sur le lien dans l'email pour activer votre compte.
        </p>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Si vous ne trouvez pas l'email, vérifiez votre dossier <strong className="text-foreground">spam</strong> ou <strong className="text-foreground">courrier indésirable</strong>.
            </span>
          </div>
        </div>

        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary rounded-xl text-sm font-bold text-primary-foreground hover:opacity-90 transition-all"
        >
          Retour à la connexion →
        </Link>

        <p className="text-[0.65rem] text-muted-foreground mt-6">
          Vous n'avez pas reçu d'email ?{" "}
          <Link to="/auth" className="text-primary hover:opacity-80 transition-opacity">
            Réessayer l'inscription
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
