import { fetchTournamentData, buildTournament } from "@/lib/espn";
import { fetchOdds, parseOdds, makeMatchKey } from "@/lib/odds";
import { predictMatchup } from "@/lib/prediction";
import { KENPOM_DATA } from "@/lib/kenpom";
import type { Prediction, GameOdds, Matchup, TeamKenPom } from "@/lib/types";
import { Bracket } from "@/components/bracket/Bracket";
import { Header } from "@/components/layout/Header";
import { AdSlot } from "@/components/layout/AdSlot";

async function getTournamentData() {
  const events = await fetchTournamentData();
  const tournament = buildTournament(events);

  // Fetch odds
  const oddsData = await fetchOdds();
  const oddsMap = oddsData ? parseOdds(oddsData) : new Map<string, GameOdds>();

  // Use real KenPom data
  const kenPomData: TeamKenPom = KENPOM_DATA;

  // Generate predictions for all matchups (as plain object for serialization)
  const predictions: Record<string, Prediction> = {};
  const odds: Record<string, GameOdds> = {};
  const allMatchups: Matchup[] = [
    ...tournament.regions.flatMap((r) => r.rounds.flatMap((rd) => rd.matchups)),
    ...tournament.finalFour,
    ...(tournament.championship ? [tournament.championship] : []),
  ];

  for (const matchup of allMatchups) {
    const team1 = matchup.teams[0];
    const team2 = matchup.teams[1];
    if (!team1 || !team2) continue;
    // Skip predictions for TBD opponents (ESPN uses seed 99 for unannounced teams)
    // The logistic model would produce a ~100% win probability which is meaningless
    if (team1.seed === 99 || team2.seed === 99) continue;

    // Try to find odds for this matchup
    const matchKey = makeMatchKey(team1.name, team2.name);
    const gameOdds = oddsMap.get(matchKey);
    let alignedOdds: GameOdds | undefined;

    if (gameOdds) {
      // Odds API stores moneyline[0] = home team, moneyline[1] = away team.
      // makeMatchKey sorts alphabetically so the lookup works regardless of order,
      // but we must re-align so moneyline[0] matches ESPN's team1 and [1] matches team2.
      const oddsHome = gameOdds.homeTeam.toLowerCase();
      const espnTeam1 = team1.name.toLowerCase();
      // Team1 is the Odds API home team if its name is contained in (or contains) the odds home name
      const team1IsHome =
        oddsHome.includes(espnTeam1) || espnTeam1.includes(oddsHome);

      alignedOdds = team1IsHome
        ? gameOdds
        : {
            ...gameOdds,
            bookmakers: gameOdds.bookmakers.map((bm) => ({
              ...bm,
              moneyline: [bm.moneyline[1], bm.moneyline[0]] as [number, number],
            })),
            impliedProbability: gameOdds.impliedProbability
              ? [gameOdds.impliedProbability[1], gameOdds.impliedProbability[0]]
              : null,
          };

      odds[matchup.gameId] = alignedOdds;
    }

    const impliedProb = alignedOdds?.impliedProbability ?? null;
    predictions[matchup.gameId] = predictMatchup(
      team1.seed,
      team2.seed,
      matchup.roundNumber,
      impliedProb
    );
  }

  return { tournament, predictions, odds, kenPomData };
}

export default async function Home() {
  const { tournament, predictions, odds, kenPomData } = await getTournamentData();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 py-4">
        {/* <AdSlot adSlot="top-banner" adFormat="horizontal" className="mb-4" /> */}

        <div className="text-center mb-4 no-print">
          <p className="text-sm text-muted-foreground">
            Click any matchup for full details including venue, TV channel, odds, KenPom ratings, and win probability.
          </p>
        </div>

        <Bracket
          tournament={tournament}
          predictions={predictions}
          odds={odds}
          kenPomData={kenPomData}
        />

        {/* <AdSlot adSlot="bottom-banner" adFormat="horizontal" className="mt-4" /> */}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-wrap justify-center gap-4">
          <span>&copy; 2026 March Madness Bracket Hub</span>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="/about" className="hover:underline">About</a>
        </div>
      </footer>
    </div>
  );
}
