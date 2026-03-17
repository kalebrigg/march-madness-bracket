/**
 * KenPom-based game projection model.
 *
 * Formulas from: Expected Margin = (AdjEM_A − AdjEM_B) × (ExpPoss / 100)
 *
 *   ExpPoss   = 0.55 × MIN(AdjT_A, AdjT_B) + 0.45 × MAX(AdjT_A, AdjT_B)
 *   Eff_A     = ORtg_A × (DRtg_B / 100)   — A's offense vs B's defense
 *   Eff_B     = ORtg_B × (DRtg_A / 100)   — B's offense vs A's defense
 *   Pts_A     = (Eff_A / 100) × ExpPoss
 *   Pts_B     = (Eff_B / 100) × ExpPoss
 *   Spread    = Pts_A − Pts_B              — positive = A favored
 *   Total     = Pts_A + Pts_B
 *   WinProb_A = normCDF(Spread / 11)       — std dev ≈ 11 pts for college basketball
 */

export interface KenPomProjection {
  poss: number;      // Expected possessions
  ptsA: number;      // Projected points for team A (team1)
  ptsB: number;      // Projected points for team B (team2)
  spread: number;    // Pts_A − Pts_B  (positive = A favored)
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
  // Pace: weighted toward the slower team
  const poss =
    0.55 * Math.min(tempoA, tempoB) + 0.45 * Math.max(tempoA, tempoB);

  // Each team's offensive efficiency adjusted for opponent's defense
  const effA = ortgA * (drtgB / 100);
  const effB = ortgB * (drtgA / 100);

  // Projected points
  const ptsA = (effA / 100) * poss;
  const ptsB = (effB / 100) * poss;

  const spread = ptsA - ptsB;
  const total  = ptsA + ptsB;

  // Win probability via normal distribution (std dev ≈ 11 points in CBB)
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
