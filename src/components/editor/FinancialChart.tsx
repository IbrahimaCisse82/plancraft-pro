import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SectionConfig } from "./sectionConfig";

interface Props {
  section: SectionConfig;
  value: Record<string, Record<string, string>>;
  devise: string;
}

const FinancialChart = ({ section, value, devise }: Props) => {
  const rows = section.rows || [];
  const columns = section.columns || [];

  // Build chart data: one bar per column with totals of filled rows
  const chartData = columns.map((col) => {
    const total = rows.reduce((sum, row) => {
      const v = parseInt(value?.[row]?.[col] || "0", 10);
      return sum + (isNaN(v) ? 0 : Math.abs(v));
    }, 0);
    return { name: col, total };
  });

  const hasData = chartData.some((d) => d.total > 0);
  if (!hasData) return null;

  const currencySymbol = devise.includes("FCFA") ? "FCFA" : devise.includes("EUR") ? "€" : devise.includes("USD") ? "$" : devise.includes("MAD") ? "MAD" : "";

  return (
    <div className="mt-6 p-4 bg-card border border-border rounded-lg">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">📊 Visualisation</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(30, 7%, 40%)" }} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(30, 7%, 40%)" }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
          <Tooltip
            formatter={(val: number) => [`${val.toLocaleString("fr-FR")} ${currencySymbol}`, "Total"]}
            contentStyle={{ backgroundColor: "hsl(225, 15%, 10%)", border: "1px solid hsl(0 0% 100% / 0.1)", borderRadius: "8px", fontSize: "12px" }}
            labelStyle={{ color: "hsl(36, 20%, 93%)" }}
          />
          <Bar dataKey="total" fill="hsl(43, 55%, 54%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;
