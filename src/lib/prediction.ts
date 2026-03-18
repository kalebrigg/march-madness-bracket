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
 *
 * Blend hierarchy:
 *   All three available:  55% KenPom + 35% market + 10% seed
 *   KenPom only:          65% KenPom + 35% seed
 *   Odds only:            75% market + 25% seed
 *   Neither:              100% seed history
 *
 * @param seed1          ESPN seed for team 1
 * @param seed2          ESPN seed for team 2
 * @param roundNumber    Tournament round (1 = First Round)
 * @param oddsImplied    Vig-free implied probability [team1, team2] from market
 * @param kenPomWinProb  KenPom efficiency-model win probability for team1 (0-1)
 */
export function predictMatchup(
  seed1: number,
  seed2: number,
  roundNumber: number,
  oddsImplied?: [number, number] | null,
  kenPomWinProb?: number | null,
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

  const hasOdds   = !!(oddsImplied && oddsImplied[0] > 0 && oddsImplied[1] > 0);
  const hasKenPom = kenPomWinProb != null && kenPomWinProb > 0 && kenPomWinProb < 1;

  if (hasKenPom && hasOdds) {
    // Three-way blend: 55% KenPom + 35% market + 10% seed
    const raw1 = 0.55 * kenPomWinProb! + 0.35 * oddsImplied![0] + 0.10 * seedProb;
    const raw2 = 0.55 * (1 - kenPomWinProb!) + 0.35 * oddsImplied![1] + 0.10 * (1 - seedProb);
    const total = raw1 + raw2;
    const t1 = raw1 / total;
    const edge1 = t1 - oddsImplied![0];
    return {
      team1WinPct: t1,
      team2WinPct: raw2 / total,
      source: "kenpom-blended",
      edge1,
    };
  }

  if (hasKenPom) {
    // KenPom + seed blend: 65% KenPom + 35% seed
    const raw1 = 0.65 * kenPomWinProb! + 0.35 * seedProb;
    const raw2 = 0.65 * (1 - kenPomWinProb!) + 0.35 * (1 - seedProb);
    const total = raw1 + raw2;
    return {
      team1WinPct: raw1 / total,
      team2WinPct: raw2 / total,
      source: "kenpom-only",
    };
  }

  if (hasOdds) {
    // Odds + seed blend: 75% market + 25% seed
    const blended1 = 0.75 * oddsImplied![0] + 0.25 * seedProb;
    const blended2 = 0.75 * oddsImplied![1] + 0.25 * (1 - seedProb);
    const total = blended1 + blended2;
    const t1 = blended1 / total;
    const edge1 = t1 - oddsImplied![0];
    return {
      team1WinPct: t1,
      team2WinPct: blended2 / total,
      source: "blended",
      edge1,
    };
  }

  return {
    team1WinPct: seedProb,
    team2WinPct: 1 - seedProb,
    source: "seed-history",
  };
}
