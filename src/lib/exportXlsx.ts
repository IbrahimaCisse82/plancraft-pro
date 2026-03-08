import { BP_SECTIONS } from "@/components/editor/sectionConfig";
import { isComputedRow } from "@/lib/financialFormulas";
import type { BusinessPlan } from "@/types/businessPlan";

/**
 * Export financial tables as a CSV file (Excel-compatible).
 * Uses CSV with UTF-8 BOM for proper French character support in Excel.
 */
export const exportBusinessPlanXLSX = (plan: BusinessPlan, content: Record<string, any>) => {
  const financialSections = BP_SECTIONS.filter(s => s.type === "financial");
  const lines: string[] = [];

  const escapeCsv = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const formatNum = (val: string) => {
    if (!val) return "";
    const n = parseInt(val, 10);
    return isNaN(n) ? val : n.toLocaleString("fr-FR");
  };

  const isSeparator = (row: string) => row.startsWith("---");
  const separatorLabel = (row: string) => row.replace(/^-+\s*/, "").replace(/\s*-+$/, "");

  // Header
  lines.push(`${escapeCsv(plan.name)} - Business Plan`);
  lines.push(`Devise: ${plan.devise}`);
  lines.push(`Secteur: ${plan.secteur || "—"}`);
  lines.push(`Généré le ${new Date().toLocaleDateString("fr-FR")}`);
  lines.push("");

  financialSections.forEach((section) => {
    const val = content[section.id];
    if (!val || typeof val !== "object") return;

    const rows = section.rows || [];
    const columns = section.columns || [];

    // Section title
    lines.push("");
    lines.push(escapeCsv(`${section.icon} ${section.title}`));

    // Header row
    lines.push(["Poste", ...columns].map(escapeCsv).join(","));

    // Data rows
    rows.forEach((row) => {
      if (isSeparator(row)) {
        lines.push(escapeCsv(separatorLabel(row).toUpperCase()));
        return;
      }

      const computed = isComputedRow(section.id, row);
      const rowLabel = computed ? `${row} (auto)` : row;
      const cells = columns.map((col) => formatNum(val[row]?.[col] || ""));
      lines.push([escapeCsv(rowLabel), ...cells.map(escapeCsv)].join(","));
    });

    lines.push("");
  });

  // UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  const csvContent = BOM + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${plan.name.replace(/\s+/g, "_")}_Financier.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
