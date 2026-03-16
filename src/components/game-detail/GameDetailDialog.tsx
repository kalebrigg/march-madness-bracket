"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Matchup, Prediction, GameOdds } from "@/lib/types";
import { formatProbability, formatOdds } from "@/lib/odds-utils";

interface GameDetailDialogProps {
  matchup: Matchup | null;
  prediction: Prediction | null;
  odds: GameOdds | null;
  onClose: () => void;
}

export function GameDetailDialog({ matchup, prediction, odds, onClose }: GameDetailDialogProps) {
  if (!matchup) return null;

  const { teams, status, score, winner, startTime, venue, city, state, broadcast } = matchup;
  const team1 = teams[0];
  const team2 = teams[1];

  return (
    <Dialog open={!!matchup} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {team1?.name ?? "TBD"} vs {team2?.name ?? "TBD"}
          </DialogTitle>
        </DialogHeader>

        {/* Teams matchup header */}
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Team 1 */}
          <div className="flex-1 text-center">
            {team1?.logo && (
              <img src={team1.logo} alt={team1.name} className="w-12 h-12 mx-auto mb-1 object-contain" />
            )}
            <div className="font-bold text-sm">{team1?.name ?? "TBD"}</div>
            {team1 && (
              <div className="text-xs text-muted-foreground">
                #{team1.seed} seed &middot; {team1.record}
              </div>
            )}
            {status !== "pre" && score && (
              <div className={`text-2xl font-bold mt-1 ${winner === 0 ? "text-green-600" : ""}`}>
                {score[0]}
              </div>
            )}
          </div>

          <div className="text-muted-foreground font-bold text-lg">VS</div>

          {/* Team 2 */}
          <div className="flex-1 text-center">
            {team2?.logo && (
              <img src={team2.logo} alt={team2.name} className="w-12 h-12 mx-auto mb-1 object-contain" />
            )}
            <div className="font-bold text-sm">{team2?.name ?? "TBD"}</div>
            {team2 && (
              <div className="text-xs text-muted-foreground">
                #{team2.seed} seed &middot; {team2.record}
              </div>
            )}
            {status !== "pre" && score && (
              <div className={`text-2xl font-bold mt-1 ${winner === 1 ? "text-green-600" : ""}`}>
                {score[1]}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Game Info */}
        <div className="space-y-2 text-sm">
          {status === "in" && (
            <div className="flex items-center gap-2 text-red-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </div>
          )}
          {status === "post" && (
            <Badge variant="secondary">FINAL</Badge>
          )}

          {startTime && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="font-medium">{format(new Date(startTime), "EEE, MMM d · h:mm a")}</span>
            </div>
          )}

          {venue && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venue</span>
              <span className="font-medium text-right">{venue}</span>
            </div>
          )}

          {(city || state) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">{[city, state].filter(Boolean).join(", ")}</span>
            </div>
          )}

          {broadcast && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">TV</span>
              <span className="font-bold">{broadcast}</span>
            </div>
          )}
        </div>

        {/* Win Probability */}
        {prediction && status === "pre" && team1 && team2 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Win Probability
              </div>

              {/* Probability bar */}
              <div className="flex h-6 rounded-full overflow-hidden text-[10px] font-bold text-white">
                <div
                  className="flex items-center justify-center transition-all"
                  style={{
                    width: `${prediction.team1WinPct * 100}%`,
                    backgroundColor: team1.color,
                  }}
                >
                  {formatProbability(prediction.team1WinPct)}
                </div>
                <div
                  className="flex items-center justify-center transition-all"
                  style={{
                    width: `${prediction.team2WinPct * 100}%`,
                    backgroundColor: team2.color,
                  }}
                >
                  {formatProbability(prediction.team2WinPct)}
                </div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{team1.abbreviation}</span>
                <span className="capitalize">
                  Source: {prediction.source === "blended" ? "Odds + Seed Model" : prediction.source === "odds-implied" ? "Betting Odds" : "Historical Seed Data"}
                </span>
                <span>{team2.abbreviation}</span>
              </div>
            </div>
          </>
        )}

        {/* Odds table */}
        {odds && odds.bookmakers.length > 0 && status === "pre" && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Moneyline Odds
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-1">Book</th>
                    <th className="text-right py-1">{team1?.abbreviation ?? "Team 1"}</th>
                    <th className="text-right py-1">{team2?.abbreviation ?? "Team 2"}</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.bookmakers.map((bm) => (
                    <tr key={bm.name} className="border-t border-border/50">
                      <td className="py-1 font-medium">{bm.name}</td>
                      <td className="text-right py-1 font-mono">{formatOdds(bm.moneyline[0])}</td>
                      <td className="text-right py-1 font-mono">{formatOdds(bm.moneyline[1])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
