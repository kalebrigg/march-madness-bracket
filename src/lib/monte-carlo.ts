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
 *   - coverPctA: probability team1 covers the book spread (ATS)
 *   - overPct:   probability the game total exceeds the O/U line
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
  };
}
