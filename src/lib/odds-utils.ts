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
