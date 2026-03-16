import { SEED_WIN_RATES } from "./constants";
import type { Prediction } from "./types";

/**
 * Get historical win rate for a seed matchup in the first round.
 * Returns the probability that the better (lower) seed wins.
 */
function getFirstRoundWinRate(seed1: number, seed2: number): number {
  const higher = Math.min(seed1, seed2);
  const lower = Math.max(seed1, seed2);
  const key = `${higher}v${lower}`;
  return SEED_WIN_RATES[key] ?? seedBasedWinRate(seed1, seed2);
}

/**
 * General seed-based win rate using a logistic curve.
 * Calibrated against historical tournament data.
 * Returns probability that team1 (seed1) wins.
 */
function seedBasedWinRate(seed1: number, seed2: number): number {
  const diff = seed2 - seed1; // positive = seed1 is better
  return 1 / (1 + Math.exp(-0.175 * diff));
}

/**
 * Predict matchup outcome.
 * Uses seed-based history for first round, logistic model for later rounds.
 * When odds-implied probability is available, blends 70% odds + 30% seed model.
 */
export function predictMatchup(
  seed1: number,
  seed2: number,
  roundNumber: number,
  oddsImplied?: [number, number] | null
): Prediction {
  // Calculate seed-based probability
  let seedProb: number;
  if (roundNumber === 1) {
    seedProb = getFirstRoundWinRate(seed1, seed2);
    // Flip if seed1 is actually the worse seed
    if (seed1 > seed2) {
      seedProb = 1 - seedProb;
    }
  } else {
    seedProb = seedBasedWinRate(seed1, seed2);
  }

  // If odds are available, blend
  if (oddsImplied && oddsImplied[0] > 0 && oddsImplied[1] > 0) {
    const blended1 = 0.7 * oddsImplied[0] + 0.3 * seedProb;
    const blended2 = 0.7 * oddsImplied[1] + 0.3 * (1 - seedProb);
    // Normalize
    const total = blended1 + blended2;
    return {
      team1WinPct: blended1 / total,
      team2WinPct: blended2 / total,
      source: "blended",
    };
  }

  return {
    team1WinPct: seedProb,
    team2WinPct: 1 - seedProb,
    source: "seed-history",
  };
}
