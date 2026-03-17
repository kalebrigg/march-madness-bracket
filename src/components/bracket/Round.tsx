"use client";

import type { Matchup, Prediction } from "@/lib/types";
import { MatchCard } from "./MatchCard";

interface RoundProps {
  matchups: Matchup[];
  predictions: Record<string, Prediction>;
  roundNumber: number;
  roundName: string;
  onMatchClick?: (matchup: Matchup) => void;
  compact?: boolean;
}

export function Round({
  matchups,
  predictions,
  roundName,
  onMatchClick,
}: RoundProps) {
  return (
    <div className="flex flex-col justify-around w-[165px] shrink-0">
      <div className="text-[10px] text-center text-muted-foreground font-semibold uppercase tracking-wider mb-1">
        {roundName}
      </div>
      {matchups.map((matchup) => (
        <div key={matchup.gameId} className="flex-1 flex items-center py-0.5">
          <MatchCard
            matchup={matchup}
            prediction={predictions[matchup.gameId] ?? null}
            onClick={() => onMatchClick?.(matchup)}
          />
        </div>
      ))}
    </div>
  );
}
