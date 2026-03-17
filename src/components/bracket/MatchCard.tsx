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
  team: { name: string; seed: number; logo: string; color: string } | null;
  isWinner: boolean;
  score?: number;
  showScore: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1 relative",
        isWinner && "font-bold"
      )}
    >
      {/* Team color accent bar */}
      {team?.color && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[6px]"
          style={{ backgroundColor: `#${team.color.replace(/^#/, "")}` }}
        />
      )}
      <div className="pl-[5px] flex items-center gap-2 w-full">
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

  // Determine which team is favored by the model and compute edge color
  // Show for all statuses so pre-game predictions can be compared to results
  let metricDisplay: React.ReactNode = null;
  if (prediction && team1 && team2) {
    const favored = prediction.team1WinPct >= prediction.team2WinPct ? 0 : 1;
    const favoredTeam = favored === 0 ? team1 : team2;
    const favoredPct = favored === 0 ? prediction.team1WinPct : prediction.team2WinPct;
    const edge = prediction.edge1 != null
      ? (favored === 0 ? prediction.edge1 : -prediction.edge1)
      : null;

    // Color by edge: green = model likes favored more than market, red = model behind market
    const edgeColor =
      edge == null
        ? "text-muted-foreground"
        : edge > 0.03
        ? "text-green-600 font-semibold"
        : edge < -0.03
        ? "text-red-500"
        : "text-muted-foreground";

    metricDisplay = (
      <span className={cn("tabular-nums flex items-center gap-0.5", edgeColor)}>
        {status !== "pre" && (
          <span className="text-[8px] font-normal text-muted-foreground uppercase tracking-wide opacity-70">pre</span>
        )}
        {favoredTeam.abbreviation} {formatProbability(favoredPct)}
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isPlaceholder}
      className={cn(
        "w-full text-left rounded border bg-card text-card-foreground text-xs transition-all overflow-hidden",
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

          {metricDisplay}
        </div>
      )}
    </button>
  );
}
