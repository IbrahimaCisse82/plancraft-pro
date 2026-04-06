import * as XLSX from "xlsx";
import { BP_SECTIONS, resolveSection } from "@/components/editor/sectionConfig";
import { isComputedRow } from "@/lib/financialFormulas";
import type { BusinessPlan } from "@/types/businessPlan";

/**
 * Export financial tables as a real XLSX file.
 */
export const exportBusinessPlanXLSX = (
  plan: BusinessPlan,
  content: Record<string, any>,
  t?: (key: string) => string
) => {
  const label = (key: string, fallback: string) => t ? t(key) : fallback;
  const financialSections = BP_SECTIONS.filter(s => s.type === "financial");
  const wb = XLSX.utils.book_new();

  const isSeparator = (row: string) => row.startsWith("---");
  const separatorLabel = (row: string) => row.replace(/^-+\s*/, "").replace(/\s*-+$/, "");

  const formatNum = (val: string) => {
    if (!val) return "";
    const n = parseInt(val, 10);
    return isNaN(n) ? val : n;
  };

  // Summary sheet
  const summaryData = [
    [plan.name, "Business Plan"],
    [`${label("export.currency", "Devise")}`, plan.devise],
    [`${label("export.sector", "Secteur")}`, plan.secteur || "—"],
    [`${label("export.generatedOn", "Généré le")}`, new Date().toLocaleDateString("fr-FR")],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, "Résumé");

  financialSections.forEach((section) => {
    const val = content[section.id];
    if (!val || typeof val !== "object") return;

    const resolved = t ? resolveSection(section, t) : { title: section.titleKey };
    const rows = section.rows || [];
    const columns = section.columns || [];

    const data: any[][] = [];

    // Header row
    data.push([label("export.post", "Poste"), ...columns]);

    // Data rows
    rows.forEach((row) => {
      if (isSeparator(row)) {
        data.push([separatorLabel(row).toUpperCase(), ...columns.map(() => "")]);
        return;
      }

      const computed = isComputedRow(section.id, row);
      const rowLabel = computed ? `${row} ★` : row;
      const cells = columns.map((col) => formatNum(val[row]?.[col] || ""));
      data.push([rowLabel, ...cells]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
      { wch: 35 },
      ...columns.map(() => ({ wch: 15 })),
    ];

    // Truncate sheet name to 31 chars (Excel limit)
    const sheetName = (resolved.title || section.id).substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, `${plan.name.replace(/\s+/g, "_")}_Financier.xlsx`);
};
