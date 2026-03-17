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
import type { Matchup, Prediction, GameOdds, TeamKenPom } from "@/lib/types";
import { formatProbability, formatOdds, consensusImpliedProbability, americanToImplied } from "@/lib/odds-utils";
import { getTeamKenPom } from "@/lib/kenpom";

interface GameDetailDialogProps {
  matchup: Matchup | null;
  prediction: Prediction | null;
  odds: GameOdds | null;
  kenPomData: TeamKenPom;
  onClose: () => void;
}

export function GameDetailDialog({ matchup, prediction, odds, kenPomData, onClose }: GameDetailDialogProps) {
  if (!matchup) return null;

  const { teams, status, score, winner, startTime, venue, city, state, broadcast } = matchup;
  const team1 = teams[0];
  const team2 = teams[1];

  // Calculate implied probabilities from odds
  const impliedProbs = odds ? consensusImpliedProbability(odds.bookmakers) : null;

  return (
    <Dialog open={!!matchup} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <img src={team1.logo} alt={team1.name} className="w-16 h-16 mx-auto mb-2 object-contain" />
            )}
            <div className="font-bold text-base">{team1?.name ?? "TBD"}</div>
            {team1 && (
              <div className="text-xs text-muted-foreground">
                #{team1.seed === 99 ? 0 : team1.seed} seed {team1.record && `• ${team1.record}`}
              </div>
            )}
            {status !== "pre" && score && (
              <div className={`text-3xl font-bold mt-2 ${winner === 0 ? "text-green-600" : ""}`}>
                {score[0]}
              </div>
            )}
          </div>

          <div className="text-muted-foreground font-bold text-xl">VS</div>

          {/* Team 2 */}
          <div className="flex-1 text-center">
            {team2?.logo && (
              <img src={team2.logo} alt={team2.name} className="w-16 h-16 mx-auto mb-2 object-contain" />
            )}
            <div className="font-bold text-base">{team2?.name ?? "TBD"}</div>
            {team2 && (
              <div className="text-xs text-muted-foreground">
                #{team2.seed === 99 ? 0 : team2.seed} seed {team2.record && `• ${team2.record}`}
              </div>
            )}
            {status !== "pre" && score && (
              <div className={`text-3xl font-bold mt-2 ${winner === 1 ? "text-green-600" : ""}`}>
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
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Win Probability (Model)
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
                <span className="capitalize text-center text-[11px]">
                  {prediction.source === "blended" ? "Odds + Seed Model" : prediction.source === "odds-implied" ? "Betting Odds" : "Historical Seed Data"}
                </span>
                <span>{team2.abbreviation}</span>
              </div>
            </div>
          </>
        )}

        {/* Odds & Implied Probability */}
        {odds && odds.bookmakers.length > 0 && status === "pre" && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Betting Odds
              </div>

              {/* Implied Probability from Odds */}
              {impliedProbs && (
                <div className="bg-muted/50 rounded-md p-2 mb-2">
                  <div className="text-[11px] font-semibold text-muted-foreground mb-2">
                    Implied Win Probability (Vig Removed)
                  </div>
                  <div className="flex h-5 rounded overflow-hidden text-[9px] font-bold text-white">
                    <div
                      className="flex items-center justify-center transition-all"
                      style={{
                        width: `${impliedProbs[0] * 100}%`,
                        backgroundColor: team1?.color || "#666",
                      }}
                    >
                      {formatProbability(impliedProbs[0])}
                    </div>
                    <div
                      className="flex items-center justify-center transition-all"
                      style={{
                        width: `${impliedProbs[1] * 100}%`,
                        backgroundColor: team2?.color || "#666",
                      }}
                    >
                      {formatProbability(impliedProbs[1])}
                    </div>
                  </div>
                </div>
              )}

              {/* Moneyline odds table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left py-2 font-semibold">Sportsbook</th>
                    <th className="text-right py-2 font-semibold">{team1?.abbreviation ?? "Team 1"}</th>
                    <th className="text-right py-2 font-semibold">{team2?.abbreviation ?? "Team 2"}</th>
                  </tr>
                </thead>
                <tbody>
                  {odds.bookmakers.map((bm) => (
                    <tr key={bm.name} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="py-2 font-medium">{bm.name}</td>
                      <td className="text-right py-2 font-mono text-sm">{formatOdds(bm.moneyline[0])}</td>
                      <td className="text-right py-2 font-mono text-sm">{formatOdds(bm.moneyline[1])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* KenPom Ratings */}
        {team1 && team2 && status === "pre" && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                KenPom Ratings
              </div>
              {(() => {
                const kp1 = getTeamKenPom(team1.name, kenPomData);
                const kp2 = getTeamKenPom(team2.name, kenPomData);

                if (!kp1 && !kp2) {
                  return (
                    <div className="text-xs text-muted-foreground italic py-2">
                      KenPom data not available for these teams. Visit <a href="https://kenpom.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">kenpom.com</a> for ratings.
                    </div>
                  );
                }

                return (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground text-[10px]">
                        <th className="text-left py-1"></th>
                        <th className="text-center py-1 font-semibold">{team1?.abbreviation}</th>
                        <th className="text-center py-1 font-semibold">METRIC</th>
                        <th className="text-center py-1 font-semibold">{team2?.abbreviation}</th>
                      </tr>
                    </thead>
                    <tbody className="text-[10px]">
                      <tr className="border-t border-border/50">
                        <td className="py-1.5 text-muted-foreground">Rank</td>
                        <td className="text-center py-1.5 font-semibold">{kp1?.rank ?? "-"}</td>
                        <td className="text-center py-1.5 font-semibold">Ranking</td>
                        <td className="text-center py-1.5 font-semibold">{kp2?.rank ?? "-"}</td>
                      </tr>
                      <tr className="border-t border-border/50">
                        <td className="py-1.5 text-muted-foreground">Adj. EM</td>
                        <td className="text-center py-1.5 font-mono">{kp1?.adjEM?.toFixed(1) ?? "-"}</td>
                        <td className="text-center py-1.5 font-semibold">Adj. EM</td>
                        <td className="text-center py-1.5 font-mono">{kp2?.adjEM?.toFixed(1) ?? "-"}</td>
                      </tr>
                      <tr className="border-t border-border/50">
                        <td className="py-1.5 text-muted-foreground">Adj. Off</td>
                        <td className="text-center py-1.5 font-mono">{kp1?.adjOffense?.toFixed(1) ?? "-"}</td>
                        <td className="text-center py-1.5 font-semibold">Adj. Off</td>
                        <td className="text-center py-1.5 font-mono">{kp2?.adjOffense?.toFixed(1) ?? "-"}</td>
                      </tr>
                      <tr className="border-t border-border/50">
                        <td className="py-1.5 text-muted-foreground">Adj. Def</td>
                        <td className="text-center py-1.5 font-mono">{kp1?.adjDefense?.toFixed(1) ?? "-"}</td>
                        <td className="text-center py-1.5 font-semibold">Adj. Def</td>
                        <td className="text-center py-1.5 font-mono">{kp2?.adjDefense?.toFixed(1) ?? "-"}</td>
                      </tr>
                      <tr className="border-t border-border/50">
                        <td className="py-1.5 text-muted-foreground">Tempo</td>
                        <td className="text-center py-1.5 font-mono">{kp1?.tempo?.toFixed(1) ?? "-"}</td>
                        <td className="text-center py-1.5 font-semibold">Tempo</td>
                        <td className="text-center py-1.5 font-mono">{kp2?.tempo?.toFixed(1) ?? "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
