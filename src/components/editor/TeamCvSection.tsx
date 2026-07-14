import { useI18n } from "@/contexts/I18nContext";

export interface TeamMember {
  nom: string;
  role: string;
  formation: string;
  experience: string;
  realisations: string;
  contact?: string;
}

interface Props {
  value: { members?: TeamMember[]; notes?: string };
  onChange: (val: any) => void;
  hint?: string;
}

const EMPTY: TeamMember = { nom: "", role: "", formation: "", experience: "", realisations: "", contact: "" };

const TeamCvSection = ({ value, onChange, hint }: Props) => {
  const { t } = useI18n();
  const members: TeamMember[] = value.members?.length ? value.members : [{ ...EMPTY }];

  const update = (idx: number, field: keyof TeamMember, v: string) => {
    const next = members.map((m, i) => (i === idx ? { ...m, [field]: v } : m));
    onChange({ ...value, members: next });
  };

  const addMember = () => onChange({ ...value, members: [...members, { ...EMPTY }] });
  const removeMember = (idx: number) =>
    onChange({ ...value, members: members.filter((_, i) => i !== idx) });

  return (
    <div>
      {hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}

      <div className="space-y-4">
        {members.map((m, idx) => (
          <div key={idx} className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("team.member")} #{idx + 1}
              </div>
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(idx)}
                  className="text-[0.65rem] font-semibold text-destructive hover:opacity-80"
                >
                  {t("team.remove")}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("team.name")}
                </span>
                <input
                  value={m.nom}
                  onChange={(e) => update(idx, "nom", e.target.value)}
                  placeholder={t("team.namePlaceholder")}
                  className="w-full mt-1 px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-sm"
                />
              </label>
              <label className="block">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("team.role")}
                </span>
                <input
                  value={m.role}
                  onChange={(e) => update(idx, "role", e.target.value)}
                  placeholder={t("team.rolePlaceholder")}
                  className="w-full mt-1 px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-sm"
                />
              </label>
            </div>

            <label className="block mb-3">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                {t("team.formation")}
              </span>
              <textarea
                value={m.formation}
                onChange={(e) => update(idx, "formation", e.target.value)}
                placeholder={t("team.formationPlaceholder")}
                rows={2}
                className="w-full mt-1 px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-sm leading-relaxed"
              />
            </label>

            <label className="block mb-3">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                {t("team.experience")}
              </span>
              <textarea
                value={m.experience}
                onChange={(e) => update(idx, "experience", e.target.value)}
                placeholder={t("team.experiencePlaceholder")}
                rows={3}
                className="w-full mt-1 px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-sm leading-relaxed"
              />
            </label>

            <label className="block mb-3">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                {t("team.achievements")}
              </span>
              <textarea
                value={m.realisations}
                onChange={(e) => update(idx, "realisations", e.target.value)}
                placeholder={t("team.achievementsPlaceholder")}
                rows={2}
                className="w-full mt-1 px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-sm leading-relaxed"
              />
            </label>

            <label className="block">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                {t("team.contact")}
              </span>
              <input
                value={m.contact ?? ""}
                onChange={(e) => update(idx, "contact", e.target.value)}
                placeholder={t("team.contactPlaceholder")}
                className="w-full mt-1 px-2 py-1.5 bg-secondary border border-border rounded text-foreground text-sm"
              />
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={addMember}
        className="mt-4 px-3 py-2 bg-secondary border border-border rounded-lg text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
      >
        + {t("team.addMember")}
      </button>

      <label className="block mt-6">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("team.governance")}
        </span>
        <textarea
          value={value.notes ?? ""}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder={t("team.governancePlaceholder")}
          rows={4}
          className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground text-sm leading-relaxed"
        />
      </label>

      <div className="mt-4 text-[0.65rem] text-muted-foreground leading-relaxed">
        {t("team.footnote")}
      </div>
    </div>
  );
};

export default TeamCvSection;
