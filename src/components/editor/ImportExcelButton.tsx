import { useRef } from "react";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { BP_SECTIONS } from "@/components/editor/sectionConfig";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";

interface Props {
  onImport: (sectionId: string, data: Record<string, Record<string, string>>) => void;
}

const ImportExcelButton = ({ onImport }: Props) => {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      let importedCount = 0;

      const financialSections = BP_SECTIONS.filter(s => s.type === "financial");

      wb.SheetNames.forEach(sheetName => {
        const ws = wb.Sheets[sheetName];
        const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (raw.length < 2) return;

        // Try to match sheet to a section by name or rows
        const headerRow = raw[0];
        const matched = financialSections.find(sec => {
          const title = sec.titleKey.split(".").pop() || "";
          const sheetLower = sheetName.toLowerCase();
          if (sheetLower.includes(sec.id)) return true;
          if (sheetLower.includes(title)) return true;
          // Check if rows match
          const secRows = sec.rows || [];
          const dataRows = raw.slice(1).map(r => r[0]).filter(Boolean);
          const overlap = secRows.filter(r => !r.startsWith("---") && dataRows.includes(r));
          return overlap.length >= 3;
        });

        if (!matched) return;

        const columns = matched.columns || [];
        const data: Record<string, Record<string, string>> = {};

        // Map columns from header
        const colMap: Record<number, string> = {};
        headerRow.forEach((h, i) => {
          if (i === 0) return;
          const col = columns.find(c => {
            const hl = String(h).toLowerCase().trim();
            const cl = c.toLowerCase().trim();
            return hl === cl || hl.includes(cl) || cl.includes(hl);
          });
          if (col) colMap[i] = col;
          else if (i - 1 < columns.length) colMap[i] = columns[i - 1];
        });

        raw.slice(1).forEach(row => {
          const rowName = String(row[0] || "").trim();
          if (!rowName || rowName.startsWith("---")) return;
          const secRows = matched.rows || [];
          const matchedRow = secRows.find(r => r === rowName || r.toLowerCase() === rowName.toLowerCase());
          if (!matchedRow) return;

          data[matchedRow] = {};
          Object.entries(colMap).forEach(([idx, col]) => {
            const val = row[Number(idx)];
            if (val !== undefined && val !== null && val !== "") {
              data[matchedRow][col] = String(Math.round(Number(val) || 0));
            }
          });
        });

        if (Object.keys(data).length > 0) {
          onImport(matched.id, data);
          importedCount++;
        }
      });

      if (importedCount > 0) {
        toast.success(t("import.success", { count: String(importedCount) }));
      } else {
        toast.error(t("import.noMatch"));
      }
    } catch {
      toast.error(t("import.error"));
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
        aria-label={t("import.button")}
      >
        <Upload className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("import.button")}</span>
      </button>
    </>
  );
};

export default ImportExcelButton;
