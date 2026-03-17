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
import {
  formatProbability,
  formatOdds,
  formatSignedPct,
  consensusImpliedProbability,
  probabilityToAmericanOdds,
  averageMoneyline,
  calcEV,
  edgeColorClass,
} from "@/lib/odds-utils";
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

  // KenPom lookups (needed early for record fallback)
  const kp1 = team1 ? getTeamKenPom(team1.name, kenPomData) : null;
  const kp2 = team2 ? getTeamKenPom(team2.name, kenPomData) : null;

  // ESPN doesn't return records for tournament games — fall back to KenPom record
  const record1 = team1?.record || kp1?.record || "";
  const record2 = team2?.record || kp2?.record || "";

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
                #{team1.seed === 99 ? 0 : team1.seed} seed {record1 && `• ${record1}`}
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
                #{team2.seed === 99 ? 0 : team2.seed} seed {record2 && `• ${record2}`}
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

        {/* Edge & Value Analysis */}
        {prediction && status === "pre" && team1 && team2 && odds && odds.bookmakers.length > 0 && impliedProbs && (() => {
          const edge1 = prediction.team1WinPct - impliedProbs[0];
          const edge2 = prediction.team2WinPct - impliedProbs[1];
          const avgML1 = averageMoneyline(odds.bookmakers, 0);
          const avgML2 = averageMoneyline(odds.bookmakers, 1);
          const ev1 = calcEV(prediction.team1WinPct, avgML1);
          const ev2 = calcEV(prediction.team2WinPct, avgML2);
          const fair1 = probabilityToAmericanOdds(prediction.team1WinPct);
          const fair2 = probabilityToAmericanOdds(prediction.team2WinPct);

          return (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Edge &amp; Value
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground/70 text-[10px] border-b">
                      <th className="text-left pb-1.5"></th>
                      <th className="text-right pb-1.5 font-semibold text-xs text-foreground">{team1.abbreviation}</th>
                      <th className="text-right pb-1.5 font-semibold text-xs text-foreground">{team2.abbreviation}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/50">
                      <td className="py-1.5 text-muted-foreground">Market (vig-free)</td>
                      <td className="text-right py-1.5 font-mono">{formatProbability(impliedProbs[0])}</td>
                      <td className="text-right py-1.5 font-mono">{formatProbability(impliedProbs[1])}</td>
                    </tr>
                    <tr className="border-t border-border/50">
                      <td className="py-1.5 text-muted-foreground">Model</td>
                      <td className="text-right py-1.5 font-mono">{formatProbability(prediction.team1WinPct)}</td>
                      <td className="text-right py-1.5 font-mono">{formatProbability(prediction.team2WinPct)}</td>
                    </tr>
                    <tr className="border-t border-border/50">
                      <td className="py-1.5 text-muted-foreground">Edge</td>
                      <td className={`text-right py-1.5 font-mono ${edgeColorClass(edge1)}`}>{formatSignedPct(edge1)}</td>
                      <td className={`text-right py-1.5 font-mono ${edgeColorClass(edge2)}`}>{formatSignedPct(edge2)}</td>
                    </tr>
                    <tr className="border-t border-border/50">
                      <td className="py-1.5 text-muted-foreground">Fair odds</td>
                      <td className="text-right py-1.5 font-mono">{formatOdds(fair1)}</td>
                      <td className="text-right py-1.5 font-mono">{formatOdds(fair2)}</td>
                    </tr>
                    <tr className="border-t border-border/50">
                      <td className="py-1.5 text-muted-foreground">EV (avg line)</td>
                      <td className={`text-right py-1.5 font-mono ${edgeColorClass(ev1)}`}>{formatSignedPct(ev1)}</td>
                      <td className={`text-right py-1.5 font-mono ${edgeColorClass(ev2)}`}>{formatSignedPct(ev2)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[10px] text-muted-foreground/60 pt-0.5">
                  Edge = model − market. EV per $100 bet at average line across DraftKings, FanDuel &amp; BetMGM.
                </p>
              </div>
            </>
          );
        })()}

        {/* Odds & Implied Probability */}
        {status === "pre" && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Betting Odds
              </div>

              {odds && odds.bookmakers && odds.bookmakers.length > 0 ? (
                <>
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

                  {/* Odds table: moneyline + spread */}
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground/70 border-b text-[10px]">
                        <th className="text-left pb-1.5"></th>
                        <th className="text-right pb-1.5 font-semibold text-xs text-foreground">{team1?.abbreviation ?? "Team 1"}</th>
                        <th className="text-right pb-1.5">Spread</th>
                        <th className="text-right pb-1.5 font-semibold text-xs text-foreground">{team2?.abbreviation ?? "Team 2"}</th>
                        <th className="text-right pb-1.5">Spread</th>
                      </tr>
                    </thead>
                    <tbody>
                      {odds.bookmakers.map((bm) => (
                        <tr key={bm.name} className="border-t border-border/50 hover:bg-muted/30">
                          <td className="py-2 font-medium">{bm.name}</td>
                          <td className="text-right py-2 font-mono">{formatOdds(bm.moneyline[0])}</td>
                          <td className="text-right py-2 font-mono">
                            {bm.spread
                              ? `${bm.spread[0] > 0 ? "+" : ""}${bm.spread[0]} (${formatOdds(bm.spreadJuice?.[0] ?? -110)})`
                              : "—"}
                          </td>
                          <td className="text-right py-2 font-mono">{formatOdds(bm.moneyline[1])}</td>
                          <td className="text-right py-2 font-mono">
                            {bm.spread
                              ? `${bm.spread[1] > 0 ? "+" : ""}${bm.spread[1]} (${formatOdds(bm.spreadJuice?.[1] ?? -110)})`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="text-xs text-muted-foreground italic py-3 text-center">
                  Live betting odds not yet available for this matchup.
                  <br />
                  Check <a href="https://theoddapi.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                    The Odds API
                  </a> for current lines.
                </div>
              )}
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
              {(!kp1 && !kp2) ? (
                <div className="text-xs text-muted-foreground italic py-2">
                  KenPom data not available for these teams. Visit <a href="https://kenpom.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">kenpom.com</a> for ratings.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs">
                      <th className="text-left py-1.5"></th>
                      <th className="text-center py-1.5 font-semibold">{team1?.abbreviation}</th>
                      <th className="text-center py-1.5 font-semibold">METRIC</th>
                      <th className="text-center py-1.5 font-semibold">{team2?.abbreviation}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/50">
                      <td className="py-2 text-muted-foreground text-xs">Rank</td>
                      <td className="text-center py-2 font-semibold">{kp1?.rank ?? "-"}</td>
                      <td className="text-center py-2 text-xs font-semibold text-muted-foreground">Ranking</td>
                      <td className="text-center py-2 font-semibold">{kp2?.rank ?? "-"}</td>
                    </tr>
                    <tr className="border-t border-border/50">
                      <td className="py-2 text-muted-foreground text-xs">Adj. EM</td>
                      <td className="text-center py-2 font-mono font-medium">{kp1?.adjEM?.toFixed(1) ?? "-"}</td>
                      <td className="text-center py-2 text-xs font-semibold text-muted-foreground">Adj. EM</td>
                      <td className="text-center py-2 font-mono font-medium">{kp2?.adjEM?.toFixed(1) ?? "-"}</td>
                    </tr>
                    <tr className="border-t border-border/50">
                      <td className="py-2 text-muted-foreground text-xs">Adj. Off</td>
                      <td className="text-center py-2 font-mono font-medium">{kp1?.adjOffense?.toFixed(1) ?? "-"}</td>
                      <td className="text-center py-2 text-xs font-semibold text-muted-foreground">Adj. Off</td>
                      <td className="text-center py-2 font-mono font-medium">{kp2?.adjOffense?.toFixed(1) ?? "-"}</td>
                    </tr>
                    <tr className="border-t border-border/50">
                      <td className="py-2 text-muted-foreground text-xs">Adj. Def</td>
                      <td className="text-center py-2 font-mono font-medium">{kp1?.adjDefense?.toFixed(1) ?? "-"}</td>
                      <td className="text-center py-2 text-xs font-semibold text-muted-foreground">Adj. Def</td>
                      <td className="text-center py-2 font-mono font-medium">{kp2?.adjDefense?.toFixed(1) ?? "-"}</td>
                    </tr>
                    <tr className="border-t border-border/50">
                      <td className="py-2 text-muted-foreground text-xs">Tempo</td>
                      <td className="text-center py-2 font-mono font-medium">{kp1?.tempo?.toFixed(1) ?? "-"}</td>
                      <td className="text-center py-2 text-xs font-semibold text-muted-foreground">Tempo</td>
                      <td className="text-center py-2 font-mono font-medium">{kp2?.tempo?.toFixed(1) ?? "-"}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
