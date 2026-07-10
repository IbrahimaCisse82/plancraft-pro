/** TAM/SAM/SOM market sizing calculations */

export interface MarketSizingInputs {
  /** Population totale du marché adressable (nombre de clients potentiels) */
  population: number;
  /** Panier moyen annuel par client (dans la devise du plan) */
  panierMoyen: number;
  /** % de la population correspondant au marché servi (SAM) */
  samPct: number;
  /** % du SAM capté à horizon 3 ans (SOM) */
  somPct: number;
  /** Croissance annuelle du marché (%) */
  croissance: number;
}

export interface MarketSizingResult {
  tam: number;
  sam: number;
  som: number;
  penetration: number; // som / tam
  captureSam: number; // som / sam
  projection: { year: number; tam: number; sam: number; som: number }[];
}

export const DEFAULT_INPUTS: MarketSizingInputs = {
  population: 0,
  panierMoyen: 0,
  samPct: 30,
  somPct: 5,
  croissance: 5,
};

export const computeMarketSizing = (i: MarketSizingInputs): MarketSizingResult => {
  const tam = Math.max(0, i.population) * Math.max(0, i.panierMoyen);
  const sam = tam * (Math.max(0, i.samPct) / 100);
  const som = sam * (Math.max(0, i.somPct) / 100);
  const g = i.croissance / 100;

  const projection = [1, 2, 3].map((year) => {
    const factor = Math.pow(1 + g, year - 1);
    return {
      year,
      tam: tam * factor,
      sam: sam * factor,
      som: som * factor * (1 + 0.15 * (year - 1)), // captation progressive
    };
  });

  return {
    tam,
    sam,
    som,
    penetration: tam > 0 ? som / tam : 0,
    captureSam: sam > 0 ? som / sam : 0,
    projection,
  };
};
