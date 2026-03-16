import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "About — March Madness 2026 Bracket",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">About</h1>

        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>
            March Madness Bracket Hub is the cleanest way to follow the NCAA Division I
            Men&apos;s Basketball Tournament. We combine the bracket, game schedule, venue
            information, TV channels, betting odds, and win probability predictions into
            one single interactive view.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Why We Built This</h2>
          <p>
            Every March, fans jump between bracket pages and schedule pages just to find out
            when and where a game is happening. We built this to solve that problem — every
            piece of info you need is right on the bracket.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Data Sources</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Game schedules and scores from ESPN</li>
            <li>Betting odds from The Odds API</li>
            <li>Win probability model based on historical seed performance and current odds</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-6">Disclaimer</h2>
          <p>
            This site is not affiliated with or endorsed by the NCAA, ESPN, or any sportsbook.
            Betting odds are provided for informational purposes only. Please gamble responsibly.
          </p>
        </div>
      </main>
    </div>
  );
}
