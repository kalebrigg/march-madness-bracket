"use client";

import type { Matchup, Prediction } from "@/lib/types";
import { MatchCard } from "./MatchCard";

interface FinalFourProps {
  finalFourGames: Matchup[];
  championship: Matchup | null;
  predictions: Record<string, Prediction>;
  onMatchClick?: (matchup: Matchup) => void;
}

export function FinalFour({ finalFourGames, championship, predictions, onMatchClick }: FinalFourProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-w-[180px] px-4">
      <div className="text-[10px] text-center text-muted-foreground font-semibold uppercase tracking-wider">
        Final Four
      </div>
      {finalFourGames.map((game) => (
        <div key={game.gameId} className="w-full max-w-[180px]">
          <MatchCard
            matchup={game}
            prediction={predictions[game.gameId] ?? null}
            onClick={() => onMatchClick?.(game)}
          />
        </div>
      ))}

      {championship && (
        <>
          <div className="text-[10px] text-center text-muted-foreground font-semibold uppercase tracking-wider mt-2">
            Championship
          </div>
          <div className="w-full max-w-[180px]">
            <MatchCard
              matchup={championship}
              prediction={predictions[championship.gameId] ?? null}
              onClick={() => onMatchClick?.(championship)}
            />
          </div>
        </>
      )}
    </div>
  );
}
