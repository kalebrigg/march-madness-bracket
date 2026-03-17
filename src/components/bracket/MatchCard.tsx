"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Matchup, Prediction } from "@/lib/types";
import { formatProbability } from "@/lib/odds-utils";

interface MatchCardProps {
  matchup: Matchup;
  prediction?: Prediction | null;
  onClick?: () => void;
  compact?: boolean;
}

function TeamRow({
  team,
  isWinner,
  score,
  showScore,
}: {
  team: { name: string; seed: number; logo: string } | null;
  isWinner: boolean;
  score?: number;
  showScore: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1",
        isWinner && "font-bold"
      )}
    >
      {team ? (
        <>
          {team.logo ? (
            <img
              src={team.logo}
              alt=""
              className="w-5 h-5 object-contain shrink-0"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-muted shrink-0" />
          )}
          <span className="text-muted-foreground font-mono text-[11px] w-5 text-center shrink-0">
            {team.seed === 99 ? 0 : team.seed}
          </span>
          <span className="truncate flex-1 text-sm">{team.name}</span>
          {showScore && score !== undefined && (
            <span className="font-mono tabular-nums font-semibold text-sm">
              {score}
            </span>
          )}
        </>
      ) : (
        <>
          <div className="w-5 h-5 rounded-full bg-muted shrink-0" />
          <span className="text-muted-foreground font-mono text-[11px] w-5 text-center shrink-0">
            0
          </span>
          <span className="text-muted-foreground text-sm">TBD</span>
        </>
      )}
    </div>
  );
}

export function MatchCard({
  matchup,
  prediction,
  onClick,
}: MatchCardProps) {
  const { teams, status, score, winner, startTime, broadcast } = matchup;
  const team1 = teams[0];
  const team2 = teams[1];
  const isPlaceholder = !team1 && !team2;

  return (
    <button
      onClick={onClick}
      disabled={isPlaceholder}
      className={cn(
        "w-full text-left rounded border bg-card text-card-foreground text-xs transition-all",
        !isPlaceholder && "hover:shadow-md hover:border-primary/50 cursor-pointer",
        isPlaceholder && "opacity-60 cursor-default",
        status === "in" && "border-red-500 ring-1 ring-red-500/30"
      )}
    >
      {/* Team 1 */}
      <TeamRow
        team={team1}
        isWinner={status === "post" && winner === 0}
        score={score?.[0]}
        showScore={status !== "pre"}
      />

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Team 2 */}
      <TeamRow
        team={team2}
        isWinner={status === "post" && winner === 1}
        score={score?.[1]}
        showScore={status !== "pre"}
      />

      {/* Footer info */}
      {!isPlaceholder && (
        <div className="flex items-center justify-between gap-1 border-t pt-0.5 pb-0.5 px-1.5 text-muted-foreground text-[9px]">
          {status === "pre" && startTime ? (
            <>
              <span>{format(new Date(startTime), "M/d h:mm a")}</span>
              {broadcast && (
                <span className="font-semibold text-foreground">
                  {broadcast}
                </span>
              )}
            </>
          ) : status === "in" ? (
            <>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
              {broadcast && (
                <span className="font-semibold text-foreground">
                  {broadcast}
                </span>
              )}
            </>
          ) : status === "post" ? (
            <span>FINAL</span>
          ) : (
            <span>TBA</span>
          )}

          {prediction && status === "pre" && team1 && team2 && (
            <span>
              {formatProbability(prediction.team1WinPct)} /{" "}
              {formatProbability(prediction.team2WinPct)}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
