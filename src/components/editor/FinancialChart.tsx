import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { SectionConfig } from "./sectionConfig";
import { isComputedRow } from "@/lib/financialFormulas";

interface Props {
  section: SectionConfig;
  value: Record<string, Record<string, string>>;
  devise: string;
}

const COLORS = [
  "hsl(43, 55%, 54%)",   // gold
  "hsl(155, 62%, 53%)",  // success
  "hsl(217, 90%, 64%)",  // info
  "hsl(2, 82%, 60%)",    // destructive
  "hsl(280, 60%, 60%)",  // purple
  "hsl(30, 80%, 55%)",   // orange
];

/** Sections that benefit from multi-line charts instead of simple bar totals */
const MULTI_LINE_SECTIONS = [
  "compte_resultat",
  "plan_financement",
  "seuil_rentabilite",
  "bilan_previsionnel",
];

/** Key rows to display per section for multi-line charts */
const KEY_ROWS: Record<string, string[]> = {
  compte_resultat: ["Chiffre d'affaires", "Total charges", "Résultat net"],
  plan_financement: ["Total emplois", "Total ressources", "Écart (Ressources - Emplois)"],
  seuil_rentabilite: ["Chiffre d'affaires", "Seuil de rentabilité (CA)", "Charges fixes"],
  bilan_previsionnel: ["TOTAL ACTIF", "TOTAL PASSIF"],
  tresorerie: ["Total encaissements", "Total décaissements", "Solde cumulé"],
};

const FinancialChart = ({ section, value, devise }: Props) => {
  const rows = section.rows || [];
  const columns = section.columns || [];

  const currencySymbol = devise.includes("FCFA") ? "FCFA" : devise.includes("EUR") ? "€" : devise.includes("USD") ? "$" : devise.includes("MAD") ? "MAD" : "";

  const isMultiLine = MULTI_LINE_SECTIONS.includes(section.id) || section.id === "tresorerie";
  const keyRows = KEY_ROWS[section.id];

  // Multi-line chart data
  const multiLineData = useMemo(() => {
    if (!keyRows) return [];
    return columns.map((col) => {
      const point: Record<string, string | number> = { name: col };
      keyRows.forEach((row) => {
        const v = parseInt(value?.[row]?.[col] || "0", 10);
        point[row] = isNaN(v) ? 0 : v;
      });
      return point;
    });
  }, [value, columns, keyRows]);

  // Simple bar chart data (sum of non-separator, non-total rows)
  const barData = useMemo(() => {
    return columns.map((col) => {
      const total = rows.reduce((sum, row) => {
        if (row.startsWith("---") || isComputedRow(section.id, row)) return sum;
        const v = parseInt(value?.[row]?.[col] || "0", 10);
        return sum + (isNaN(v) ? 0 : Math.abs(v));
      }, 0);
      return { name: col, total };
    });
  }, [value, columns, rows, section.id]);

  const hasMultiLineData = multiLineData.some((d) => keyRows?.some((r) => (d[r] as number) !== 0));
  const hasBarData = barData.some((d) => d.total > 0);

  if (!hasMultiLineData && !hasBarData) return null;

  const tooltipStyle = {
    backgroundColor: "hsl(225, 15%, 10%)",
    border: "1px solid hsl(0 0% 100% / 0.1)",
    borderRadius: "8px",
    fontSize: "12px",
  };

  const formatValue = (val: number) => `${val.toLocaleString("fr-FR")} ${currencySymbol}`;
  const formatAxis = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`;

  // Show multi-line chart for key sections
  if (isMultiLine && keyRows && hasMultiLineData) {
    return (
      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">📊 Évolution</h4>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={multiLineData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(30, 7%, 40%)" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(30, 7%, 40%)" }} tickFormatter={formatAxis} />
            <Tooltip
              formatter={(val: number, name: string) => [formatValue(val), name]}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "hsl(36, 20%, 93%)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              iconType="line"
            />
            {keyRows.map((row, i) => (
              <Line
                key={row}
                type="monotone"
                dataKey={row}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS[i % COLORS.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default bar chart
  if (!hasBarData) return null;

  return (
    <div className="mt-6 p-4 bg-card border border-border rounded-lg">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">📊 Visualisation</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(30, 7%, 40%)" }} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(30, 7%, 40%)" }} tickFormatter={formatAxis} />
          <Tooltip
            formatter={(val: number) => [formatValue(val), "Total"]}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "hsl(36, 20%, 93%)" }}
          />
          <Bar dataKey="total" fill="hsl(43, 55%, 54%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;
