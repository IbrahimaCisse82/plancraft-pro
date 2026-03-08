import { useEffect, useState } from "react";
import { History, Trash2, RotateCcw, Save, X } from "lucide-react";
import { useBPVersions, BPVersion } from "@/hooks/useBPVersions";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

interface Props {
  planId: string;
  content: Record<string, any>;
  onRestore: (content: Record<string, any>) => void;
}

const VersionHistoryPanel = ({ planId, content, onRestore }: Props) => {
  const { versions, loading, fetchVersions, saveVersion, restoreVersion, deleteVersion } = useBPVersions(planId);
  const [open, setOpen] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchVersions();
  }, [open, fetchVersions]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
        aria-label="Historique des versions"
      >
        <History className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Versions</span>
      </button>
    );
  }

  return (
    <>
      <div className="fixed top-[52px] right-0 z-50 w-[320px] h-[calc(100vh-52px)] bg-card border-l border-border shadow-2xl flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
          <History className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold flex-1">Historique des versions</span>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border shrink-0">
          <button
            onClick={() => saveVersion(content)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:opacity-90 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Sauvegarder un snapshot
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Aucune version sauvegardée. Créez un snapshot pour pouvoir restaurer plus tard.
            </p>
          ) : (
            versions.map((v) => (
              <div key={v.id} className="p-3 bg-secondary border border-border rounded-lg">
                <div className="text-xs font-semibold text-foreground mb-1 truncate">
                  {v.label || "Snapshot"}
                </div>
                <div className="text-[0.65rem] text-muted-foreground font-mono mb-2">
                  {new Date(v.created_at).toLocaleString("fr-FR")}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setConfirmRestore(v.id)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restaurer
                  </button>
                  <button
                    onClick={() => deleteVersion(v.id)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmRestore}
        onOpenChange={(o) => !o && setConfirmRestore(null)}
        title="Restaurer cette version ?"
        description="Le contenu actuel sera remplacé par cette version. Pensez à sauvegarder un snapshot avant."
        confirmLabel="Restaurer"
        variant="default"
        onConfirm={async () => {
          if (!confirmRestore) return;
          const data = await restoreVersion(confirmRestore);
          if (data) onRestore(data);
          setConfirmRestore(null);
        }}
      />
    </>
  );
};

export default VersionHistoryPanel;
