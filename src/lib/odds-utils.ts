import type { BookmakerOdds } from "./types";

/**
 * Convert American odds to implied probability (includes vig).
 * e.g. -210 → 0.677, +175 → 0.363
 */
export function americanToImplied(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  }
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

/**
 * Remove vig (sportsbook margin) to get "true" probability.
 * Takes two implied probabilities that sum > 1 and normalizes them to sum to 1.
 */
export function removeVig(prob1: number, prob2: number): [number, number] {
  const total = prob1 + prob2;
  if (total === 0) return [0.5, 0.5];
  return [prob1 / total, prob2 / total];
}

/**
 * Get consensus (average) moneyline from multiple bookmakers.
 */
export function consensusImpliedProbability(
  bookmakers: BookmakerOdds[]
): [number, number] | null {
  if (bookmakers.length === 0) return null;

  let sum1 = 0;
  let sum2 = 0;

  for (const bm of bookmakers) {
    sum1 += americanToImplied(bm.moneyline[0]);
    sum2 += americanToImplied(bm.moneyline[1]);
  }

  const avg1 = sum1 / bookmakers.length;
  const avg2 = sum2 / bookmakers.length;

  return removeVig(avg1, avg2);
}

/**
 * Format a probability as a percentage string.
 * e.g. 0.652 → "65%"
 */
export function formatProbability(prob: number): string {
  return `${Math.round(prob * 100)}%`;
}

/**
 * Format American odds for display.
 * e.g. -210 → "-210", 175 → "+175"
 */
export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

/**
 * Convert a win probability (0-1) to fair American odds.
 * e.g. 0.64 → -178, 0.36 → +178
 */
export function probabilityToAmericanOdds(prob: number): number {
  if (prob <= 0) return 99999;
  if (prob >= 1) return -99999;
  if (prob >= 0.5) {
    return Math.round(-(prob / (1 - prob)) * 100);
  }
  return Math.round(((1 - prob) / prob) * 100);
}

/**
 * Calculate average American moneyline across bookmakers for one side.
 * Averages via implied probability space (mathematically correct) then
 * converts back to American odds.
 */
export function averageMoneyline(bookmakers: BookmakerOdds[], side: 0 | 1): number {
  if (bookmakers.length === 0) return 0;
  const sum = bookmakers.reduce((acc, bm) => acc + americanToImplied(bm.moneyline[side]), 0);
  const avgImplied = sum / bookmakers.length;
  return probabilityToAmericanOdds(avgImplied);
}

/**
 * Calculate expected value (as a fraction of bet) for a $100 wager.
 * Returns e.g. 0.042 = +4.2% EV, -0.031 = -3.1% EV.
 *
 * @param modelProb  Your model's win probability (0-1)
 * @param americanOdds  The line you're betting into (American format)
 */
export function calcEV(modelProb: number, americanOdds: number): number {
  const profitPerDollar =
    americanOdds > 0 ? americanOdds / 100 : 100 / Math.abs(americanOdds);
  return modelProb * profitPerDollar - (1 - modelProb);
}

/**
 * Color class for an edge value (model - market).
 * Green = positive edge, red = negative, gray = neutral.
 */
export function edgeColorClass(edge: number): string {
  if (edge > 0.03) return "text-green-600 font-semibold";
  if (edge < -0.03) return "text-red-500 font-semibold";
  return "text-muted-foreground";
}

/**
 * Format a signed percentage for display.
 * e.g. 0.064 → "+6.4%", -0.031 → "-3.1%"
 */
export function formatSignedPct(value: number): string {
  const pct = (value * 100).toFixed(1);
  return value >= 0 ? `+${pct}%` : `${pct}%`;
}
