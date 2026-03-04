import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const BusinessPlanEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("business_plans")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        toast.error("Business plan introuvable");
        navigate("/dashboard");
      } else {
        setPlan(data);
      }
      setLoading(false);
    };
    fetchPlan();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-50 h-[58px] bg-card border-b border-border flex items-center px-5 md:px-8 gap-4">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Retour au tableau de bord
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {plan.devise}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wide bg-secondary text-muted-foreground">
            {plan.statut}
          </span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 md:px-8 py-10">
        <h1 className="font-display text-3xl font-bold mb-2">{plan.name}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {plan.secteur || "Aucun secteur"} · Créé le {new Date(plan.created_at).toLocaleDateString("fr-FR")}
        </p>

        <div className="bg-card border border-border rounded-2xl p-8">
          <p className="text-muted-foreground text-sm">
            L'éditeur de business plan avec les 14 sections sera bientôt disponible ici.
          </p>
          <p className="text-muted-foreground text-xs mt-4">
            Sections prévues : Résumé exécutif, Présentation du projet, Étude de marché, Stratégie commerciale, Plan opérationnel, Ressources humaines, Plan financier, etc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanEditor;
