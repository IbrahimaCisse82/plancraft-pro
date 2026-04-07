import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useI18n } from "@/contexts/I18nContext";

interface Props {
  content: Record<string, any>;
  devise: string;
}

const num = (val: string | undefined): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

const COLORS = {
  revenue: "hsl(43, 55%, 54%)",
  expenses: "hsl(2, 82%, 60%)",
  netResult: "hsl(155, 62%, 53%)",
  cash: "hsl(217, 90%, 64%)",
};

const BankerCharts = ({ content, devise }: Props) => {
  const { t } = useI18n();
  const currencySymbol = devise.includes("FCFA") ? "FCFA" : devise.includes("EUR") ? "€" : devise.includes("USD") ? "$" : "MAD";

  const years = ["Année 1", "Année 2", "Année 3"];
  const cr = content["compte_resultat"];
  const treso = content["tresorerie"];

  const revenueData = useMemo(() => {
    if (!cr) return [];
    return years.map(y => ({
      name: y.replace("Année ", "A"),
      [t("banker.revenueY1").replace(" Année 1", "")]: num(cr["Chiffre d'affaires"]?.[y]),
      [t("banker.netResultY1").replace(" Année 1", "")]: num(cr["Résultat net"]?.[y]),
      "Total charges": num(cr["Total charges"]?.[y]),
    }));
  }, [cr, t]);

  const cashData = useMemo(() => {
    if (!treso) return [];
    const months = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"];
    return months.map(m => ({
      name: m,
      cumul: num(treso["Solde cumulé"]?.[m]),
      enc: num(treso["Total encaissements"]?.[m]),
      dec: num(treso["Total décaissements"]?.[m]),
    }));
  }, [treso]);

  const hasRevenue = revenueData.some(d => Object.values(d).some(v => typeof v === "number" && v !== 0));
  const hasCash = cashData.some(d => d.cumul !== 0 || d.enc !== 0);

  if (!hasRevenue && !hasCash) return null;

  const fmt = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`;
  const fmtTooltip = (v: number) => `${v.toLocaleString("fr-FR")} ${currencySymbol}`;

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {hasRevenue && (
        <div className="p-4 bg-card border border-border rounded-xl">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            📈 {t("banker.revenueEvolution")}
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={fmt} />
              <Tooltip formatter={(v: number, name: string) => [fmtTooltip(v), name]} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Bar dataKey={Object.keys(revenueData[0] || {})[1] || "CA"} fill={COLORS.revenue} radius={[4, 4, 0, 0]} />
              <Bar dataKey={Object.keys(revenueData[0] || {})[2] || "RN"} fill={COLORS.netResult} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasCash && (
        <div className="p-4 bg-card border border-border rounded-xl">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            💰 {t("banker.cashEvolution")}
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={cashData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={fmt} />
              <Tooltip formatter={(v: number, name: string) => [fmtTooltip(v), name]} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Line type="monotone" dataKey="cumul" name={t("banker.cumulBalance")} stroke={COLORS.cash} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="enc" name={t("banker.receipts")} stroke={COLORS.revenue} strokeWidth={1.5} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="dec" name={t("banker.disbursements")} stroke={COLORS.expenses} strokeWidth={1.5} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default BankerCharts;
