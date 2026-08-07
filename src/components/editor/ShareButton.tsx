import { useState, useEffect } from "react";
import { Share2, Link2, Copy, Check, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";

interface Props {
  planId: string;
}

const ShareButton = ({ planId }: Props) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<{ id: string; token: string; is_active: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const [stats, setStats] = useState<{ count: number; last: string | null }>({ count: 0, last: null });

  useEffect(() => {
    if (!open || !user) return;
    const fetchLink = async () => {
      const { data } = await supabase
        .from("share_links")
        .select("id, token, is_active")
        .eq("plan_id", planId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setShareLink(data as any);

      const { data: views, count } = await supabase
        .from("share_views")
        .select("created_at", { count: "exact" })
        .eq("plan_id", planId)
        .order("created_at", { ascending: false })
        .limit(1);
      setStats({ count: count ?? 0, last: views?.[0]?.created_at ?? null });
    };
    fetchLink();
  }, [open, planId, user]);

  const createLink = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("share_links")
      .insert({ plan_id: planId, user_id: user.id })
      .select("id, token, is_active")
      .single();
    setLoading(false);
    if (error) {
      toast.error(t("share.createError"));
    } else {
      setShareLink(data as any);
      toast.success(t("share.linkCreated"));
    }
  };

  const toggleActive = async () => {
    if (!shareLink) return;
    const next = !shareLink.is_active;
    const { error } = await supabase
      .from("share_links")
      .update({ is_active: next })
      .eq("id", shareLink.id);
    if (error) { toast.error(t("share.createError")); return; }
    setShareLink({ ...shareLink, is_active: next });
    toast.success(next ? t("share.reactivated") : t("share.revoked"));
  };

  const deleteLink = async () => {
    if (!shareLink) return;
    await supabase.from("share_links").delete().eq("id", shareLink.id);
    setShareLink(null);
    toast.success(t("share.linkDeleted"));
  };

  const getShareUrl = () => {
    if (!shareLink) return "";
    return `${window.location.origin}/share/${shareLink.token}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    toast.success(t("share.linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
        aria-label={t("share.button")}
      >
        <Share2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("share.button")}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-[320px] bg-card border border-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">{t("share.title")}</span>
            </div>

            {shareLink ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {t("share.description")}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded-md text-[10px] text-foreground font-mono truncate"
                  />
                  <button
                    onClick={copyLink}
                    className="p-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-all shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={deleteLink}
                  className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  {t("share.deleteLink")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {t("share.createDesc")}
                </p>
                <button
                  onClick={createLink}
                  disabled={loading}
                  className="w-full py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? t("share.creating") : t("share.createBtn")}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
