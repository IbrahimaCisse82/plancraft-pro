import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_MODELS: Record<string, { id: string; cost: number }> = {
  "gemini-flash": { id: "google/gemini-3-flash-preview", cost: 1 },
  "gemini-pro": { id: "google/gemini-2.5-pro", cost: 1 },
  "gpt-5-mini": { id: "openai/gpt-5-mini", cost: 2 },
  "gpt-5": { id: "openai/gpt-5", cost: 2 },
};
const DEFAULT_MODEL_KEY = "gemini-flash";

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

// Input validation limits
const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES = 30;
const MAX_CONTENT_LENGTH = 50000;
const MAX_FIELD_LENGTH = 500;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth: identify the calling user (verify_jwt=false, we validate manually) ──
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Authentification requise" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Session invalide" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { messages, sectionTitle, sectionHint, currentContent, planName, secteur, devise, model: modelKey } = body;

    // Resolve & validate model choice (server-side, never trust client)
    const chosen = ALLOWED_MODELS[typeof modelKey === "string" ? modelKey : DEFAULT_MODEL_KEY] ?? ALLOWED_MODELS[DEFAULT_MODEL_KEY];

    // ── Input validation ──
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: `Maximum ${MAX_MESSAGES} messages par conversation` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return new Response(JSON.stringify({ error: "Format de message invalide" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!["user", "assistant"].includes(msg.role)) {
        return new Response(JSON.stringify({ error: "Rôle de message invalide" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ error: `Message trop long (max ${MAX_MESSAGE_LENGTH} caractères)` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (typeof sectionTitle !== "string" || sectionTitle.length > MAX_FIELD_LENGTH) {
      return new Response(JSON.stringify({ error: "Titre de section invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (currentContent && typeof currentContent === "string" && currentContent.length > MAX_CONTENT_LENGTH) {
      return new Response(JSON.stringify({ error: `Contenu trop long (max ${MAX_CONTENT_LENGTH} caractères)` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize optional string fields
    const safePlanName = typeof planName === "string" ? planName.slice(0, MAX_FIELD_LENGTH) : "Sans nom";
    const safeSecteur = typeof secteur === "string" ? secteur.slice(0, MAX_FIELD_LENGTH) : "";
    const safeDevise = typeof devise === "string" ? devise.slice(0, MAX_FIELD_LENGTH) : "";
    const safeSectionHint = typeof sectionHint === "string" ? sectionHint.slice(0, MAX_FIELD_LENGTH) : "";
    const safeContent = typeof currentContent === "string" ? currentContent.slice(0, MAX_CONTENT_LENGTH) : "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context message
    let context = `L'utilisateur travaille sur la section "${sectionTitle}" de son business plan "${safePlanName}".`;
    if (safeSecteur) context += ` Secteur : ${safeSecteur}.`;
    if (safeDevise) context += ` Devise : ${safeDevise}.`;
    if (safeSectionHint) context += `\nConsigne de la section : ${safeSectionHint}`;
    if (safeContent.trim()) {
      context += `\n\nContenu actuel de la section :\n${safeContent}`;
    }

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: context },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content.slice(0, MAX_MESSAGE_LENGTH),
      })),
    ];

    // ── Quota check & consumption (server-side, atomic) ──
    const { data: quota, error: quotaErr } = await userClient.rpc("consume_ai_credit", {
      _cost: chosen.cost,
    });
    if (quotaErr) {
      console.error("consume_ai_credit error:", quotaErr);
      return new Response(JSON.stringify({ error: "Erreur quota IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const q = quota as { allowed: boolean; reason?: string; plan?: string; used?: number; limit?: number };
    if (!q?.allowed) {
      return new Response(
        JSON.stringify({
          error: q?.reason === "quota_exceeded"
            ? `Quota IA mensuel atteint (${q.used}/${q.limit}). Passez au plan supérieur pour continuer.`
            : "Quota IA indisponible.",
          quota: q,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: chosen.id,
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
