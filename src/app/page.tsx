import { getTournamentData } from "@/lib/data";
import { Bracket } from "@/components/bracket/Bracket";
import { Header } from "@/components/layout/Header";

export default async function Home() {
  const { tournament, predictions, odds, kenPomData } = await getTournamentData();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1920px] mx-auto px-2 py-4 lg:px-3">
        <div className="text-center mb-4 no-print">
          <p className="text-sm text-muted-foreground">
            Click any matchup for full details including venue, TV channel, odds, KenPom ratings, and win probability.
          </p>

          {/* Bracket legend */}
        <div className="flex items-center justify-center gap-4 px-1 pb-3 text-[11px] text-muted-foreground flex-wrap">
          <span className="font-semibold text-foreground/40 uppercase tracking-wider text-[10px]">Key</span>
          <span className="flex items-center gap-1.5">
            <span>⚡</span>
            <span>Model predicts upset</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span>⚖️</span>
            <span>Toss-up — too close to call</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            <span>Live</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-green-600 font-semibold text-xs">68%</span>
            <span>Model edge over market</span>
          </span>
        </div>
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
