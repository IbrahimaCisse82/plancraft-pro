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
    } else if ((section.type === "financial" || section.type === "matrix") && typeof val === "object") {
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
          let cellVal = val[row]?.[col] || "";
          if (section.id === "matrice_risques" && col === "Criticité") {
            const p = parseInt(val[row]?.["Probabilité (1-5)"] || "", 10);
            const im = parseInt(val[row]?.["Impact (1-5)"] || "", 10);
            if (!isNaN(p) && !isNaN(im)) cellVal = String(p * im);
          }
          const displayVal = section.type === "matrix"
            ? String(cellVal).substring(0, 40)
            : (cellVal && !isNaN(parseInt(cellVal))
              ? parseInt(cellVal).toLocaleString("fr-FR")
              : cellVal);
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
    } else if (section.type === "esg" && typeof val === "object") {
      doc.setFontSize(10);
      const pillars: Array<{ key: "environment" | "social" | "governance"; label: string }> = [
        { key: "environment", label: t ? t("esg.pillar.E") : "Environnement" },
        { key: "social", label: t ? t("esg.pillar.S") : "Social" },
        { key: "governance", label: t ? t("esg.pillar.G") : "Gouvernance" },
      ];
      const narrative = val.narrative || {};
      if (narrative.impact_thesis) {
        checkPageBreak(15);
        doc.setFont("helvetica", "bold");
        doc.text(t ? t("esg.impactThesis") : "Thèse d'impact", margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(narrative.impact_thesis, maxWidth);
        lines.forEach((line: string) => {
          checkPageBreak(6);
          doc.text(line, margin, y);
          y += 5.5;
        });
        y += 3;
      }
      pillars.forEach((p) => {
        const text = narrative[p.key];
        if (!text) return;
        checkPageBreak(15);
        doc.setFont("helvetica", "bold");
        doc.text(p.label, margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          checkPageBreak(6);
          doc.text(line, margin, y);
          y += 5.5;
        });
        y += 3;
      });
      const sdgs: string[] = val.sdgs || [];
      if (sdgs.length) {
        checkPageBreak(10);
        doc.setFont("helvetica", "bold");
        doc.text("ODD / SDGs :", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(sdgs.map((s) => `ODD ${s}`).join(" · "), margin + 30, y);
        y += 7;
      }
    }
  });

  // ── Banker Summary Page ──
  const ratios = calculateFinancialRatios(content);
  const num = (val: string | undefined): number => {
    if (!val) return 0;
    const n = parseInt(val.replace(/[^\d-]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  };
  const fmtN = (n: number) => n.toLocaleString("fr-FR");

  const investRows = [
    "Terrain / Local", "Aménagement / Travaux", "Équipements / Matériel",
    "Véhicules", "Mobilier de bureau", "Matériel informatique",
    "Frais d'établissement", "Stock initial", "Trésorerie de départ", "Divers / Imprévus",
  ];
  const totalInvest = investRows.reduce((s, r) => s + num(content["investissements"]?.[r]?.["Montant"]), 0);

  if (totalInvest > 0 || ratios) {
    addPage();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`🏦 ${label("section.synthese_banquier.title", "Fiche Synthèse Banquier")}`, margin, y);
    y += 10;
    doc.setDrawColor(200, 180, 120);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const cr = content["compte_resultat"];
    const pf = content["plan_financement"];
    const sr = content["seuil_rentabilite"];

    const ca1 = num(cr?.["Chiffre d'affaires"]?.["Année 1"]);
    const rn1 = num(cr?.["Résultat net"]?.["Année 1"]);
    const apport = num(pf?.["Apport personnel"]?.["Année 1"]);
    const apportRatio = totalInvest > 0 ? Math.round((apport / totalInvest) * 100) : 0;
    const seuilCA = num(sr?.["Seuil de rentabilité (CA)"]?.["Année 1"]);
    const annuite = num(content["amortissement_emprunts"]?.["Annuité totale"]?.["Année 1"]);
    const capaciteRemb = rn1 + num(cr?.["Amortissements"]?.["Année 1"]);
    const dscr = annuite > 0 ? capaciteRemb / annuite : 0;

    const summaryRows = [
      [label("banker.totalInvestment", "Investissement total"), `${fmtN(totalInvest)}`, totalInvest > 0 ? "✓" : "✗"],
      [label("banker.personalContribution", "Apport personnel"), `${fmtN(apport)} (${apportRatio}%)`, apportRatio >= 20 ? "✓" : "✗"],
      [label("banker.revenueY1", "CA Année 1"), fmtN(ca1), ca1 > 0 ? "✓" : "✗"],
      [label("banker.netResultY1", "Résultat net Année 1"), fmtN(rn1), rn1 > 0 ? "✓" : "✗"],
      [label("banker.breakEven", "Seuil de rentabilité"), fmtN(seuilCA), ca1 > seuilCA ? "✓" : "✗"],
      [label("banker.dscr", "DSCR"), dscr > 0 ? dscr.toFixed(2) : "—", dscr >= 1.2 ? "✓" : "✗"],
    ];

    if (ratios) {
      summaryRows.push(
        [label("banker.npv", "VAN"), `${fmtN(Math.round(ratios.van))}`, ratios.van > 0 ? "✓" : "✗"],
        [label("banker.irr", "TRI"), `${(ratios.tri * 100).toFixed(1)}%`, ratios.tri > 0.10 ? "✓" : "✗"],
      );
    }

    // Draw table
    const colWidths = [80, 50, 20];
    doc.setFont("helvetica", "bold");
    doc.setFillColor(245, 240, 224);
    doc.rect(margin, y - 3, maxWidth, 8, "F");
    doc.text(label("banker.indicator", "Indicateur"), margin + 2, y + 2);
    doc.text(label("banker.valueCol", "Valeur"), margin + colWidths[0] + 2, y + 2);
    doc.text(label("banker.verdictCol", "Verdict"), margin + colWidths[0] + colWidths[1] + 2, y + 2);
    y += 8;

    doc.setFont("helvetica", "normal");
    summaryRows.forEach(([indicator, value, verdict], i) => {
      checkPageBreak(7);
      if (i % 2 === 0) {
        doc.setFillColor(250, 248, 243);
        doc.rect(margin, y - 3, maxWidth, 7, "F");
      }
      doc.text(indicator, margin + 2, y + 1);
      doc.text(value, margin + colWidths[0] + 2, y + 1);
      const isOk = verdict === "✓";
      doc.setTextColor(isOk ? 34 : 220, isOk ? 139 : 38, isOk ? 34 : 38);
      doc.text(verdict, margin + colWidths[0] + colWidths[1] + 8, y + 1);
      doc.setTextColor(0, 0, 0);
      y += 7;
    });

    const passCount = summaryRows.filter(r => r[2] === "✓").length;
    const score = Math.round((passCount / summaryRows.length) * 100);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${label("banker.score", "Score de bankabilité")} : ${score}% (${passCount}/${summaryRows.length})`, margin, y);

    // ── Mini bar chart: Revenue evolution ──
    y += 15;
    const years = ["Année 1", "Année 2", "Année 3"];
    const caValues = years.map(yr => num(cr?.["Chiffre d'affaires"]?.[yr]));
    const rnValues = years.map(yr => num(cr?.["Résultat net"]?.[yr]));
    const maxVal = Math.max(...caValues, ...rnValues, 1);

    if (caValues.some(v => v > 0)) {
      checkPageBreak(60);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`📈 ${label("banker.revenueEvolution", "Évolution CA & Résultat")}`, margin, y);
      y += 6;

      const chartX = margin;
      const chartW = maxWidth * 0.6;
      const chartH = 40;
      const barW = chartW / (years.length * 3);

      for (let i = 0; i < years.length; i++) {
        const x = chartX + i * (chartW / years.length) + barW * 0.5;

        // CA bar (gold)
        const caH = (caValues[i] / maxVal) * chartH;
        doc.setFillColor(200, 170, 90);
        doc.rect(x, y + chartH - caH, barW, caH, "F");

        // RN bar (green/red)
        const rnH = Math.abs(rnValues[i] / maxVal) * chartH;
        if (rnValues[i] >= 0) {
          doc.setFillColor(34, 139, 34);
        } else {
          doc.setFillColor(220, 38, 38);
        }
        doc.rect(x + barW + 2, y + chartH - rnH, barW, rnH, "F");

        // Year label
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(`A${i + 1}`, x + barW * 0.5, y + chartH + 5);
      }

      // Legend
      const legendX = chartX + chartW + 10;
      doc.setFillColor(200, 170, 90);
      doc.rect(legendX, y, 6, 4, "F");
      doc.setFontSize(7);
      doc.text("CA", legendX + 8, y + 3);
      doc.setFillColor(34, 139, 34);
      doc.rect(legendX, y + 7, 6, 4, "F");
      doc.text("RN", legendX + 8, y + 10);

      y += chartH + 12;
    }
  }

  doc.save(`${plan.name.replace(/\s+/g, "_")}_BusinessPlan.pdf`);
};
