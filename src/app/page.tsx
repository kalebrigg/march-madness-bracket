import { getTournamentData } from "@/lib/data";
import { Bracket } from "@/components/bracket/Bracket";
import { Header } from "@/components/layout/Header";

export default async function Home() {
  const { tournament, predictions, odds, kenPomData } = await getTournamentData();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 py-4">
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
