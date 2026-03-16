"use client";

import type { Region as RegionType, Matchup, Prediction } from "@/lib/types";
import { Round } from "./Round";

interface RegionProps {
  region: RegionType;
  predictions: Record<string, Prediction>;
  onMatchClick?: (matchup: Matchup) => void;
  reverse?: boolean;
}

export function Region({ region, predictions, onMatchClick, reverse }: RegionProps) {
  const rounds = reverse ? [...region.rounds].reverse() : region.rounds;

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-bold text-center mb-2 uppercase tracking-wide">
        {region.name}
      </h3>
      <div className="flex gap-3 items-stretch">
        {rounds.map((round) => (
          <Round
            key={round.number}
            matchups={round.matchups}
            predictions={predictions}
            roundNumber={round.number}
            roundName={round.name}
            onMatchClick={onMatchClick}
            compact={round.number <= 2}
          />
        ))}
      </div>
    </div>
  );
}
