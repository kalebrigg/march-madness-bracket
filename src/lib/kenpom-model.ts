/**
 * KenPom-based game projection model.
 *
 * Constants:
 *   AVG_ORTG = 119  — average adjusted offensive rating for NCAA tournament teams
 *   AVG_DRTG = 102  — average adjusted defensive rating for NCAA tournament teams
 *   TOURNEY_FACTOR = 0.97 — tournament regression (tighter defense, elimination pressure)
 *
 * Formulas:
 *   Poss    = 0.60 × MIN(Tempo_A, Tempo_B) + 0.40 × MAX(Tempo_A, Tempo_B)
 *   Eff_A   = (119 × ((ORtg_A / 119) − (1 − (DRtg_B / 102)))) × 0.97
 *   Eff_B   = (119 × ((ORtg_B / 119) − (1 − (DRtg_A / 102)))) × 0.97
 *   Pts_A   = (Eff_A / 100) × Poss
 *   Pts_B   = (Eff_B / 100) × Poss
 *   Spread  = Pts_A − Pts_B   (signed: positive = A favored)
 *   Total   = Pts_A + Pts_B
 *   Win%_A  = normCDF(Spread / 11)   — std dev ≈ 11 pts in college basketball
 */

const AVG_ORTG = 119;  // Tournament-average adjusted offensive rating
const AVG_DRTG = 102;  // Tournament-average adjusted defensive rating
const TOURNEY_FACTOR = 0.97; // 3% tournament regression factor

export interface KenPomProjection {
  poss: number;      // Expected possessions
  ptsA: number;      // Projected points for team A (team1)
  ptsB: number;      // Projected points for team B (team2)
  spread: number;    // Pts_A − Pts_B  (positive = A favored, negative = B favored)
  total: number;     // Pts_A + Pts_B
  winProbA: number;  // 0–1 win probability for team A
  winProbB: number;  // 0–1 win probability for team B
}

/**
 * Standard normal CDF using the Abramowitz & Stegun rational approximation.
 * Max absolute error < 7.5 × 10⁻⁸.
 */
function normCDF(x: number): number {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1.0 / (1.0 + p * ax);
  const poly = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
  const y = 1.0 - poly * Math.exp(-ax * ax);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Run the KenPom projection for a matchup.
 *
 * @param tempoA  AdjT (adjusted tempo) for team A
 * @param ortgA   Adj. Offensive Rating for team A
 * @param drtgA   Adj. Defensive Rating for team A
 * @param tempoB  AdjT for team B
 * @param ortgB   Adj. Offensive Rating for team B
 * @param drtgB   Adj. Defensive Rating for team B
 */
export function calcKenPomProjection(
  tempoA: number,
  ortgA: number,
  drtgA: number,
  tempoB: number,
  ortgB: number,
  drtgB: number
): KenPomProjection {
  // Pace: weighted 60% toward the slower team, 40% toward the faster
  const poss =
    0.60 * Math.min(tempoA, tempoB) + 0.40 * Math.max(tempoA, tempoB);

  // Tournament-normalized offensive efficiency adjusted for opponent's defense,
  // with a 3% tournament regression factor applied to both teams
  const effA = (AVG_ORTG * ((ortgA / AVG_ORTG) - (1 - (drtgB / AVG_DRTG)))) * TOURNEY_FACTOR;
  const effB = (AVG_ORTG * ((ortgB / AVG_ORTG) - (1 - (drtgA / AVG_DRTG)))) * TOURNEY_FACTOR;

  // Projected points
  const ptsA = (effA / 100) * poss;
  const ptsB = (effB / 100) * poss;

  // Signed spread: positive = A is projected winner
  const spread = ptsA - ptsB;
  const total  = ptsA + ptsB;

  // Win probability via standard normal CDF (std dev ≈ 11 points in CBB)
  const winProbA = normCDF(spread / 11);
  const winProbB = 1 - winProbA;

  return { poss, ptsA, ptsB, spread, total, winProbA, winProbB };
}

/**
 * Format a score for display, e.g. 78.3
 */
export function formatScore(pts: number): string {
  return pts.toFixed(1);
}

/**
 * Format a spread for display, e.g. "-13.5" or "+4.2"
 */
export function formatSpread(spread: number): string {
  const rounded = Math.round(spread * 2) / 2; // round to nearest 0.5
  return rounded >= 0 ? `+${rounded.toFixed(1)}` : `${rounded.toFixed(1)}`;
}
