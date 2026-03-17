/**
 * Mock state patcher — overlays fake in-progress / final statuses onto real
 * tournament data so the UI can be visually tested before any games tip off.
 * Only imported by the /preview route; never used in production pages.
 */

import type { Tournament, Matchup } from "./types";

interface MockPatch {
  status: "post" | "in";
  score: [number, number];
  winner: 0 | 1 | null;
  label: string; // shown in the preview legend
}

const PATCHES: MockPatch[] = [
  { status: "post", score: [78, 65], winner: 0, label: "FINAL — favorite wins" },
  { status: "post", score: [71, 74], winner: 1, label: "FINAL — upset (lower seed wins)" },
  { status: "in",   score: [42, 38], winner: null, label: "LIVE — favorite leading at half" },
  { status: "in",   score: [55, 57], winner: null, label: "LIVE — upset in progress" },
];

export interface MockLegendEntry {
  teamA: string;
  teamB: string;
  patch: MockPatch;
}

export function applyMockStates(tournament: Tournament): {
  patched: Tournament;
  legend: MockLegendEntry[];
} {
  // Deep clone so we never mutate ISR-cached data
  const t: Tournament = JSON.parse(JSON.stringify(tournament));

  // Collect round-1 matchups with two known teams across all regions
  const r1Matchups: Matchup[] = t.regions
    .flatMap((r) =>
      r.rounds
        .filter((rd) => rd.number === 1)
        .flatMap((rd) => rd.matchups)
    )
    .filter(
      (m) =>
        m.teams[0] &&
        m.teams[1] &&
        m.teams[0].seed !== 99 &&
        m.teams[1].seed !== 99
    );

  const legend: MockLegendEntry[] = [];

  for (let i = 0; i < PATCHES.length && i < r1Matchups.length; i++) {
    const m = r1Matchups[i];
    const patch = PATCHES[i];

    m.status = patch.status;
    m.score = patch.score;
    m.winner = patch.winner;

    legend.push({
      teamA: m.teams[0]!.name,
      teamB: m.teams[1]!.name,
      patch,
    });
  }

  return { patched: t, legend };
}
