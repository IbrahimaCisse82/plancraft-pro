import { useEffect, useMemo, useRef } from "react";
import { SectionConfig } from "./sectionConfig";
import FinancialChart from "./FinancialChart";
import { applyFormulas, isComputedRow } from "@/lib/financialFormulas";
import { useI18n } from "@/contexts/I18nContext";
import { translateRowLabel, translateColumnLabel } from "@/lib/financialRowLabels";

interface Props {
  section: SectionConfig;
  value: Record<string, Record<string, string>>;
  onChange: (value: Record<string, Record<string, string>>) => void;
  devise: string;
  hint?: string;
}

const formatNumber = (val: string): string => {
  return val.replace(/[^\d-]/g, "");
};

const FinancialSection = ({ section, value, onChange, devise, hint }: Props) => {
  const { t, lang } = useI18n();
  const rows = section.rows || [];
  const columns = section.columns || [];
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Apply formulas to get computed values
  const computedData = useMemo(
    () => applyFormulas(section.id, value, columns),
    [section.id, value, columns]
  );

  // Sync computed values back to parent when inputs change
  useEffect(() => {
    let hasChanges = false;
    for (const row of Object.keys(computedData)) {
      if (!isComputedRow(section.id, row)) continue;
      for (const col of columns) {
        if (computedData[row]?.[col] !== value[row]?.[col]) {
          hasChanges = true;
          break;
        }
      }
      if (hasChanges) break;
    }
    if (hasChanges) {
      onChangeRef.current(computedData);
    }
  }, [computedData, section.id, columns, value]);

  const handleCell = (row: string, col: string, cellValue: string) => {
    const sanitized = formatNumber(cellValue);
    const next = { ...value };
    if (!next[row]) next[row] = {};
    next[row] = { ...next[row], [col]: sanitized };
    onChange(next);
  };

  const getCell = (row: string, col: string) => computedData?.[row]?.[col] || "";

  const displayValue = (val: string) => {
    if (!val || val === "0") return "";
    const n = parseInt(val, 10);
    if (isNaN(n)) return val;
    return n.toLocaleString("fr-FR");
  };

  const currencySymbol = devise.includes("FCFA") ? "FCFA" : devise.includes("EUR") ? "€" : devise.includes("USD") ? "$" : devise.includes("MAD") ? "MAD" : "";

  const isSeparator = (row: string) => row.startsWith("---");
  const separatorLabel = (row: string) => row.replace(/^-+\s*/, "").replace(/\s*-+$/, "");

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
                <th key={col} className="text-right px-3 py-2.5 text-xs font-bold text-secondary-foreground border-b border-border min-w-[100px]">
                  {translateColumnLabel(col, lang)} {currencySymbol && !["Effectif", "Taux de marge (%)", "Durée (années)", "Taux d'intérêt (%)", "Salaire mensuel"].includes(col) ? `(${currencySymbol})` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              if (isSeparator(row)) {
                return (
                  <tr key={row} className="bg-muted/50">
                    <td
                      colSpan={columns.length + 1}
                      className="px-3 py-2 text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50"
                    >
                      {translateRowLabel(row, lang).replace(/^-+\s*/, "").replace(/\s*-+$/, "") || separatorLabel(row)}
                    </td>
                  </tr>
                );
              }

              const computed = isComputedRow(section.id, row);

              return (
                <tr
                  key={row}
                  className={`${
                    computed
                      ? "bg-primary/5 font-semibold"
                      : i % 2 === 0
                      ? "bg-card"
                      : "bg-secondary/30"
                  } hover:bg-primary/5 transition-colors`}
                >
                  <td className={`px-3 py-2 text-xs font-medium border-b border-border/50 sticky left-0 bg-inherit z-10 ${computed ? "text-primary" : "text-foreground"}`}>
                    {row}
                    {computed && (
                      <span className="ml-1.5 text-[0.6rem] text-muted-foreground font-normal">
                        {t("editor.auto")}
                      </span>
                    )}
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="px-1 py-1 border-b border-border/50">
                      {computed ? (
                        <div className="w-full px-2 py-1.5 text-right text-xs text-primary font-bold">
                          {displayValue(getCell(row, col))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={getCell(row, col)}
                          onChange={(e) => handleCell(row, col, e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1.5 bg-transparent text-right text-xs text-foreground outline-none focus:bg-primary/5 rounded transition-colors"
                          aria-label={`${row} - ${col}`}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <FinancialChart section={section} value={computedData} devise={devise} />
    </div>
  );
};

export default FinancialSection;
