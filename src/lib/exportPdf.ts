import jsPDF from "jspdf";
import { BP_SECTIONS } from "@/components/editor/sectionConfig";

export const exportBusinessPlanPDF = (plan: any, content: Record<string, any>) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      addPage();
    }
  };

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
  doc.text(`Devise : ${plan.devise}`, pageWidth / 2, y, { align: "center" });

  y += 8;
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, pageWidth / 2, y, { align: "center" });

  doc.setTextColor(0, 0, 0);

  // Sections
  BP_SECTIONS.forEach((section) => {
    const val = content[section.id];
    if (!val) return;

    addPage();

    // Section title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${section.icon} ${section.title}`, margin, y);
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
      doc.setFont("helvetica", "bold");

      // Header row
      const colWidth = (maxWidth - 60) / columns.length;
      doc.text("Poste", margin, y);
      columns.forEach((col, i) => {
        doc.text(col, margin + 62 + i * colWidth, y);
      });
      y += 3;
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      rows.forEach((row) => {
        checkPageBreak(6);
        doc.text(row.substring(0, 30), margin, y);
        columns.forEach((col, i) => {
          const cellVal = val[row]?.[col] || "";
          doc.text(cellVal, margin + 62 + i * colWidth, y);
        });
        y += 5;
      });
    } else if (section.type === "swot" && typeof val === "object") {
      doc.setFontSize(10);
      const quadrants = [
        { key: "forces", label: "Forces" },
        { key: "faiblesses", label: "Faiblesses" },
        { key: "opportunites", label: "Opportunités" },
        { key: "menaces", label: "Menaces" },
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
