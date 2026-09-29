import { useRef, useState } from "react";
import { Upload, ArrowRight, Check, X, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { BP_SECTIONS, type SectionConfig } from "@/components/editor/sectionConfig";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  onImport: (sectionId: string, data: Record<string, Record<string, string>>) => void;
}

interface SheetParse {
  name: string;
  header: string[];
  rows: string[][];
  // Mapping decisions
  sectionId: string | "skip";
  colMap: Record<number, string>; // sheet col index -> section column name
  rowMap: Record<number, string>; // sheet row index -> section row name
}

const FIN_SECTIONS = BP_SECTIONS.filter(s => s.type === "financial");

const norm = (s: string) =>
  String(s || "").toLowerCase().trim().replace(/\s+/g, " ");

const autoDetectSection = (header: string[], rows: string[][]): string => {
  const dataRows = rows.map(r => norm(String(r[0] || ""))).filter(Boolean);
  let best: { id: string; score: number } = { id: "skip", score: 0 };
  FIN_SECTIONS.forEach(sec => {
    const secRows = (sec.rows || []).filter(r => !r.startsWith("---")).map(norm);
    const overlap = secRows.filter(r => dataRows.includes(r)).length;
    if (overlap > best.score) best = { id: sec.id, score: overlap };
  });
  return best.score >= 2 ? best.id : "skip";
};

const autoMapColumns = (
  header: string[],
  section: SectionConfig
): Record<number, string> => {
  const cols = section.columns || [];
  const map: Record<number, string> = {};
  header.forEach((h, i) => {
    if (i === 0) return;
    const hn = norm(String(h));
    const exact = cols.find(c => norm(c) === hn);
    if (exact) { map[i] = exact; return; }
    const partial = cols.find(c => norm(c).includes(hn) || hn.includes(norm(c)));
    if (partial) { map[i] = partial; return; }
    // positional fallback
    if (i - 1 < cols.length) map[i] = cols[i - 1];
  });
  return map;
};

const autoMapRows = (
  rows: string[][],
  section: SectionConfig
): Record<number, string> => {
  const secRows = (section.rows || []).filter(r => !r.startsWith("---"));
  const map: Record<number, string> = {};
  rows.forEach((r, idx) => {
    const label = norm(String(r[0] || ""));
    if (!label) return;
    const exact = secRows.find(sr => norm(sr) === label);
    if (exact) { map[idx] = exact; return; }
    const partial = secRows.find(sr => norm(sr).includes(label) || label.includes(norm(sr)));
    if (partial) map[idx] = partial;
  });
  return map;
};

const ImportExcelButton = ({ onImport }: Props) => {
  const { t, lang } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [sheets, setSheets] = useState<SheetParse[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error(lang === "fr" ? "Fichier trop volumineux (>10 Mo)" : "File too large (>10 MB)");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const parsed: SheetParse[] = wb.SheetNames.map(name => {
        const ws = wb.Sheets[name];
        const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        const header = (raw[0] || []).map((c: any) => String(c ?? ""));
        const rows = raw.slice(1).map(r => r.map((c: any) => String(c ?? "")));
        const sectionId = autoDetectSection(header, rows);
        const sec = FIN_SECTIONS.find(s => s.id === sectionId);
        return {
          name,
          header,
          rows,
          sectionId,
          colMap: sec ? autoMapColumns(header, sec) : {},
          rowMap: sec ? autoMapRows(rows, sec) : {},
        };
      }).filter(s => s.rows.length > 0);

      if (parsed.length === 0) {
        toast.error(t("import.noMatch"));
      } else {
        setSheets(parsed);
        setActiveIdx(0);
        setOpen(true);
      }
    } catch {
      toast.error(t("import.error"));
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const updateSheet = (patch: Partial<SheetParse>) => {
    setSheets(prev => prev.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s)));
  };

  const onSectionChange = (sectionId: string) => {
    const sheet = sheets[activeIdx];
    if (sectionId === "skip") {
      updateSheet({ sectionId: "skip", colMap: {}, rowMap: {} });
      return;
    }
    const sec = FIN_SECTIONS.find(s => s.id === sectionId)!;
    updateSheet({
      sectionId,
      colMap: autoMapColumns(sheet.header, sec),
      rowMap: autoMapRows(sheet.rows, sec),
    });
  };

  const confirmImport = () => {
    let imported = 0;
    sheets.forEach(sheet => {
      if (sheet.sectionId === "skip") return;
      const sec = FIN_SECTIONS.find(s => s.id === sheet.sectionId);
      if (!sec) return;
      const data: Record<string, Record<string, string>> = {};
      sheet.rows.forEach((row, rIdx) => {
        const targetRow = sheet.rowMap[rIdx];
        if (!targetRow) return;
        data[targetRow] = data[targetRow] || {};
        Object.entries(sheet.colMap).forEach(([cIdxStr, targetCol]) => {
          const cIdx = Number(cIdxStr);
          const raw = row[cIdx];
          if (raw === undefined || raw === null || raw === "") return;
          const n = Number(String(raw).replace(/[^\d.-]/g, ""));
          data[targetRow][targetCol] = isNaN(n) ? String(raw) : String(Math.round(n));
        });
      });
      if (Object.keys(data).length > 0) {
        onImport(sheet.sectionId, data);
        imported++;
      }
    });

    if (imported > 0) {
      toast.success(t("import.success", { count: String(imported) }));
      setOpen(false);
      setSheets([]);
    } else {
      toast.error(lang === "fr" ? "Aucune donnée mappée à importer." : "No mapped data to import.");
    }
  };

  const sheet = sheets[activeIdx];
  const section = sheet ? FIN_SECTIONS.find(s => s.id === sheet.sectionId) : undefined;
  const previewRows = sheet?.rows.slice(0, 8) || [];
  const mappedRowCount = sheet ? Object.keys(sheet.rowMap).length : 0;
  const mappedColCount = sheet ? Object.keys(sheet.colMap).length : 0;

  return (
    <>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-primary hover:text-primary transition-all"
        aria-label={t("import.button")}
      >
        <Upload className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">{t("import.button")}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {lang === "fr" ? "Aperçu et mapping de l'import Excel" : "Preview & map Excel import"}
            </DialogTitle>
            <DialogDescription>
              {lang === "fr"
                ? "Vérifiez la correspondance des feuilles, colonnes et lignes avant l'import."
                : "Check the mapping of sheets, columns and rows before importing."}
            </DialogDescription>
          </DialogHeader>

          {sheets.length > 0 && sheet && (
            <div className="flex flex-col gap-4 overflow-hidden">
              {/* Sheet tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 border-b border-border">
                {sheets.map((s, i) => (
                  <button
                    key={s.name + i}
                    onClick={() => setActiveIdx(i)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-t-md whitespace-nowrap transition-all ${
                      i === activeIdx
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.name}
                    {s.sectionId !== "skip" && <Check className="inline w-3 h-3 ml-1" />}
                  </button>
                ))}
              </div>

              {/* Section picker */}
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-xs font-semibold text-muted-foreground">
                  {lang === "fr" ? "Cible :" : "Target:"}
                </label>
                <Select value={sheet.sectionId} onValueChange={onSectionChange}>
                  <SelectTrigger className="w-[280px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">
                      {lang === "fr" ? "— Ignorer cette feuille —" : "— Skip this sheet —"}
                    </SelectItem>
                    {FIN_SECTIONS.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.icon} {t(s.titleKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {section && (
                  <span className="text-[0.65rem] text-muted-foreground ml-auto">
                    {mappedColCount} {lang === "fr" ? "col." : "col."} · {mappedRowCount} {lang === "fr" ? "lignes mappées" : "rows mapped"}
                  </span>
                )}
              </div>

              {/* Mapping & preview */}
              {section ? (
                <div className="overflow-auto border border-border rounded-md">
                  <table className="w-full text-xs">
                    <thead className="bg-secondary sticky top-0">
                      <tr>
                        <th className="text-left px-2 py-2 font-semibold border-r border-border min-w-[200px]">
                          {lang === "fr" ? "Ligne Excel" : "Excel row"}
                          <ArrowRight className="inline w-3 h-3 mx-1" />
                          {lang === "fr" ? "Ligne cible" : "Target row"}
                        </th>
                        {sheet.header.map((h, i) => i === 0 ? null : (
                          <th key={i} className="text-left px-2 py-2 font-semibold border-r border-border min-w-[140px]">
                            <div className="text-muted-foreground truncate">{h || `Col ${i + 1}`}</div>
                            <Select
                              value={sheet.colMap[i] || "__none__"}
                              onValueChange={(v) => {
                                const next = { ...sheet.colMap };
                                if (v === "__none__") delete next[i];
                                else next[i] = v;
                                updateSheet({ colMap: next });
                              }}
                            >
                              <SelectTrigger className="h-7 text-[0.65rem] mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  {lang === "fr" ? "— Ignorer —" : "— Skip —"}
                                </SelectItem>
                                {(section.columns || []).map(c => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, rIdx) => {
                        const label = String(row[0] || "");
                        const mapped = sheet.rowMap[rIdx];
                        return (
                          <tr key={rIdx} className="border-t border-border">
                            <td className="px-2 py-1.5 border-r border-border">
                              <div className="font-medium truncate max-w-[200px]" title={label}>
                                {label || <span className="text-muted-foreground italic">(vide)</span>}
                              </div>
                              <Select
                                value={mapped || "__none__"}
                                onValueChange={(v) => {
                                  const next = { ...sheet.rowMap };
                                  if (v === "__none__") delete next[rIdx];
                                  else next[rIdx] = v;
                                  updateSheet({ rowMap: next });
                                }}
                              >
                                <SelectTrigger className="h-7 text-[0.65rem] mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">
                                    {lang === "fr" ? "— Ignorer —" : "— Skip —"}
                                  </SelectItem>
                                  {(section.rows || [])
                                    .filter(r => !r.startsWith("---"))
                                    .map(r => (
                                      <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </td>
                            {row.map((cell, cIdx) => cIdx === 0 ? null : (
                              <td key={cIdx} className={`px-2 py-1.5 border-r border-border tabular-nums ${
                                mapped && sheet.colMap[cIdx] ? "bg-primary/5" : "text-muted-foreground"
                              }`}>
                                {cell || "—"}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      {sheet.rows.length > previewRows.length && (
                        <tr>
                          <td colSpan={sheet.header.length} className="px-2 py-1.5 text-center text-[0.65rem] text-muted-foreground bg-secondary/50">
                            … {sheet.rows.length - previewRows.length} {lang === "fr" ? "lignes supplémentaires" : "more rows"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 rounded-md border border-dashed border-border text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  {lang === "fr"
                    ? "Cette feuille sera ignorée. Choisissez une section cible ci-dessus pour la mapper."
                    : "This sheet will be skipped. Pick a target section above to map it."}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-semibold text-secondary-foreground hover:border-border"
            >
              <X className="w-3.5 h-3.5" />
              {lang === "fr" ? "Annuler" : "Cancel"}
            </button>
            <button
              onClick={confirmImport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary rounded-md text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              <Check className="w-3.5 h-3.5" />
              {lang === "fr" ? "Importer la sélection" : "Import selection"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportExcelButton;
