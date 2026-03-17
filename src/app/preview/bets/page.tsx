/**
 * Preview version of Best Bets — uses mock game states to verify that
 * in-progress / finished games are correctly excluded from the dashboard.
 */
import { getTournamentData } from "@/lib/data";
import { applyMockStates } from "@/lib/mock-data";
import { getTeamKenPom } from "@/lib/kenpom";
import { calcKenPomProjection, formatSpread } from "@/lib/kenpom-model";
import {
  averageMoneyline,
  calcEV,
  consensusImpliedProbability,
  edgeColorClass,
  formatOdds,
  formatProbability,
  formatSignedPct,
} from "@/lib/odds-utils";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import type { Matchup, Prediction, GameOdds, TeamKenPom } from "@/lib/types";

export const dynamic = "force-dynamic";

interface BetRow {
  matchup: Matchup;
  prediction: Prediction;
  odds: GameOdds;
  impliedProbs: [number, number];
  edge1: number;
  edge2: number;
  ev1: number;
  ev2: number;
  avgML1: number;
  avgML2: number;
  kenPomSpread: number | null;
  bestEdge: number;
}

function buildBetRows(
  allMatchups: Matchup[],
  predictions: Record<string, Prediction>,
  odds: Record<string, GameOdds>,
  kenPomData: TeamKenPom
): BetRow[] {
  const rows: BetRow[] = [];

  for (const matchup of allMatchups) {
    if (matchup.status !== "pre") continue; // ← the filter we're testing
    const team1 = matchup.teams[0];
    const team2 = matchup.teams[1];
    if (!team1 || !team2) continue;
    if (team1.seed === 99 || team2.seed === 99) continue;

    const prediction = predictions[matchup.gameId];
    const gameOdds = odds[matchup.gameId];
    if (!prediction || !gameOdds || gameOdds.bookmakers.length === 0) continue;

    const impliedProbs = consensusImpliedProbability(gameOdds.bookmakers);
    if (!impliedProbs) continue;

    const edge1 = prediction.team1WinPct - impliedProbs[0];
    const edge2 = prediction.team2WinPct - impliedProbs[1];
    const avgML1 = averageMoneyline(gameOdds.bookmakers, 0);
    const avgML2 = averageMoneyline(gameOdds.bookmakers, 1);
    const ev1 = calcEV(prediction.team1WinPct, avgML1);
    const ev2 = calcEV(prediction.team2WinPct, avgML2);

    let kenPomSpread: number | null = null;
    const kp1 = getTeamKenPom(team1.name, kenPomData);
    const kp2 = getTeamKenPom(team2.name, kenPomData);
    if (
      kp1?.tempo && kp1?.adjOffense && kp1?.adjDefense &&
      kp2?.tempo && kp2?.adjOffense && kp2?.adjDefense
    ) {
      kenPomSpread = calcKenPomProjection(
        kp1.tempo, kp1.adjOffense, kp1.adjDefense,
        kp2.tempo, kp2.adjOffense, kp2.adjDefense
      ).spread;
    }

    rows.push({
      matchup, prediction, odds: gameOdds, impliedProbs,
      edge1, edge2, ev1, ev2, avgML1, avgML2, kenPomSpread,
      bestEdge: Math.max(Math.abs(edge1), Math.abs(edge2)),
    });
  }

  return rows.sort((a, b) => b.bestEdge - a.bestEdge);
}

const ROUND_NAMES: Record<number, string> = {
  1: "R64", 2: "R32", 3: "S16", 4: "E8", 5: "F4", 6: "NCG",
};

export default async function PreviewBetsPage() {
  const { allMatchups: realMatchups, predictions, odds, kenPomData, tournament } =
    await getTournamentData();

  // Apply mock states to the tournament, then rebuild allMatchups from patched data
  const { patched, legend } = applyMockStates(tournament);
  const allMatchups: Matchup[] = [
    ...patched.firstFour,
    ...patched.regions.flatMap((r) => r.rounds.flatMap((rd) => rd.matchups)),
    ...patched.finalFour,
    ...(patched.championship ? [patched.championship] : []),
  ];

  const rows = buildBetRows(allMatchups, predictions, odds, kenPomData);
  const removedCount = realMatchups.filter((m) => m.status === "pre").length - rows.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Preview banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base">🧪</span>
            <span className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
              Preview Mode — Mock Game States
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {legend.map((entry, i) => (
              <span key={i}>
                <span className={`font-medium ${entry.patch.status === "in" ? "text-red-500" : "text-foreground"}`}>
                  {entry.patch.status === "in" ? "🔴 LIVE" : "✅ FINAL"}:
                </span>{" "}
                {entry.teamA} vs {entry.teamB} ({entry.patch.score[0]}–{entry.patch.score[1]})
              </span>
            ))}
          </div>
          <div className="sm:ml-auto shrink-0 flex gap-3 text-xs">
            <Link href="/preview" className="underline text-primary hover:opacity-80">
              ← Preview Bracket
            </Link>
            <Link href="/bets" className="underline text-muted-foreground hover:opacity-80">
              Live Best Bets
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Best Bets Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Only pre-game matchups shown. {removedCount > 0 && (
              <span className="text-green-600 font-medium">
                ✓ {removedCount} mock game{removedCount !== 1 ? "s" : ""} (LIVE/FINAL) correctly hidden.
              </span>
            )}
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No pre-game matchups with odds available.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left px-3 py-3 font-semibold">Matchup</th>
                  <th className="text-center px-2 py-3">Rnd</th>
                  <th className="text-right px-3 py-3">ML</th>
                  <th className="text-right px-3 py-3">Spread</th>
                  <th className="text-right px-3 py-3">Market%</th>
                  <th className="text-right px-3 py-3">Model%</th>
                  <th className="text-right px-3 py-3">Edge</th>
                  <th className="text-right px-3 py-3">EV</th>
                  <th className="text-right px-3 py-3">KP Spread</th>
                  <th className="text-left px-3 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => {
                  const { matchup, prediction, odds: gameOdds, impliedProbs, edge1, edge2, ev1, ev2, avgML1, avgML2, kenPomSpread } = row;
                  const team1 = matchup.teams[0]!;
                  const team2 = matchup.teams[1]!;

                  const sortedBooks = [...gameOdds.bookmakers].sort((a, b) => {
                    const order = ["BetMGM", "DraftKings", "FanDuel"];
                    const ai = order.findIndex(n => a.name.toLowerCase().includes(n.toLowerCase()));
                    const bi = order.findIndex(n => b.name.toLowerCase().includes(n.toLowerCase()));
                    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                  });
                  const bookSpreads = sortedBooks.filter(bm => bm.spread).map(bm => bm.spread![0]);
                  const avgBookSpread = bookSpreads.length > 0
                    ? bookSpreads.reduce((a, b) => a + b, 0) / bookSpreads.length
                    : null;

                  const roundName = ROUND_NAMES[matchup.roundNumber] ?? `R${matchup.roundNumber}`;

                  return (
                    <tr key={matchup.gameId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          {[{ team: team1, edge: edge1 }, { team: team2, edge: edge2 }].map(({ team, edge }, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {team.logo && <img src={team.logo} alt="" className="w-4 h-4 object-contain" />}
                              <span className={edge > 0.03 ? "font-semibold text-green-600" : edge < -0.03 ? "text-red-500" : ""}>
                                <span className="text-muted-foreground mr-1 text-[11px]">#{team.seed}</span>
                                {team.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="text-center px-2 py-3 text-muted-foreground font-mono text-xs">{roundName}</td>
                      <td className="text-right px-3 py-3 font-mono">
                        <div className="flex flex-col items-end gap-1">
                          <span>{formatOdds(avgML1)}</span>
                          <span>{formatOdds(avgML2)}</span>
                        </div>
                      </td>
                      <td className="text-right px-3 py-3 font-mono">
                        {avgBookSpread !== null ? (
                          <div className="flex flex-col items-end gap-1">
                            <span>{avgBookSpread > 0 ? "+" : ""}{avgBookSpread.toFixed(1)}</span>
                            <span>{avgBookSpread <= 0 ? "+" : ""}{(-avgBookSpread).toFixed(1)}</span>
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="text-right px-3 py-3 font-mono">
                        <div className="flex flex-col items-end gap-1">
                          <span>{formatProbability(impliedProbs[0])}</span>
                          <span>{formatProbability(impliedProbs[1])}</span>
                        </div>
                      </td>
                      <td className="text-right px-3 py-3 font-mono">
                        <div className="flex flex-col items-end gap-1">
                          <span>{formatProbability(prediction.team1WinPct)}</span>
                          <span>{formatProbability(prediction.team2WinPct)}</span>
                        </div>
                      </td>
                      <td className="text-right px-3 py-3 font-mono">
                        <div className="flex flex-col items-end gap-1">
                          <span className={edgeColorClass(edge1)}>{formatSignedPct(edge1)}</span>
                          <span className={edgeColorClass(edge2)}>{formatSignedPct(edge2)}</span>
                        </div>
                      </td>
                      <td className="text-right px-3 py-3 font-mono">
                        <div className="flex flex-col items-end gap-1">
                          <span className={edgeColorClass(ev1)}>{formatSignedPct(ev1)}</span>
                          <span className={edgeColorClass(ev2)}>{formatSignedPct(ev2)}</span>
                        </div>
                      </td>
                      <td className="text-right px-3 py-3 font-mono text-xs">
                        {kenPomSpread !== null
                          ? <span>{team1.abbreviation} {formatSpread(kenPomSpread)}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {prediction.source === "kenpom-blended" ? "KP+Odds+Seed"
                            : prediction.source === "kenpom-only" ? "KP+Seed"
                            : prediction.source === "blended" ? "Odds+Seed"
                            : "Seed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
