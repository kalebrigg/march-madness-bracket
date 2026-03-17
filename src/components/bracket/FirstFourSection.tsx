"use client";

import type { Matchup, Prediction } from "@/lib/types";
import { MatchCard } from "./MatchCard";

interface FirstFourSectionProps {
  games: Matchup[];
  predictions: Record<string, Prediction>;
  onMatchClick?: (matchup: Matchup) => void;
}

/** Label shown below each First Four card describing who the winner faces. */
function contextLabel(matchup: Matchup): string {
  const { region, teams } = matchup;
  // Determine seed from the teams (skip seed 99 which means TBD)
  const seed =
    teams[0]?.seed && teams[0].seed !== 99
      ? teams[0].seed
      : teams[1]?.seed && teams[1].seed !== 99
      ? teams[1].seed
      : null;

  if (seed === null) return `Winner plays in ${region} Region`;

  // Figure out the opponent seed for Round 1
  const opponentSeed = 17 - seed; // NCAA bracket complement: 1↔16, 6↔11
  return `Winner plays ${opponentSeed}-seed in ${region} Region`;
}

export function FirstFourSection({
  games,
  predictions,
  onMatchClick,
}: FirstFourSectionProps) {
  if (games.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 border-t border-border" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
          First Four — Play-In Games
        </h2>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {games.map((matchup) => (
          <div key={matchup.gameId} className="flex flex-col gap-1">
            <MatchCard
              matchup={matchup}
              prediction={predictions[matchup.gameId] ?? null}
              onClick={() => onMatchClick?.(matchup)}
            />
            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              {contextLabel(matchup)}
            </p>
          </div>
        ))}

        {/* Filler placeholders if we have fewer than 4 games (e.g. before ESPN publishes all) */}
        {Array.from({ length: Math.max(0, 4 - games.length) }).map((_, i) => (
          <div key={`ff-placeholder-${i}`} className="flex flex-col gap-1">
            <div className="rounded border bg-card opacity-40 py-5" />
            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              TBD
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
