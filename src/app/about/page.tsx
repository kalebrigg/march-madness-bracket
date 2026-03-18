import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "About — March Madness 2026 Bracket",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-12">

        {/* Hero */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-3">About This Site</h2>
          <p className="text-muted-foreground leading-relaxed">
            March Madness Bracket Hub is a data-driven NCAA Tournament tracker that combines live bracket data,
            real-money betting markets, and advanced efficiency ratings to give you the most complete picture of
            every game — from the first round through the National Championship.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            This page explains exactly how every number on the site is calculated, where the data comes from,
            and what it means. No statistics background required.
          </p>
        </div>

        <Divider />

        {/* Data Sources */}
        <Section title="📡 Where Does the Data Come From?">
          <p>The site pulls from three independent sources and combines them on every page load:</p>
          <ul className="space-y-4 mt-4">
            <Item title="ESPN Scoreboard API (free, real-time)">
              Provides the live bracket structure — every game, every seed, every team, venue, tip-off time, TV
              channel, and live/final scores. This is the backbone of the bracket view. ESPN data is fetched
              fresh on every page load and on every manual refresh — no caching delay.
            </Item>
            <Item title="The Odds API (real-money sportsbooks)">
              Pulls betting lines from <strong>BetMGM, DraftKings, and FanDuel</strong> — the three
              largest legal sportsbooks in the US. We collect three types of lines for every game:
              <ul className="mt-2 ml-4 space-y-1 list-disc text-sm">
                <li><strong>Moneyline</strong> — straight-up winner odds (e.g. −350 / +280)</li>
                <li><strong>Spread</strong> — point handicap (e.g. Duke −8.5 at −110 juice)</li>
                <li><strong>Over/Under (O/U)</strong> — total combined points line (e.g. 148.5)</li>
              </ul>
              Odds are fetched on every page load and manual refresh. Not all games have odds available —
              early-round games are listed before lines open, and some smaller matchups open later.
            </Item>
            <Item title="KenPom Efficiency Ratings (2025–26 season)">
              KenPom (kenpom.com) is widely considered the gold standard for college basketball analytics. Their
              ratings represent how efficiently a team scores and defends per 100 possessions, adjusted for the
              strength of every opponent they faced all season. We use the 2025–26 season ratings for all
              tournament teams.
            </Item>
          </ul>
        </Section>

        <Divider />

        {/* Prediction Model */}
        <Section title="🧠 The Win Probability Model">
          <p>
            Every matchup gets a <strong>model win probability</strong> — our estimate of each team&apos;s
            chance of winning. This is a three-signal blend that adapts based on what data is available:
          </p>

          <div className="mt-5 space-y-4">
            <ModelTier badge="Tier 1 — Best" label="KenPom + Odds + Seed (55 / 35 / 10)" color="green">
              When all three data sources are available, we blend:
              <ul className="mt-2 ml-4 space-y-1 list-disc text-sm">
                <li>
                  <strong>55% KenPom efficiency model</strong> — the most predictive single factor for college
                  basketball outcomes, measuring how efficiently each team scores and defends per 100 possessions
                  against tournament-caliber opponents.
                </li>
                <li>
                  <strong>35% betting market implied probability</strong> — markets incorporate injury news,
                  sharp money, and real-world information our model cannot see. Only <em>pre-game</em> market
                  odds are used (see Live Games below).
                </li>
                <li>
                  <strong>10% historical seed win rates</strong> — over 40 years of tournament data, certain
                  seed matchups have extremely strong historical win rates (e.g. 1-seeds win 99.3% vs 16-seeds).
                  Seed history provides a small regularizing anchor.
                </li>
              </ul>
            </ModelTier>
            <ModelTier badge="Tier 2" label="KenPom + Seed (65 / 35)" color="blue">
              When odds aren&apos;t available yet (no line opened), we use 65% KenPom efficiency win probability
              + 35% historical seed win rates.
            </ModelTier>
            <ModelTier badge="Tier 3" label="Odds + Seed (75 / 25)" color="yellow">
              When KenPom data isn&apos;t available for a team (rare), we use 75% pre-game betting market
              implied probability + 25% historical seed win rates.
            </ModelTier>
            <ModelTier badge="Tier 4 — Fallback" label="Historical Seed Model Only" color="gray">
              When neither odds nor KenPom are available, we fall back to pure historical seed-based win rates.
              For first-round games these come from actual 40-year tournament data. For later rounds, we use a
              logistic curve calibrated to historical performance.
            </ModelTier>
          </div>
        </Section>

        <Divider />

        {/* Live Games */}
        {/* <Section title="🔴 Live Games — How the Model Handles In-Progress Games">
          <p>
            When a game is in progress, live betting odds move dramatically based on the current score and
            time remaining — they no longer reflect pre-game team quality. Feeding live market odds into our
            blended model would corrupt the prediction on every refresh (e.g., a team up 15 at halftime would
            suddenly appear 85% likely to win in our model, even though our model is meant to reflect
            pre-game efficiency).
          </p>
          <p className="mt-3">
            To prevent this, we <strong>freeze market odds at the time a game tips off</strong>. Specifically:
          </p>
          <ul className="mt-3 space-y-2 text-sm ml-4 list-disc">
            <li>
              The blended win probability model only uses market odds when <code className="bg-muted px-1 rounded text-xs">status = &quot;pre&quot;</code>.
              For live or final games, the model drops to KenPom + Seed (Tier 2).
            </li>
            <li>
              The game detail dialog for a <strong>live game</strong> shows only: current score, KenPom
              efficiency projection (spread, total, win probability), and the current live odds for reference.
              The blended win probability, Edge &amp; Value, and Monte Carlo sections are hidden during live
              play since they would reflect pre-game data against live-shifted odds.
            </li>
            <li>
              Use the <strong>Refresh</strong> button in the header to pull the latest ESPN scores and
              current live betting lines at any time.
            </li>
          </ul> */}

        <Divider />

        {/* KenPom Model */}
        <Section title="📐 The KenPom Game Projection (Spread & Total)">
          <p>
            Inside each game modal, you&apos;ll see a <strong>KenPom Projection</strong> section that estimates
            the final score, point spread, and total. These formulas simulate how two teams&apos; offenses
            perform against each other&apos;s defenses at their expected pace.
          </p>

          <div className="mt-5 space-y-4">
            <FormulaBlock title="Step 1 — Expected Possessions">
              {"Poss = 0.55 × MIN(Tempo_A, Tempo_B) + 0.45 × MAX(Tempo_A, Tempo_B)"}
              <p className="mt-2 text-sm text-muted-foreground">
                Pace is weighted toward the <em>slower</em> team. In real games, a slow-paced team drags a
                fast-paced team down more than the reverse. <strong>Tempo</strong> = KenPom adjusted
                possessions per 40 minutes of game time.
              </p>
            </FormulaBlock>

            <FormulaBlock title="Step 2 — Adjusted Offensive Efficiency">
              {"Eff_A = ORtg_A × (DRtg_B / 100)"}
              <p className="mt-2 text-sm text-muted-foreground">
                Team A&apos;s offense facing Team B&apos;s defense. <strong>ORtg</strong> is points scored
                per 100 possessions against an average opponent. <strong>DRtg</strong> is points allowed
                per 100 possessions against an average opponent.
                When DRtg_B = 100 (average defense), A scores at their normal rate.
                When DRtg_B &lt; 100 (elite defense like 89), A scores less.
                When DRtg_B &gt; 100 (weak defense like 106), A scores more.
              </p>
            </FormulaBlock>

            <FormulaBlock title="Step 3 — Projected Points, Spread, and Total">
              {"Pts_A = (Eff_A / 100) × Poss\nPts_B = (Eff_B / 100) × Poss\nSpread = Pts_A − Pts_B    (positive = A favored)\nTotal  = Pts_A + Pts_B"}
            </FormulaBlock>

            <FormulaBlock title="Step 4 — Win Probability from Spread">
              {"Win%_A = NormalCDF(Spread / 11)"}
              <p className="mt-2 text-sm text-muted-foreground">
                The spread is divided by 11 — the approximate standard deviation of college basketball game
                outcomes. This says: even if Team A is a 10-point favorite on paper, there is still significant
                random variance (hot shooting, foul trouble, officiating) that can change the outcome. Dividing
                by this number converts the expected margin into a realistic win probability using the normal
                (bell curve) distribution.
              </p>
            </FormulaBlock>
          </div>

          <div className="mt-5 p-4 bg-card border border-l-4 border-l-yellow-500 rounded-lg text-sm">
            <p className="font-semibold text-foreground mb-1">
              ⚠️ Why Projected Totals Run High
            </p>
            <p className="text-muted-foreground">
              The efficiency model consistently projects 5–15 points higher scoring than actual tournament
              game totals. This happens because KenPom ratings are calibrated against a full season of
              opponents — many of them weaker teams. When two above-average offenses play each other with
              imperfect defenses, the multiplicative formula slightly inflates both teams&apos; scoring.
              Tournament games also tend to be more defensive than regular-season games due to the
              elimination pressure. The <strong>projected spread is more reliable</strong> since both
              scores inflate roughly equally — the differential (spread) is accurate. We show the
              Model vs. O/U as a data point but do not make lean recommendations on totals.
            </p>
          </div>
        </Section>

        <Divider />

        {/* Odds Explanation */}
        <Section title="💰 Reading Betting Odds">
          <p>
            Sportsbooks express odds in <strong>American format</strong>. Here&apos;s how to read them:
          </p>
          <ul className="mt-3 space-y-2 text-sm ml-4 list-disc">
            <li>
              <strong>Negative odds (e.g. −350)</strong> = favorite. Bet $350 to win $100 profit.
              The bigger the number, the bigger the favorite.
            </li>
            <li>
              <strong>Positive odds (e.g. +280)</strong> = underdog. Win $280 profit on a $100 bet.
              Bigger number = bigger underdog.
            </li>
            <li>
              <strong>Spread (e.g. Duke −8.5)</strong> = Duke must win by 9+ for Duke bets to pay out.
              The opponent covers if they lose by 8 or fewer, or win outright.
            </li>
            <li>
              <strong>Juice / Vig (e.g. −110)</strong> = the sportsbook&apos;s commission. Bet $110 to
              win $100. This is how books profit regardless of which side wins.
            </li>
            <li>
              <strong>Over/Under</strong> = a bet on whether the combined score of both teams will be
              above (Over) or below (Under) the posted total.
            </li>
          </ul>

          <h4 className="font-semibold mt-6 mb-2 text-foreground">Implied Probability (Vig Removed)</h4>
          <p className="text-sm">
            Sportsbooks build in a margin so that the two sides of a bet sum to more than 100%. We remove
            this to find the &quot;true&quot; market probability:
          </p>
          <ol className="mt-3 space-y-1 text-sm ml-4 list-decimal">
            <li>Convert each moneyline to implied probability. E.g. −350 → 350/(350+100) = 77.8%</li>
            <li>
              Both sides sum to &gt;100% (e.g. 77.8% + 26.3% = 104.1%) — the extra 4.1% is the vig
            </li>
            <li>Normalize: 77.8/104.1 = <strong>74.7%</strong> and 26.3/104.1 = <strong>25.3%</strong></li>
          </ol>
          <p className="mt-3 text-sm">
            We average this across all three sportsbooks for a consensus vig-free probability — the most
            accurate representation of what the market believes.
          </p>
        </Section>

        <Divider />

        {/* Edge & Value */}
        <Section title="📊 Edge & Value Analysis">
          <p>
            The Edge &amp; Value section in each game modal shows whether our model disagrees with the market
            — and whether that disagreement represents betting value.
          </p>
          <dl className="mt-4 space-y-5 text-sm">
            <Term term="Edge">
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">Edge = Model Win% − Market Vig-Free Win%</code>
              <span className="block mt-1">
                A positive edge means our model likes this team more than the market does.
                <strong className="text-green-600"> Green (&gt;+3%)</strong> = model meaningfully higher than market.
                <strong className="text-red-500"> Red (&lt;−3%)</strong> = market is significantly more confident.
                A gray edge (within ±3%) means model and market are essentially in agreement.
              </span>
            </Term>
            <Term term="Fair Odds">
              What odds <em>should</em> be offered if our model is correct. If the model says 64% win
              probability, fair American odds = −178. If a book is offering −130, that&apos;s theoretically
              great value. If it&apos;s offering −400, you&apos;re paying a big premium beyond fair value.
            </Term>
            <Term term="EV (Expected Value)">
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">EV = P_win × (profit/$1) − P_lose</code>
              <span className="block mt-1">
                The expected return on a $100 bet at the average consensus line, <em>if our model is right</em>.
                EV = +5% means you&apos;d expect $5 profit per $100 bet over many similar bets.
                Positive EV does not guarantee a win — it means the bet has theoretical long-run value.
              </span>
            </Term>
          </dl>
        </Section>

        <Divider />

        {/* Best Bets Dashboard */}
        <Section title="🎯 Best Bets Dashboard">
          <p>
            The <strong>Best Bets</strong> page lists every tournament game with odds available, sorted by
            absolute edge — the games where our model disagrees most with the market. It is a fast way to
            scan the full field for potential value without clicking into individual games.
          </p>
          <ul className="mt-3 space-y-1 text-sm ml-4 list-disc">
            <li><strong>Matchup</strong> — Team names highlighted green (edge &gt;3%) or red (edge &lt;−3%)</li>
            <li><strong>ML</strong> — Average consensus American moneyline across all three books</li>
            <li><strong>Spread</strong> — Consensus average spread line</li>
            <li><strong>Market%</strong> — Vig-free implied win probability from sportsbooks</li>
            <li><strong>Model%</strong> — Our blended model win probability</li>
            <li><strong>Edge</strong> — Model% minus Market% (positive = we like this team vs. the line)</li>
            <li><strong>EV</strong> — Expected value at average consensus line, per $100 bet</li>
            <li><strong>KP Spread</strong> — KenPom efficiency model&apos;s independent projected spread</li>
            <li><strong>Source</strong> — Which model tier was used (KP+Odds+Seed, KP+Seed, Odds+Seed, or Seed only)</li>
          </ul>
        </Section>

        <Divider />

        {/* Caveats */}
        <Section title="⚖️ Important Caveats">
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-destructive">
              This site is for informational and entertainment purposes only. Nothing here constitutes
              financial or gambling advice.
            </p>
            <p>
              <strong>Models are imperfect.</strong> KenPom ratings reflect regular-season performance.
              They do not account for injuries, fatigue, hot/cold shooting streaks, officiating tendencies,
              or the specific circumstances of a tournament game. No statistical model can fully capture the
              chaos of March Madness — that&apos;s what makes it great.
            </p>
            <p>
              <strong>Markets are smart.</strong> Sportsbook lines are sharpened by professional bettors
              with access to information our model doesn&apos;t have. A positive model edge means our model
              sees something different from the market — which could be an error in our model, not a market
              mistake.
            </p>
            <p>
              <strong>Small sample sizes.</strong> The tournament is 67 games over three weeks. Upsets are
              not just possible — they are structurally built in. Even the best models have large error bars
              when samples are this small.
            </p>
            <p>
              <strong>Gamble responsibly.</strong> If you choose to bet, only wager what you can afford to
              lose.{" "}
              <a
                href="https://www.ncpgambling.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                NCPG Helpline: 1-800-522-4700
              </a>
              .
            </p>
          </div>
        </Section>

        <Divider />

        <div className="text-xs text-muted-foreground text-center pb-4">
          <p>Data: ESPN Scoreboard API · The Odds API · KenPom.com · Historical NCAA tournament records</p>
          <p className="mt-1">
            Built with Next.js, Tailwind CSS, and TypeScript · &copy; 2026 March Madness Bracket Hub
          </p>
        </div>

      </main>
    </div>
  );
}

// ─────────────────────────── helper components ───────────────────────────

function Divider() {
  return <hr className="border-border" />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="text-sm">
      <span className="font-semibold text-foreground">{title}: </span>
      <span>{children}</span>
    </li>
  );
}

function ModelTier({
  badge,
  label,
  color,
  children,
}: {
  badge: string;
  label: string;
  color: "green" | "blue" | "yellow" | "gray";
  children: React.ReactNode;
}) {
  const borderColors: Record<string, string> = {
    green: "border-l-green-500",
    blue: "border-l-blue-500",
    yellow: "border-l-yellow-500",
    gray: "border-l-border",
  };
  const badgeColors: Record<string, string> = {
    green: "bg-green-500 text-white",
    blue: "bg-blue-500 text-white",
    yellow: "bg-yellow-500 text-black",
    gray: "bg-muted text-muted-foreground",
  };
  return (
    <div className={`rounded-lg border border-l-4 bg-card p-4 text-sm ${borderColors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeColors[color]}`}>{badge}</span>
        <span className="font-semibold text-foreground">{label}</span>
      </div>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

function FormulaBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-foreground text-sm">{title}</p>
      <div className="bg-muted/50 border border-border rounded-md px-4 py-3 font-mono text-[12px] text-foreground whitespace-pre-wrap leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Term({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground mb-0.5">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}
