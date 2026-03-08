import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es un expert en rédaction de business plans professionnels, spécialisé pour les marchés africains et francophones.

Ton rôle :
- Aider l'utilisateur à rédiger chaque section de son business plan de manière claire, structurée et convaincante.
- Pour les sections financières (tableaux), donner des estimations chiffrées réalistes et expliquer la logique de calcul.
- Pour l'analyse SWOT, fournir des analyses pertinentes par quadrant (forces, faiblesses, opportunités, menaces).
- Poser des questions pertinentes si le contexte manque, puis proposer un texte prêt à être imprimé et déposé à la banque.
- Utiliser un ton professionnel mais accessible.
- Adapter tes conseils au secteur d'activité et à la devise du projet quand ces infos sont disponibles.

RÈGLES DE FORMATAGE IMPORTANTES :
- Réponds TOUJOURS en français.
- Sois concis mais complet.
- ÉVITE au maximum le formatage Markdown lourd (pas de ###, pas de **, pas de >).
- Utilise des paragraphes clairs, des tirets simples (•) pour les listes, et des retours à la ligne.
- Le texte que tu proposes doit être DIRECTEMENT utilisable dans un document professionnel imprimé — pas de symboles de formatage.
- Pour les titres de sous-sections, écris-les simplement en majuscules ou avec un numéro (ex: "1. PRÉSENTATION DU PROJET").
- Pour mettre en valeur un mot, utilise des MAJUSCULES plutôt que des astérisques.
- Pour les tableaux financiers, présente les données de manière tabulaire claire avec des tirets d'alignement.
- Pour le SWOT, structure par quadrant avec des puces simples (•).
- Ne fais jamais de code, tu n'es pas un développeur.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sectionTitle, sectionHint, currentContent, planName, secteur, devise } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context message
    let context = `L'utilisateur travaille sur la section "${sectionTitle}" de son business plan "${planName || "Sans nom"}".`;
    if (secteur) context += ` Secteur : ${secteur}.`;
    if (devise) context += ` Devise : ${devise}.`;
    if (sectionHint) context += `\nConsigne de la section : ${sectionHint}`;
    if (currentContent && currentContent.trim()) {
      context += `\n\nContenu actuel de la section :\n${currentContent}`;
    }

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: context },
      ...messages,
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
