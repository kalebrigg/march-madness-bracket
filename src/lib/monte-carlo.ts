/**
 * Monte Carlo game simulation for NCAA basketball matchups.
 *
 * Samples game outcomes from two independent normal distributions:
 *   - Margin  ~ N(projSpread, MARGIN_STD)  — tuned to CBB historical σ ≈ 11 pts
 *   - Total   ~ N(projTotal,  TOTAL_STD)   — tuned to CBB historical σ ≈ 18 pts
 *
 * Margin and total are sampled independently because the pace component
 * that drives total variance is largely orthogonal to which team wins.
 *
 * Output metrics that are NOT derivable from the deterministic model:
 *   - coverPctA:   probability team1 covers the book spread (ATS)
 *   - overPct:     probability the game total exceeds the O/U line
 *   - marginBins:  30-bin histogram of margin outcomes for distribution chart
 *
 * Histogram bins: 30 buckets of 4 pts each, covering margins from -60 to +60.
 *   bin k = margins in [-60 + 4k,  -60 + 4(k+1))
 *   Zero line sits between bin 14 and bin 15 (exactly at 50% of chart width).
 *   Spread line position = (-bookSpread + 60) / 120.
 */

/** Box-Muller transform — returns a single standard-normal sample */
function sampleStdNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Historical college basketball standard deviations
const MARGIN_STD = 11; // matches the winProbA formula in kenpom-model.ts
const TOTAL_STD  = 18; // empirical total variance in NCAA tournament games

// Histogram constants
export const HIST_BINS      = 30;   // number of buckets
export const HIST_BIN_WIDTH =  4;   // pts per bucket
export const HIST_MIN       = -60;  // left edge of bin 0
export const HIST_MAX       =  60;  // right edge of bin 29

export interface MonteCarloResult {
  n: number;

  // Win probability (will be close to the KenPom/blended model value)
  winPctA: number;
  winPctB: number;

  // ATS cover probability — null if no book spread was provided
  coverPctA: number | null;
  coverPctB: number | null;
  bookSpreadUsed: number | null; // the spread line that was used

  // Over/Under probability — null if no O/U line was provided
  overPct: number | null;
  underPct: number | null;
  ouLineUsed: number | null; // the O/U line that was used

  // Distribution stats (for labelling confidence)
  avgMargin: number;
  avgTotal: number;
  marginStdDev: number;
  totalStdDev: number;

  // Margin histogram — 30 bins, bin k = [-60+4k, -60+4(k+1)), raw counts
  marginBins: number[];
}

/**
 * @param projSpread  KenPom projected margin for teamA (positive = teamA favored)
 * @param projTotal   KenPom projected combined score
 * @param bookSpread  Book spread for teamA e.g. -8.5 means teamA -8.5 (favored by 8.5)
 * @param ouLine      Over/Under line, e.g. 147.5
 * @param n           Number of simulations (default 10 000)
 */
export function runMonteCarlo(
  projSpread: number,
  projTotal: number,
  bookSpread: number | null,
  ouLine: number | null,
  n = 10_000
): MonteCarloResult {
  let wins = 0;
  let covers = 0;
  let overs = 0;

  // Welford online mean + variance
  let marginMean = 0, marginM2 = 0;
  let totalMean  = 0, totalM2  = 0;

  // Margin histogram — 30 bins × 4 pts, -60 to +60
  const marginBins = new Array<number>(HIST_BINS).fill(0);

  for (let i = 0; i < n; i++) {
    const margin = projSpread + sampleStdNormal() * MARGIN_STD;
    const total  = projTotal  + sampleStdNormal() * TOTAL_STD;

    if (margin > 0) wins++;

    // teamA covers if their winning margin beats the spread
    // bookSpread is teamA's line: -8.5 means teamA must win by >8.5
    if (bookSpread !== null && margin > -bookSpread) covers++;

    if (ouLine !== null && total > ouLine) overs++;

    // Welford running stats
    const i1 = i + 1;
    const md = margin - marginMean;
    marginMean += md / i1;
    marginM2   += md * (margin - marginMean);

    const td = total - totalMean;
    totalMean += td / i1;
    totalM2   += td * (total - totalMean);

    // Bin the margin: clamp to [HIST_MIN, HIST_MAX)
    const binIdx = Math.min(
      HIST_BINS - 1,
      Math.max(0, Math.floor((margin - HIST_MIN) / HIST_BIN_WIDTH))
    );
    marginBins[binIdx]++;
  }

  return {
    n,
    winPctA: wins / n,
    winPctB: (n - wins) / n,
    coverPctA: bookSpread !== null ? covers / n : null,
    coverPctB: bookSpread !== null ? (n - covers) / n : null,
    bookSpreadUsed: bookSpread,
    overPct:  ouLine !== null ? overs / n : null,
    underPct: ouLine !== null ? (n - overs) / n : null,
    ouLineUsed: ouLine,
    avgMargin: marginMean,
    avgTotal:  totalMean,
    marginStdDev: Math.sqrt(marginM2 / n),
    totalStdDev:  Math.sqrt(totalM2  / n),
    marginBins,
  };
}
