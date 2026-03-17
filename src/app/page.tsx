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

    // Try to find odds for this matchup
    const matchKey = makeMatchKey(team1.name, team2.name);
    const gameOdds = oddsMap.get(matchKey);
    if (gameOdds) {
      odds[matchup.gameId] = gameOdds;
    }

    const impliedProb = gameOdds?.impliedProbability ?? null;
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
