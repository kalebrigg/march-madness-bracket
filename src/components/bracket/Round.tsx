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
  compact,
}: RoundProps) {
  return (
    <div className="flex flex-col justify-around gap-2 min-w-[160px]">
      <div className="text-[10px] text-center text-muted-foreground font-semibold uppercase tracking-wider mb-1">
        {roundName}
      </div>
      {matchups.map((matchup) => (
        <div key={matchup.gameId} className="flex items-center">
          <MatchCard
            matchup={matchup}
            prediction={predictions[matchup.gameId] ?? null}
            onClick={() => onMatchClick?.(matchup)}
            compact={compact}
          />
        </div>
      ))}
    </div>
  );
}
