import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Shield, Briefcase } from "lucide-react";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LangToggle from "@/components/shared/LangToggle";
import { usePlan } from "@/hooks/usePlan";

interface Props {
  showAdmin?: boolean;
  showDashboard?: boolean;
  showHome?: boolean;
  showLogout?: boolean;
  children?: React.ReactNode;
}

const TopBar = ({ showAdmin = false, showDashboard = false, showHome = false, showLogout = true, children }: Props) => {
  const { isAdmin, profile, user, signOut } = useAuth();
  const { t, lang } = useI18n();
  const { limits } = usePlan();
  const navigate = useNavigate();

  const displayName = profile?.display_name || user?.email || (t("common.loading"));
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="sticky top-0 z-50 h-[58px] bg-card border-b border-border flex items-center px-5 md:px-8 gap-4">
      <Link to="/" className="font-display text-xl font-bold text-[hsl(var(--gold-light))]">
        Plan<span className="text-secondary-foreground font-normal">Craft</span> Pro
      </Link>

      {showAdmin && isAdmin && (
        <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[0.6rem] font-bold uppercase tracking-wider flex items-center gap-1">
          <Shield className="w-3 h-3" /> Admin
        </span>
      )}

      {children}

      <div className="ml-auto flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
        <Link
          to="/profile"
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-full text-xs text-secondary-foreground hover:border-primary/30 transition-all cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.7rem] font-bold">
            {initial}
          </div>
          <span className="hidden sm:inline">{displayName}</span>
        </Link>

        {user && (
          <Link
            to="/admin/login"
            className="flex items-center gap-1 px-4 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
          >
            <Shield className="w-3 h-3" /> Backoffice
          </Link>
        )}

        {isAdmin && (
          <Link
            to="/admin"
            className="px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-md text-xs font-semibold text-primary hover:bg-primary/30 transition-all"
          >
            {t("topbar.admin")}
          </Link>
        )}

        {showDashboard && (
          <Link to="/dashboard" className="px-4 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all">
            {t("nav.dashboard")}
          </Link>
        )}

        {limits.coachClients && user && (
          <Link to="/clients" className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all">
            <Briefcase className="w-3 h-3" /> {lang === "fr" ? "Clients" : "Clients"}
          </Link>
        )}

        {showHome && (
          <Link to="/" className="px-4 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all">
            {t("topbar.home")}
          </Link>
        )}

        {showLogout && (
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="px-4 py-1.5 bg-secondary border border-destructive/30 rounded-md text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all"
          >
            {t("topbar.logout")}
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
