import { useI18n } from "@/contexts/I18nContext";

export type ChecklistStatus = "todo" | "in_progress" | "done" | "na";

export interface ChecklistItem {
  key: string;
  status: ChecklistStatus;
  reference?: string;
  notes?: string;
}

interface Props {
  value: { items?: Record<string, ChecklistItem>; custom?: ChecklistItem[]; notes?: string };
  onChange: (val: any) => void;
  hint?: string;
}

const DEFAULT_ITEMS: { key: string; labelKey: string; group: "societe" | "immo" | "commercial" | "ip" | "conformite" }[] = [
  { key: "statuts", labelKey: "legal.item.statuts", group: "societe" },
  { key: "kbis_rccm", labelKey: "legal.item.kbisRccm", group: "societe" },
  { key: "pv_ag", labelKey: "legal.item.pvAg", group: "societe" },
  { key: "pacte_associes", labelKey: "legal.item.pacte", group: "societe" },
  { key: "identite_dirigeants", labelKey: "legal.item.identite", group: "societe" },
  { key: "bail_commercial", labelKey: "legal.item.bail", group: "immo" },
  { key: "titre_propriete", labelKey: "legal.item.titreProp", group: "immo" },
  { key: "assurances", labelKey: "legal.item.assurances", group: "immo" },
  { key: "contrats_clients", labelKey: "legal.item.contratsClients", group: "commercial" },
  { key: "contrats_fournisseurs", labelKey: "legal.item.contratsFournisseurs", group: "commercial" },
  { key: "commandes_lettres", labelKey: "legal.item.commandes", group: "commercial" },
  { key: "brevets_marques", labelKey: "legal.item.brevets", group: "ip" },
  { key: "logiciels_licences", labelKey: "legal.item.licences", group: "ip" },
  { key: "cessions_ip", labelKey: "legal.item.cessionsIp", group: "ip" },
  { key: "agrement_licence_activite", labelKey: "legal.item.agrement", group: "conformite" },
  { key: "attestation_fiscale", labelKey: "legal.item.fisc", group: "conformite" },
  { key: "attestation_sociale", labelKey: "legal.item.social", group: "conformite" },
  { key: "rgpd", labelKey: "legal.item.rgpd", group: "conformite" },
];

const STATUS_COLORS: Record<ChecklistStatus, string> = {
  todo: "bg-destructive/15 text-destructive border-destructive/30",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  done: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  na: "bg-muted text-muted-foreground border-border",
};

const LegalAnnexesSection = ({ value, onChange, hint }: Props) => {
  const { t } = useI18n();
  const items = value.items || {};
  const custom = value.custom || [];

  const getItem = (key: string): ChecklistItem =>
    items[key] || { key, status: "todo", reference: "", notes: "" };

  const updateItem = (key: string, patch: Partial<ChecklistItem>) => {
    onChange({
      ...value,
      items: { ...items, [key]: { ...getItem(key), ...patch } },
    });
  };

  const addCustom = () =>
    onChange({
      ...value,
      custom: [...custom, { key: `custom_${Date.now()}`, status: "todo", reference: "", notes: "" }],
    });

  const updateCustom = (idx: number, patch: Partial<ChecklistItem> & { label?: string }) => {
    const next = custom.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChange({ ...value, custom: next });
  };

  const removeCustom = (idx: number) =>
    onChange({ ...value, custom: custom.filter((_, i) => i !== idx) });

  const groups: { key: string; labelKey: string }[] = [
    { key: "societe", labelKey: "legal.group.societe" },
    { key: "immo", labelKey: "legal.group.immo" },
    { key: "commercial", labelKey: "legal.group.commercial" },
    { key: "ip", labelKey: "legal.group.ip" },
    { key: "conformite", labelKey: "legal.group.conformite" },
  ];

  // Global progress
  const allItems = [...DEFAULT_ITEMS.map((d) => getItem(d.key)), ...custom];
  const done = allItems.filter((i) => i.status === "done").length;
  const total = allItems.filter((i) => i.status !== "na").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const statusOptions: ChecklistStatus[] = ["todo", "in_progress", "done", "na"];

  return (
    <div>
      {hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}

      {/* Progress */}
      <div className="mb-6 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("legal.progress")}
          </span>
          <span className="text-sm font-bold font-mono text-foreground">
            {done} / {total} · {pct}%
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Groups */}
      {groups.map((g) => {
        const groupItems = DEFAULT_ITEMS.filter((d) => d.group === g.key);
        if (groupItems.length === 0) return null;
        return (
          <div key={g.key} className="mb-5">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {t(g.labelKey)}
            </div>
            <div className="space-y-2">
              {groupItems.map((d) => {
                const item = getItem(d.key);
                return (
                  <div key={d.key} className="p-3 bg-card border border-border rounded-lg">
                    <div className="flex items-start gap-3 mb-2 flex-wrap">
                      <div className="flex-1 min-w-[180px] text-sm font-medium text-foreground">
                        {t(d.labelKey)}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {statusOptions.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateItem(d.key, { status: s })}
                            className={`px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider rounded border transition-all ${
                              item.status === s
                                ? STATUS_COLORS[s]
                                : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
                            }`}
                          >
                            {t(`legal.status.${s}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        value={item.reference ?? ""}
                        onChange={(e) => updateItem(d.key, { reference: e.target.value })}
                        placeholder={t("legal.referencePlaceholder")}
                        className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-xs"
                      />
                      <input
                        value={item.notes ?? ""}
                        onChange={(e) => updateItem(d.key, { notes: e.target.value })}
                        placeholder={t("legal.notesPlaceholder")}
                        className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Custom items */}
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {t("legal.group.custom")}
        </div>
        <div className="space-y-2">
          {custom.map((c: any, idx) => (
            <div key={c.key} className="p-3 bg-card border border-border rounded-lg">
              <div className="flex items-start gap-3 mb-2 flex-wrap">
                <input
                  value={c.label ?? ""}
                  onChange={(e) => updateCustom(idx, { label: e.target.value })}
                  placeholder={t("legal.customPlaceholder")}
                  className="flex-1 min-w-[180px] px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-sm font-medium"
                />
                <div className="flex gap-1 flex-wrap">
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateCustom(idx, { status: s })}
                      className={`px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider rounded border transition-all ${
                        c.status === s
                          ? STATUS_COLORS[s]
                          : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      {t(`legal.status.${s}`)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => removeCustom(idx)}
                  className="text-[0.65rem] font-semibold text-destructive hover:opacity-80"
                >
                  {t("team.remove")}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  value={c.reference ?? ""}
                  onChange={(e) => updateCustom(idx, { reference: e.target.value })}
                  placeholder={t("legal.referencePlaceholder")}
                  className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-xs"
                />
                <input
                  value={c.notes ?? ""}
                  onChange={(e) => updateCustom(idx, { notes: e.target.value })}
                  placeholder={t("legal.notesPlaceholder")}
                  className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-xs"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addCustom}
            className="px-3 py-2 bg-secondary border border-border rounded-lg text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
          >
            + {t("legal.addCustom")}
          </button>
        </div>
      </div>

      {/* Global notes */}
      <label className="block mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("legal.globalNotes")}
        </span>
        <textarea
          value={value.notes ?? ""}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder={t("legal.globalNotesPlaceholder")}
          rows={4}
          className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground text-sm leading-relaxed"
        />
      </label>

      <div className="text-[0.65rem] text-muted-foreground leading-relaxed">
        {t("legal.footnote")}
      </div>
    </div>
  );
};

export default LegalAnnexesSection;
