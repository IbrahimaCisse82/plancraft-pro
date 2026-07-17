import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import { BP_SECTIONS, resolveSection } from "@/components/editor/sectionConfig";
import { isComputedRow } from "@/lib/financialFormulas";
import type { BusinessPlan } from "@/types/businessPlan";

const isSeparator = (row: string) => row.startsWith("---");
const separatorLabel = (row: string) => row.replace(/^-+\s*/, "").replace(/\s*-+$/, "");

export const exportBusinessPlanDOCX = async (
  plan: BusinessPlan,
  content: Record<string, any>,
  t?: (key: string) => string
) => {
  const label = (key: string, fallback: string) => t ? t(key) : fallback;
  const children: Paragraph[] = [];

  // Title page
  children.push(new Paragraph({ spacing: { before: 3000 } }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: plan.name, bold: true, size: 56, font: "Calibri" })],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: plan.secteur || "Business Plan", size: 28, color: "888888", font: "Calibri" })],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: `${label("export.currency", "Devise")} : ${plan.devise}`, size: 20, color: "888888", font: "Calibri" })],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: `${label("export.generatedOn", "Généré le")} ${new Date().toLocaleDateString("fr-FR")}`, size: 20, color: "888888", font: "Calibri" })],
    })
  );

  // Sections
  const tables: (Paragraph | Table)[] = [...children];

  BP_SECTIONS.forEach((section) => {
    const val = content[section.id];
    if (!val) return;

    const resolved = t ? resolveSection(section, t) : { title: section.titleKey };

    // Section heading
    tables.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 100 },
        children: [new TextRun({ text: `${section.icon} ${resolved.title}`, bold: true, size: 32, font: "Calibri" })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "C8B478" } },
        pageBreakBefore: true,
      })
    );

    if (section.type === "narrative" && typeof val === "string" && val.trim()) {
      val.split("\n").forEach((para: string) => {
        tables.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: para, size: 22, font: "Calibri" })],
          })
        );
      });
    } else if ((section.type === "financial" || section.type === "matrix") && typeof val === "object") {
      const rows = section.rows || [];
      const columns = section.columns || [];

      const headerCells = [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: label("export.post", "Poste"), bold: true, size: 18, font: "Calibri" })] })],
          width: { size: 3000, type: WidthType.DXA },
          shading: { fill: "F5F0E0" },
        }),
        ...columns.map(
          (col) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: col, bold: true, size: 18, font: "Calibri" })] })],
              width: { size: Math.floor(6000 / columns.length), type: WidthType.DXA },
              shading: { fill: "F5F0E0" },
            })
        ),
      ];

      const dataRows = rows.map((row) => {
        if (isSeparator(row)) {
          return new TableRow({
            children: [
              new TableCell({
                columnSpan: columns.length + 1,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: separatorLabel(row).toUpperCase(), bold: true, size: 16, font: "Calibri", color: "4A4A4A" })],
                  }),
                ],
                shading: { fill: "EBEBEB" },
              }),
            ],
          });
        }

        const computed = isComputedRow(section.id, row);
        const fill = computed ? "F8F5EB" : undefined;

        return new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: row, bold: computed, size: 18, font: "Calibri" })],
                }),
              ],
              shading: fill ? { fill } : undefined,
            }),
            ...columns.map((col) => {
              let cellVal = val[row]?.[col] || "";
              if (section.id === "matrice_risques" && col === "Criticité") {
                const p = parseInt(val[row]?.["Probabilité (1-5)"] || "", 10);
                const im = parseInt(val[row]?.["Impact (1-5)"] || "", 10);
                if (!isNaN(p) && !isNaN(im)) cellVal = String(p * im);
              }
              const displayVal = section.type === "matrix"
                ? String(cellVal)
                : (cellVal && !isNaN(parseInt(cellVal))
                  ? parseInt(cellVal).toLocaleString("fr-FR")
                  : cellVal);
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: displayVal, bold: computed, size: 18, font: "Calibri" })],
                  }),
                ],
                shading: fill ? { fill } : undefined,
              });
            }),
          ],
        });
      });

      tables.push(
        new Table({
          rows: [new TableRow({ children: headerCells }), ...dataRows],
          width: { size: 9000, type: WidthType.DXA },
        })
      );
    } else if (section.type === "swot" && typeof val === "object") {
      const quadrants = [
        { key: "forces", label: t ? t("swot.strengths") : "Forces" },
        { key: "faiblesses", label: t ? t("swot.weaknesses") : "Faiblesses" },
        { key: "opportunites", label: t ? t("swot.opportunities") : "Opportunités" },
        { key: "menaces", label: t ? t("swot.threats") : "Menaces" },
      ];

      quadrants.forEach((q) => {
        const text = val[q.key];
        if (!text) return;
        tables.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: q.label, bold: true, size: 24, font: "Calibri" })],
          })
        );
        text.split("\n").forEach((line: string) => {
          tables.push(
            new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: line, size: 22, font: "Calibri" })],
            })
          );
        });
      });
    } else if (section.type === "esg" && typeof val === "object") {
      const narrative = val.narrative || {};
      const pillars: Array<{ key: "impact_thesis" | "environment" | "social" | "governance"; labelKey: string; fallback: string }> = [
        { key: "impact_thesis", labelKey: "esg.impactThesis", fallback: "Thèse d'impact" },
        { key: "environment", labelKey: "esg.pillar.E", fallback: "Environnement" },
        { key: "social", labelKey: "esg.pillar.S", fallback: "Social" },
        { key: "governance", labelKey: "esg.pillar.G", fallback: "Gouvernance" },
      ];
      pillars.forEach((p) => {
        const text = narrative[p.key];
        if (!text) return;
        tables.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: t ? t(p.labelKey) : p.fallback, bold: true, size: 24, font: "Calibri" })],
          })
        );
        text.split("\n").forEach((line: string) => {
          tables.push(
            new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: line, size: 22, font: "Calibri" })],
            })
          );
        });
      });
      const sdgs: string[] = val.sdgs || [];
      if (sdgs.length) {
        tables.push(
          new Paragraph({
            spacing: { before: 120, after: 80 },
            children: [
              new TextRun({ text: "ODD / SDGs : ", bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: sdgs.map((s) => `ODD ${s}`).join(" · "), size: 22, font: "Calibri" }),
            ],
          })
        );
      }
    }
  });

  const doc = new Document({
    sections: [{ children: tables as any[] }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${plan.name.replace(/\s+/g, "_")}_BusinessPlan.docx`);
};
