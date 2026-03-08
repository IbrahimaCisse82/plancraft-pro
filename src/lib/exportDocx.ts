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
import { BP_SECTIONS } from "@/components/editor/sectionConfig";
import { isComputedRow } from "@/lib/financialFormulas";
import type { BusinessPlan } from "@/types/businessPlan";

const isSeparator = (row: string) => row.startsWith("---");
const separatorLabel = (row: string) => row.replace(/^-+\s*/, "").replace(/\s*-+$/, "");

export const exportBusinessPlanDOCX = async (plan: BusinessPlan, content: Record<string, any>) => {
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
      children: [new TextRun({ text: `Devise : ${plan.devise}`, size: 20, color: "888888", font: "Calibri" })],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: `Généré le ${new Date().toLocaleDateString("fr-FR")}`, size: 20, color: "888888", font: "Calibri" })],
    })
  );

  // Sections
  const tables: (Paragraph | Table)[] = [...children];

  BP_SECTIONS.forEach((section) => {
    const val = content[section.id];
    if (!val) return;

    // Section heading
    tables.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 100 },
        children: [new TextRun({ text: `${section.icon} ${section.title}`, bold: true, size: 32, font: "Calibri" })],
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
    } else if (section.type === "financial" && typeof val === "object") {
      const rows = section.rows || [];
      const columns = section.columns || [];

      // Header row
      const headerCells = [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Poste", bold: true, size: 18, font: "Calibri" })] })],
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
          // Separator row spans all columns
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
              const cellVal = val[row]?.[col] || "";
              const displayVal = cellVal && !isNaN(parseInt(cellVal))
                ? parseInt(cellVal).toLocaleString("fr-FR")
                : cellVal;
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
        { key: "forces", label: "Forces" },
        { key: "faiblesses", label: "Faiblesses" },
        { key: "opportunites", label: "Opportunités" },
        { key: "menaces", label: "Menaces" },
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
    }
  });

  const doc = new Document({
    sections: [{ children: tables as any[] }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${plan.name.replace(/\s+/g, "_")}_BusinessPlan.docx`);
};
