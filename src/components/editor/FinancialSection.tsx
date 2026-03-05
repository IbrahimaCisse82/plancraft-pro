import { SectionConfig } from "./sectionConfig";

interface Props {
  section: SectionConfig;
  value: Record<string, Record<string, string>>;
  onChange: (value: Record<string, Record<string, string>>) => void;
  devise: string;
}

const FinancialSection = ({ section, value, onChange, devise }: Props) => {
  const rows = section.rows || [];
  const columns = section.columns || [];

  const handleCell = (row: string, col: string, cellValue: string) => {
    const next = { ...value };
    if (!next[row]) next[row] = {};
    next[row] = { ...next[row], [col]: cellValue };
    onChange(next);
  };

  const getCell = (row: string, col: string) => value?.[row]?.[col] || "";

  const currencySymbol = devise.includes("FCFA") ? "FCFA" : devise.includes("EUR") ? "€" : devise.includes("USD") ? "$" : devise.includes("MAD") ? "MAD" : "";

  return (
    <div>
      {section.hint && (
        <div className="mb-4 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground leading-relaxed">
          💡 {section.hint}
        </div>
      )}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-3 py-2.5 text-xs font-bold text-secondary-foreground border-b border-border min-w-[180px]">
                {columns[0] === "Désignation" ? "Désignation" : "Poste"}
              </th>
              {columns.map((col) => (
                <th key={col} className="text-right px-3 py-2.5 text-xs font-bold text-secondary-foreground border-b border-border min-w-[100px]">
                  {col} {col !== "Désignation" && currencySymbol ? `(${currencySymbol})` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row} className={`${i % 2 === 0 ? "bg-card" : "bg-secondary/30"} hover:bg-primary/5 transition-colors`}>
                <td className="px-3 py-2 text-xs font-medium text-foreground border-b border-border/50">
                  {row}
                </td>
                {columns.map((col) => (
                  <td key={col} className="px-1 py-1 border-b border-border/50">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={getCell(row, col)}
                      onChange={(e) => handleCell(row, col, e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 bg-transparent text-right text-xs text-foreground outline-none focus:bg-primary/5 rounded transition-colors"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialSection;
