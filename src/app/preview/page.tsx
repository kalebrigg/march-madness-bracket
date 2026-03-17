import { getTournamentData } from "@/lib/data";
import { applyMockStates } from "@/lib/mock-data";
import { Bracket } from "@/components/bracket/Bracket";
import { Header } from "@/components/layout/Header";
import Link from "next/link";

// Always dynamic — this is a dev/test route, never needs caching
export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const { tournament, predictions, odds, kenPomData } = await getTournamentData();
  const { patched, legend } = applyMockStates(tournament);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Preview banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 no-print">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base">🧪</span>
            <span className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
              Preview Mode — Mock Game States
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {legend.map((entry, i) => (
              <span key={i}>
                <span className="font-medium text-foreground">
                  {entry.teamA} vs {entry.teamB}:
                </span>{" "}
                {entry.patch.label} ({entry.patch.score[0]}–{entry.patch.score[1]})
              </span>
            ))}
          </div>
          <div className="sm:ml-auto shrink-0 flex gap-3 text-xs">
            <Link href="/preview/bets" className="underline text-primary hover:opacity-80">
              Preview Best Bets →
            </Link>
            <Link href="/" className="underline text-muted-foreground hover:opacity-80">
              ← Live bracket
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 py-4">
        <Bracket
          tournament={patched}
          predictions={predictions}
          odds={odds}
          kenPomData={kenPomData}
        />
      </main>
    </div>
  );
}
