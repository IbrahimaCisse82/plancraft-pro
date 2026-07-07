/**
 * Loan amortization schedule — French method (fixed annuity).
 * annuité = K × i / (1 − (1+i)^-n)
 */

export interface LoanParams {
  capital: number;
  tauxAnnuel: number; // % (e.g. 8.5)
  dureeAnnees: number;
  differeAnnees?: number; // grace period on capital (interest still paid)
}

export interface YearRow {
  annee: number;
  annuite: number;
  interets: number;
  capital: number;
  crd: number; // capital restant dû fin d'année
}

export interface MonthRow {
  mois: number;
  annuite: number;
  interets: number;
  capital: number;
  crd: number;
}

export interface Schedule {
  annual: YearRow[];
  monthly: MonthRow[];
  annuiteConstante: number;
  totalInterets: number;
  totalRembourse: number;
}

export const generateLoanSchedule = (p: LoanParams): Schedule | null => {
  const K = p.capital;
  const i = p.tauxAnnuel / 100;
  const n = p.dureeAnnees;
  const diff = Math.max(0, p.differeAnnees || 0);

  if (K <= 0 || i < 0 || n <= 0) return null;

  const nAmort = Math.max(1, n - diff);
  const annuiteConstante =
    i === 0 ? K / nAmort : (K * i) / (1 - Math.pow(1 + i, -nAmort));

  const annual: YearRow[] = [];
  let crd = K;

  for (let y = 1; y <= n; y++) {
    if (y <= diff) {
      // grace period: only interest, no capital
      const interets = crd * i;
      annual.push({ annee: y, annuite: interets, interets, capital: 0, crd });
    } else {
      const interets = crd * i;
      const capital = Math.min(annuiteConstante - interets, crd);
      crd = Math.max(0, crd - capital);
      annual.push({ annee: y, annuite: interets + capital, interets, capital, crd });
    }
  }

  // Monthly schedule
  const iMens = Math.pow(1 + i, 1 / 12) - 1;
  const nMoisAmort = nAmort * 12;
  const mensualiteConstante =
    iMens === 0 ? K / nMoisAmort : (K * iMens) / (1 - Math.pow(1 + iMens, -nMoisAmort));

  const monthly: MonthRow[] = [];
  let crdM = K;
  const totalMois = n * 12;
  const diffMois = diff * 12;
  for (let m = 1; m <= totalMois; m++) {
    if (m <= diffMois) {
      const interets = crdM * iMens;
      monthly.push({ mois: m, annuite: interets, interets, capital: 0, crd: crdM });
    } else {
      const interets = crdM * iMens;
      const capital = Math.min(mensualiteConstante - interets, crdM);
      crdM = Math.max(0, crdM - capital);
      monthly.push({ mois: m, annuite: interets + capital, interets, capital, crd: crdM });
    }
  }

  const totalInterets = annual.reduce((s, r) => s + r.interets, 0);
  const totalRembourse = annual.reduce((s, r) => s + r.annuite, 0);

  return { annual, monthly, annuiteConstante, totalInterets, totalRembourse };
};

export const scheduleToCsv = (s: Schedule, devise: string): string => {
  const lines = [
    `Mois;Annuité (${devise});Intérêts (${devise});Capital (${devise});CRD (${devise})`,
    ...s.monthly.map(
      (r) =>
        `${r.mois};${Math.round(r.annuite)};${Math.round(r.interets)};${Math.round(r.capital)};${Math.round(r.crd)}`
    ),
  ];
  return lines.join("\n");
};
