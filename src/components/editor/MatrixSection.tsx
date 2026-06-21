import { SectionConfig } from "./sectionConfig";
import { useI18n } from "@/contexts/I18nContext";

interface Props {
  section: SectionConfig;
  value: Record<string, Record<string, string>>;
  onChange: (value: Record<string, Record<string, string>>) => void;
  hint?: string;
}

/**
 * Free-text matrix table for qualitative sections such as Garanties
 * and Matrice des risques. Cells accept any text (no numeric sanitization).
 * For the risk matrix, "Criticité" is auto-computed from Probabilité × Impact.
 */
const MatrixSection = ({ section, value, onChange, hint }: Props) => {
  const { t } = useI18n();
  const rows = section.rows || [];
  const columns = section.columns || [];

  const isRiskMatrix = section.id === "matrice_risques";

  const getCell = (row: string, col: string): string => {
    if (isRiskMatrix && col === "Criticité") {
      const p = parseInt(value[row]?.["Probabilité (1-5)"] || "", 10);
      const i = parseInt(value[row]?.["Impact (1-5)"] || "", 10);
      if (!isNaN(p) && !isNaN(i)) return String(p * i);
      return "";
    }
    return value[row]?.[col] || "";
  };

  const criticityColor = (c: string): string => {
    const n = parseInt(c, 10);
    if (isNaN(n)) return "";
    if (n >= 15) return "bg-destructive/20 text-destructive font-bold";
    if (n >= 8) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-semibold";
    if (n >= 1) return "bg-green-500/15 text-green-700 dark:text-green-400";
    return "";
  };

  const handleCell = (row: string, col: string, v: string) => {
    const next = { ...value };
    if (!next[row]) next[row] = {};
    next[row] = { ...next[row], [col]: v };
    onChange(next);
  };

  const isComputed = (col: string) => isRiskMatrix && col === "Criticité";

  return (
    <div>
      {hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {hint}
        </div>
      )}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-3 py-2.5 text-xs font-bold text-secondary-foreground border-b border-border min-w-[180px] sticky left-0 bg-secondary z-10">
                {t("editor.post")}
              </th>
              {columns.map((col) => (
                <th key={col} className="text-left px-3 py-2.5 text-xs font-bold text-secondary-foreground border-b border-border min-w-[140px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row}
                className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} hover:bg-primary/5 transition-colors`}
              >
                <td className="px-3 py-2 text-xs font-medium border-b border-border/50 sticky left-0 bg-inherit z-10 text-foreground">
                  {row}
                </td>
                {columns.map((col) => {
                  const computed = isComputed(col);
                  const cell = getCell(row, col);
                  return (
                    <td key={col} className="px-1 py-1 border-b border-border/50">
                      {computed ? (
                        <div className={`w-full px-2 py-1.5 text-center text-xs rounded ${criticityColor(cell)}`}>
                          {cell || "—"}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCell(row, col, e.target.value)}
                          placeholder="—"
                          className="w-full px-2 py-1.5 bg-transparent text-left text-xs text-foreground outline-none focus:bg-primary/5 rounded transition-colors"
                          aria-label={`${row} - ${col}`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isRiskMatrix && (
        <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem] text-muted-foreground">
          <span className="px-2 py-1 rounded bg-green-500/15 text-green-700 dark:text-green-400">{t("matrix.lowRisk")}</span>
          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">{t("matrix.medRisk")}</span>
          <span className="px-2 py-1 rounded bg-destructive/20 text-destructive">{t("matrix.highRisk")}</span>
        </div>
      )}
    </div>
  );
};

export default MatrixSection;
