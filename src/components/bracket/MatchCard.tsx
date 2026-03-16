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

export function MatchCard({ matchup, prediction, onClick, compact }: MatchCardProps) {
  const { teams, status, score, winner, startTime, broadcast } = matchup;
  const team1 = teams[0];
  const team2 = teams[1];
  const isPlaceholder = !team1 && !team2;

  return (
    <button
      onClick={onClick}
      disabled={isPlaceholder}
      className={cn(
        "w-full text-left rounded-lg border bg-card text-card-foreground transition-all",
        compact ? "text-xs p-1.5" : "text-sm p-2",
        !isPlaceholder && "hover:shadow-md hover:border-primary/50 cursor-pointer",
        isPlaceholder && "opacity-50 cursor-default",
        status === "in" && "border-red-500 ring-1 ring-red-500/30"
      )}
    >
      {/* Team 1 */}
      <div className={cn(
        "flex items-center gap-1.5",
        compact ? "mb-0.5" : "mb-1",
        status === "post" && winner === 0 && "font-bold"
      )}>
        {team1 ? (
          <>
            <span
              className="inline-block w-1 h-4 rounded-full shrink-0"
              style={{ backgroundColor: team1.color }}
            />
            {!compact && team1.logo && (
              <img src={team1.logo} alt="" className="w-4 h-4 object-contain" />
            )}
            <span className="text-muted-foreground font-mono text-[10px] w-4 text-right shrink-0">
              {team1.seed}
            </span>
            <span className="truncate flex-1">{compact ? team1.abbreviation : team1.name}</span>
            {status !== "pre" && score && (
              <span className="font-mono tabular-nums font-semibold">{score[0]}</span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground italic">TBD</span>
        )}
      </div>

      {/* Team 2 */}
      <div className={cn(
        "flex items-center gap-1.5",
        status === "post" && winner === 1 && "font-bold"
      )}>
        {team2 ? (
          <>
            <span
              className="inline-block w-1 h-4 rounded-full shrink-0"
              style={{ backgroundColor: team2.color }}
            />
            {!compact && team2.logo && (
              <img src={team2.logo} alt="" className="w-4 h-4 object-contain" />
            )}
            <span className="text-muted-foreground font-mono text-[10px] w-4 text-right shrink-0">
              {team2.seed}
            </span>
            <span className="truncate flex-1">{compact ? team2.abbreviation : team2.name}</span>
            {status !== "pre" && score && (
              <span className="font-mono tabular-nums font-semibold">{score[1]}</span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground italic">TBD</span>
        )}
      </div>

      {/* Footer info */}
      {!isPlaceholder && (
        <div className={cn(
          "flex items-center justify-between gap-1 border-t pt-1 text-muted-foreground",
          compact ? "mt-0.5 text-[9px]" : "mt-1.5 text-[10px]"
        )}>
          {status === "pre" && startTime ? (
            <>
              <span>{format(new Date(startTime), "M/d h:mm a")}</span>
              {broadcast && <span className="font-semibold text-foreground">{broadcast}</span>}
            </>
          ) : status === "in" ? (
            <>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
              {broadcast && <span className="font-semibold text-foreground">{broadcast}</span>}
            </>
          ) : status === "post" ? (
            <span>FINAL</span>
          ) : (
            <span>TBA</span>
          )}

          {prediction && status === "pre" && team1 && team2 && (
            <span className="text-[9px]">
              {formatProbability(prediction.team1WinPct)} / {formatProbability(prediction.team2WinPct)}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
