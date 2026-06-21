import jsPDF from "jspdf";
import { calculateFinancialRatios } from "@/lib/financialFormulas";
import type { BusinessPlan } from "@/types/businessPlan";

const num = (val: string | undefined): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};
const fmtN = (n: number) => n.toLocaleString("fr-FR");

const truncate = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1) + "…" : s);

/**
 * One-pager exécutif: synthèse A4 d'une seule page pour pré-analyse bancaire.
 * Pensé pour être lu en < 60 secondes par un chargé d'affaires.
 */
export const exportOnePagerPDF = (
  plan: BusinessPlan,
  content: Record<string, any>,
  t?: (key: string) => string
) => {
  const label = (key: string, fallback: string) => (t ? t(key) : fallback);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;

  // Colors (premium gold-on-dark accents, neutral body for print)
  const gold: [number, number, number] = [200, 170, 90];
  const dark: [number, number, number] = [30, 30, 38];
  const muted: [number, number, number] = [110, 110, 120];
  const ok: [number, number, number] = [34, 139, 34];
  const bad: [number, number, number] = [200, 50, 50];

  // ── Header band ─────────────────────────────────────────────
  doc.setFillColor(...dark);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 28, pageW, 1.2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(truncate(plan.name, 50), margin, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 200, 150);
  doc.text(
    `${plan.secteur || "—"}  •  ${plan.devise}  •  ${label("export.onePager.title", "One-pager exécutif")}`,
    margin,
    21
  );

  doc.setTextColor(180, 180, 180);
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString("fr-FR"), pageW - margin, 14, { align: "right" });

  let y = 36;
  doc.setTextColor(...dark);

  // Helper for section title
  const sectionTitle = (txt: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...gold);
    doc.text(txt.toUpperCase(), margin, y);
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 1.5, pageW - margin, y + 1.5);
    y += 6;
    doc.setTextColor(...dark);
  };

  // Helper for narrative text block
  const narrativeBlock = (txt: string, maxLines: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    const lines = doc.splitTextToSize(txt.trim(), pageW - margin * 2).slice(0, maxLines);
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 4;
    });
    y += 2;
  };

  // ── Résumé exécutif ────────────────────────────────────────
  const resume = (content["resume"] as string) || (content["presentation"] as string) || "";
  if (resume.trim()) {
    sectionTitle(label("section.resume.title", "Résumé exécutif"));
    narrativeBlock(resume, 6);
  }

  // ── Indicateurs clés (grid 2x4) ────────────────────────────
  const cr = content["compte_resultat"];
  const pf = content["plan_financement"];
  const sr = content["seuil_rentabilite"];
  const invest = content["investissements"];

  const investRows = [
    "Terrain / Local", "Aménagement / Travaux", "Équipements / Matériel",
    "Véhicules", "Mobilier de bureau", "Matériel informatique",
    "Frais d'établissement", "Stock initial", "Trésorerie de départ", "Divers / Imprévus",
  ];
  const totalInvest = investRows.reduce((s, r) => s + num(invest?.[r]?.["Montant"]), 0);
  const apport = num(pf?.["Apport personnel"]?.["Année 1"]);
  const emprunt = num(pf?.["Emprunt bancaire"]?.["Année 1"]);
  const apportRatio = totalInvest > 0 ? Math.round((apport / totalInvest) * 100) : 0;
  const ca1 = num(cr?.["Chiffre d'affaires"]?.["Année 1"]);
  const ca3 = num(cr?.["Chiffre d'affaires"]?.["Année 3"]);
  const rn1 = num(cr?.["Résultat net"]?.["Année 1"]);
  const rn3 = num(cr?.["Résultat net"]?.["Année 3"]);
  const seuilCA = num(sr?.["Seuil de rentabilité (CA)"]?.["Année 1"]);
  const annuite = num(content["amortissement_emprunts"]?.["Annuité totale"]?.["Année 1"]);
  const capa = rn1 + num(cr?.["Amortissements"]?.["Année 1"]);
  const dscr = annuite > 0 ? capa / annuite : 0;
  const ratios = calculateFinancialRatios(content);

  sectionTitle(label("export.onePager.keyFigures", "Chiffres clés"));

  const kpis: Array<{ label: string; value: string; status?: "ok" | "bad" | null }> = [
    { label: label("banker.totalInvestment", "Investissement"), value: `${fmtN(totalInvest)} ${plan.devise}`, status: totalInvest > 0 ? "ok" : "bad" },
    { label: label("banker.personalContribution", "Apport personnel"), value: `${fmtN(apport)} (${apportRatio}%)`, status: apportRatio >= 20 ? "ok" : "bad" },
    { label: label("export.onePager.loan", "Emprunt sollicité"), value: `${fmtN(emprunt)} ${plan.devise}`, status: null },
    { label: label("banker.revenueY1", "CA Année 1"), value: fmtN(ca1), status: ca1 > 0 ? "ok" : "bad" },
    { label: label("export.onePager.revenueY3", "CA Année 3"), value: fmtN(ca3), status: ca3 >= ca1 ? "ok" : "bad" },
    { label: label("banker.netResultY1", "Résultat net A1"), value: fmtN(rn1), status: rn1 >= 0 ? "ok" : "bad" },
    { label: label("export.onePager.netResultY3", "Résultat net A3"), value: fmtN(rn3), status: rn3 > 0 ? "ok" : "bad" },
    { label: label("banker.breakEven", "Seuil rentabilité"), value: fmtN(seuilCA), status: ca1 > seuilCA && seuilCA > 0 ? "ok" : "bad" },
    { label: label("banker.dscr", "DSCR"), value: dscr > 0 ? dscr.toFixed(2) : "—", status: dscr >= 1.2 ? "ok" : dscr > 0 ? "bad" : null },
    { label: label("banker.npv", "VAN"), value: ratios ? fmtN(Math.round(ratios.van)) : "—", status: ratios ? (ratios.van > 0 ? "ok" : "bad") : null },
    { label: label("banker.irr", "TRI"), value: ratios ? `${(ratios.tri * 100).toFixed(1)}%` : "—", status: ratios ? (ratios.tri > 0.1 ? "ok" : "bad") : null },
    { label: label("export.onePager.payback", "Cumul cash-flows A3"), value: ratios ? fmtN(Math.round(ratios.cashFlows.slice(1).reduce((a, b) => a + b, 0))) : "—", status: null },
  ];

  const cols = 4;
  const cellW = (pageW - margin * 2) / cols;
  const cellH = 14;
  kpis.forEach((kpi, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = margin + col * cellW;
    const yc = y + row * cellH;

    doc.setDrawColor(220, 215, 200);
    doc.setLineWidth(0.2);
    doc.rect(x + 0.5, yc, cellW - 1, cellH - 1);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(truncate(kpi.label, 24), x + 2, yc + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    if (kpi.status === "ok") doc.setTextColor(...ok);
    else if (kpi.status === "bad") doc.setTextColor(...bad);
    else doc.setTextColor(...dark);
    doc.text(truncate(kpi.value, 18), x + 2, yc + 10);
  });
  y += Math.ceil(kpis.length / cols) * cellH + 3;

  // ── Marché & stratégie (2 colonnes) ────────────────────────
  const marche = (content["marche"] as string) || "";
  const strat = (content["strategie_commerciale"] as string) || "";
  if (marche.trim() || strat.trim()) {
    sectionTitle(label("export.onePager.marketStrategy", "Marché & stratégie"));
    const colW = (pageW - margin * 2 - 4) / 2;
    const yStart = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(label("section.marche.title", "Marché"), margin, yStart);
    doc.text(label("section.strategie_commerciale.title", "Stratégie"), margin + colW + 4, yStart);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    const marcheLines = doc.splitTextToSize(marche.trim() || "—", colW).slice(0, 6);
    const stratLines = doc.splitTextToSize(strat.trim() || "—", colW).slice(0, 6);

    marcheLines.forEach((line: string, idx: number) => {
      doc.text(line, margin, yStart + 4 + idx * 3.6);
    });
    stratLines.forEach((line: string, idx: number) => {
      doc.text(line, margin + colW + 4, yStart + 4 + idx * 3.6);
    });
    y = yStart + 4 + Math.max(marcheLines.length, stratLines.length) * 3.6 + 2;
  }

  // ── Footer band: demande de financement ────────────────────
  const footerH = 22;
  const footerY = pageH - footerH;
  doc.setFillColor(...dark);
  doc.rect(0, footerY, pageW, footerH, "F");
  doc.setFillColor(...gold);
  doc.rect(0, footerY, pageW, 1.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text(label("export.onePager.fundingRequest", "DEMANDE DE FINANCEMENT").toUpperCase(), margin, footerY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const fundingLine = `${label("banker.totalInvestment", "Investissement")} : ${fmtN(totalInvest)} ${plan.devise}   |   ${label("banker.personalContribution", "Apport")} : ${fmtN(apport)} ${plan.devise} (${apportRatio}%)   |   ${label("export.onePager.loan", "Emprunt")} : ${fmtN(emprunt)} ${plan.devise}`;
  doc.text(fundingLine, margin, footerY + 14);

  doc.setTextColor(180, 180, 180);
  doc.setFontSize(7);
  doc.text(
    label("export.onePager.disclaimer", "Document synthétique — voir business plan complet pour le détail des hypothèses."),
    margin,
    footerY + 19
  );

  doc.save(`${plan.name.replace(/\s+/g, "_")}_OnePager.pdf`);
};
