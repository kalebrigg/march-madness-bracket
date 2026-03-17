/**
 * Shared data-fetching logic used by both the bracket page and bets page.
 * Runs server-side in Next.js App Router.
 */

import { fetchTournamentData, buildTournament } from "@/lib/espn";
import { fetchOdds, parseOdds, makeMatchKey } from "@/lib/odds";
import { predictMatchup } from "@/lib/prediction";
import { KENPOM_DATA, getTeamKenPom } from "@/lib/kenpom";
import { calcKenPomProjection } from "@/lib/kenpom-model";
import type {
  Prediction,
  GameOdds,
  Matchup,
  TeamKenPom,
} from "@/lib/types";

export interface TournamentDataResult {
  tournament: Awaited<ReturnType<typeof buildTournament>>;
  predictions: Record<string, Prediction>;
  odds: Record<string, GameOdds>;
  kenPomData: TeamKenPom;
  allMatchups: Matchup[];
}

export async function getTournamentData(): Promise<TournamentDataResult> {
  const events = await fetchTournamentData();
  const tournament = buildTournament(events);

  // Fetch odds
  const oddsData = await fetchOdds();
  const oddsMap = oddsData ? parseOdds(oddsData) : new Map<string, GameOdds>();

  // Use real KenPom data
  const kenPomData: TeamKenPom = KENPOM_DATA;

  // Generate predictions for all matchups
  const predictions: Record<string, Prediction> = {};
  const odds: Record<string, GameOdds> = {};
  const allMatchups: Matchup[] = [
    ...tournament.firstFour,
    ...tournament.regions.flatMap((r) => r.rounds.flatMap((rd) => rd.matchups)),
    ...tournament.finalFour,
    ...(tournament.championship ? [tournament.championship] : []),
  ];

  for (const matchup of allMatchups) {
    const team1 = matchup.teams[0];
    const team2 = matchup.teams[1];
    if (!team1 || !team2) continue;
    // Skip TBD opponents (ESPN uses seed 99 for unannounced teams)
    if (team1.seed === 99 || team2.seed === 99) continue;

    // Try to find odds for this matchup
    const matchKey = makeMatchKey(team1.name, team2.name);
    const gameOdds = oddsMap.get(matchKey);
    let alignedOdds: GameOdds | undefined;

    if (gameOdds) {
      // Re-align so moneyline[0] matches ESPN's team1
      const oddsHome = gameOdds.homeTeam.toLowerCase();
      const espnTeam1 = team1.name.toLowerCase();
      const team1IsHome =
        oddsHome.includes(espnTeam1) || espnTeam1.includes(oddsHome);

      alignedOdds = team1IsHome
        ? gameOdds
        : {
            ...gameOdds,
            bookmakers: gameOdds.bookmakers.map((bm) => ({
              ...bm,
              moneyline: [bm.moneyline[1], bm.moneyline[0]] as [number, number],
              spread: bm.spread
                ? ([bm.spread[1], bm.spread[0]] as [number, number])
                : undefined,
              spreadJuice: bm.spreadJuice
                ? ([bm.spreadJuice[1], bm.spreadJuice[0]] as [number, number])
                : undefined,
              // totals are not team-directional — no flip needed
            })),
            impliedProbability: gameOdds.impliedProbability
              ? [gameOdds.impliedProbability[1], gameOdds.impliedProbability[0]]
              : null,
          };

      odds[matchup.gameId] = alignedOdds;
    }

    // Compute KenPom win probability if data is available for both teams
    let kenPomWinProb: number | null = null;
    const kp1 = getTeamKenPom(team1.name, kenPomData);
    const kp2 = getTeamKenPom(team2.name, kenPomData);
    if (
      kp1?.tempo && kp1?.adjOffense && kp1?.adjDefense &&
      kp2?.tempo && kp2?.adjOffense && kp2?.adjDefense
    ) {
      const proj = calcKenPomProjection(
        kp1.tempo, kp1.adjOffense, kp1.adjDefense,
        kp2.tempo, kp2.adjOffense, kp2.adjDefense
      );
      kenPomWinProb = proj.winProbA;
    }

    // Only use market odds for pre-game predictions. Live odds reflect the
    // current score and time remaining — not pre-game team quality — so passing
    // them to the model would corrupt the blend mid-game and make predictions
    // change on every refresh. For live/final games we fall back to KP + seed.
    const impliedProb =
      matchup.status === "pre"
        ? (alignedOdds?.impliedProbability ?? null)
        : null;

    predictions[matchup.gameId] = predictMatchup(
      team1.seed,
      team2.seed,
      matchup.roundNumber,
      impliedProb,
      kenPomWinProb,
      kp1?.luck ?? null,
      kp2?.luck ?? null,
    );
  }

  return { tournament, predictions, odds, kenPomData, allMatchups };
}
