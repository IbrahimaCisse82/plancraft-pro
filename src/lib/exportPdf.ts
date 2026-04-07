import jsPDF from "jspdf";
import { BP_SECTIONS, resolveSection } from "@/components/editor/sectionConfig";
import { isComputedRow, calculateFinancialRatios } from "@/lib/financialFormulas";
import type { BusinessPlan } from "@/types/businessPlan";

export const exportBusinessPlanPDF = (
  plan: BusinessPlan,
  content: Record<string, any>,
  t?: (key: string) => string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const label = (key: string, fallback: string) => t ? t(key) : fallback;

  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      addPage();
    }
  };

  const isSeparator = (row: string) => row.startsWith("---");
  const separatorLabel = (row: string) => row.replace(/^-+\s*/, "").replace(/\s*-+$/, "");

  // Title page
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  y = 80;
  doc.text(plan.name, pageWidth / 2, y, { align: "center" });

  y += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(plan.secteur || "Business Plan", pageWidth / 2, y, { align: "center" });

  y += 10;
  doc.setFontSize(10);
  doc.text(`${label("export.currency", "Devise")} : ${plan.devise}`, pageWidth / 2, y, { align: "center" });

  y += 8;
  const dateStr = new Date().toLocaleDateString("fr-FR");
  doc.text(`${label("export.generatedOn", "Généré le")} ${dateStr}`, pageWidth / 2, y, { align: "center" });

  doc.setTextColor(0, 0, 0);

  // Sections
  BP_SECTIONS.forEach((section) => {
    const val = content[section.id];
    if (!val) return;

    const resolved = t ? resolveSection(section, t) : { title: section.titleKey };

    addPage();

    // Section title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${section.icon} ${resolved.title}`, margin, y);
    y += 10;

    doc.setDrawColor(200, 180, 120);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    if (section.type === "narrative" && typeof val === "string" && val.trim()) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(val, maxWidth);
      lines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, margin, y);
        y += 5.5;
      });
    } else if (section.type === "financial" && typeof val === "object") {
      const rows = section.rows || [];
      const columns = section.columns || [];

      doc.setFontSize(8);

      // Header row
      const colWidth = (maxWidth - 60) / columns.length;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(245, 240, 224);
      doc.rect(margin, y - 3, maxWidth, 8, "F");
      doc.text(label("export.post", "Poste"), margin + 1, y + 2);
      columns.forEach((col, i) => {
        doc.text(col, margin + 62 + i * colWidth, y + 2);
      });
      y += 8;
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      rows.forEach((row) => {
        checkPageBreak(8);

        if (isSeparator(row)) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setFillColor(235, 235, 235);
          doc.rect(margin, y - 3, maxWidth, 7, "F");
          doc.text(separatorLabel(row).toUpperCase(), margin + 1, y + 1);
          y += 7;
          doc.setFont("helvetica", "normal");
          return;
        }

        const computed = isComputedRow(section.id, row);

        if (computed) {
          doc.setFont("helvetica", "bold");
          doc.setFillColor(248, 245, 235);
          doc.rect(margin, y - 3, maxWidth, 7, "F");
        } else {
          doc.setFont("helvetica", "normal");
        }

        doc.text(row.substring(0, 35), margin + 1, y + 1);
        columns.forEach((col, i) => {
          const cellVal = val[row]?.[col] || "";
          const displayVal = cellVal && !isNaN(parseInt(cellVal))
            ? parseInt(cellVal).toLocaleString("fr-FR")
            : cellVal;
          doc.text(displayVal, margin + 62 + i * colWidth, y + 1);
        });
        y += computed ? 7 : 5;

        if (computed) {
          doc.setFont("helvetica", "normal");
        }
      });
    } else if (section.type === "swot" && typeof val === "object") {
      doc.setFontSize(10);
      const quadrants = [
        { key: "forces", label: t ? t("swot.strengths") : "Forces" },
        { key: "faiblesses", label: t ? t("swot.weaknesses") : "Faiblesses" },
        { key: "opportunites", label: t ? t("swot.opportunities") : "Opportunités" },
        { key: "menaces", label: t ? t("swot.threats") : "Menaces" },
      ];

      quadrants.forEach((q) => {
        const text = val[q.key];
        if (!text) return;
        checkPageBreak(15);
        doc.setFont("helvetica", "bold");
        doc.text(q.label, margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          checkPageBreak(6);
          doc.text(line, margin, y);
          y += 5.5;
        });
        y += 4;
      });
    }
  });

  doc.save(`${plan.name.replace(/\s+/g, "_")}_BusinessPlan.pdf`);
};
