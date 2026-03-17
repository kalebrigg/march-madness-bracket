import type {
  ESPNScoreboardResponse,
  ESPNEvent,
  ESPNCompetition,
  Matchup,
  TeamInGame,
  Tournament,
  Region,
  Round,
} from "./types";
import { TOURNAMENT_DATES_2026, ROUND_NAMES, BRACKET_SEED_ORDER } from "./constants";

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball";

/**
 * Fetch tournament scoreboard data from ESPN for all tournament dates.
 * Combines multiple date fetches into a single set of events.
 */
export async function fetchTournamentData(): Promise<ESPNEvent[]> {
  const allEvents: ESPNEvent[] = [];
  const seenIds = new Set<string>();

  // Fetch all tournament dates in parallel
  const responses = await Promise.allSettled(
    TOURNAMENT_DATES_2026.map(async (date) => {
      const url = `${ESPN_BASE}/scoreboard?groups=50&limit=100&dates=${date}`;
      const res = await fetch(url, { next: { revalidate: 120 } });
      if (!res.ok) return null;
      return res.json() as Promise<ESPNScoreboardResponse>;
    })
  );

  for (const result of responses) {
    if (result.status === "fulfilled" && result.value) {
      for (const event of result.value.events) {
        // Filter to NCAA tournament games only
        const comp = event.competitions?.[0];
        const headline = comp?.notes?.[0]?.headline ?? "";
        if (
          headline.includes("NCAA") &&
          headline.includes("Championship") &&
          !seenIds.has(event.id)
        ) {
          seenIds.add(event.id);
          allEvents.push(event);
        }
      }
    }
  }

  return allEvents;
}

/**
 * Parse region and round from ESPN note headline.
 * Format: "NCAA Men's Basketball Championship - South Region - 1st Round"
 */
function parseHeadline(headline: string): { region: string; roundName: string } | null {
  const parts = headline.split(" - ");
  if (parts.length < 3) {
    // Could be Final Four / Championship (no region)
    if (headline.includes("Final Four")) {
      return { region: "Final Four", roundName: "Final Four" };
    }
    if (headline.includes("Championship") || headline.includes("National Championship")) {
      return { region: "Championship", roundName: "Championship" };
    }
    return null;
  }
  return {
    region: parts[1].replace(" Region", "").trim(),
    roundName: parts[2].trim(),
  };
}

/**
 * Map round name string to round number.
 */
function roundNameToNumber(name: string): number {
  const normalized = name.toLowerCase();
  if (normalized.includes("first four")) return 0;
  if (normalized.includes("1st round") || normalized.includes("first round")) return 1;
  if (normalized.includes("2nd round") || normalized.includes("second round")) return 2;
  if (normalized.includes("sweet 16") || normalized.includes("sweet sixteen")) return 3;
  if (normalized.includes("elite eight") || normalized.includes("elite 8")) return 4;
  if (normalized.includes("final four")) return 5;
  if (normalized.includes("championship") || normalized.includes("national")) return 6;
  return 1;
}

/**
 * Parse an ESPN event into our Matchup type.
 */
function parseMatchup(event: ESPNEvent): Matchup | null {
  const comp = event.competitions?.[0];
  if (!comp) return null;

  const headline = comp.notes?.[0]?.headline ?? "";
  const parsed = parseHeadline(headline);
  if (!parsed) return null;

  const statusName = event.status?.type?.name ?? "STATUS_SCHEDULED";
  let status: "pre" | "in" | "post" = "pre";
  if (statusName === "STATUS_IN_PROGRESS") status = "in";
  else if (statusName === "STATUS_FINAL") status = "post";

  const teams: [TeamInGame | null, TeamInGame | null] = [null, null];
  const scores: [number, number] = [0, 0];

  for (let i = 0; i < comp.competitors.length && i < 2; i++) {
    const c = comp.competitors[i];
    // Use location (school name, e.g. "Arizona") or shortDisplayName as fallback.
    // c.team.name is the mascot only (e.g. "Wildcats") — not suitable for display.
    const teamName = c.team.location ?? c.team.shortDisplayName ?? c.team.displayName ?? c.team.name;
    teams[i] = {
      name: teamName,
      abbreviation: c.team.abbreviation,
      seed: c.curatedRank?.current ?? 0,
      logo: c.team.logo ?? "",
      record: c.records?.[0]?.summary ?? "",
      color: c.team.color ? `#${c.team.color}` : "#666",
      id: c.team.id,
    };
    scores[i] = parseInt(c.score ?? "0", 10);
  }

  let winner: 0 | 1 | null = null;
  if (status === "post") {
    winner = scores[0] > scores[1] ? 0 : 1;
  }

  const broadcast =
    comp.geoBroadcasts?.[0]?.media?.shortName ??
    comp.broadcasts?.[0]?.names?.[0] ??
    null;

  return {
    gameId: event.id,
    status,
    startTime: event.date,
    venue: comp.venue?.fullName ?? null,
    city: comp.venue?.address?.city ?? null,
    state: comp.venue?.address?.state ?? null,
    broadcast,
    teams,
    score: status !== "pre" ? scores : null,
    winner,
    region: parsed.region,
    roundNumber: roundNameToNumber(parsed.roundName),
    bracketPosition: 0, // will be set during bracket building
  };
}

/**
 * Build a full Tournament structure from ESPN events.
 * Creates placeholder matchups for future rounds that haven't been scheduled yet.
 */
export function buildTournament(events: ESPNEvent[]): Tournament {
  const matchups = events
    .map(parseMatchup)
    .filter((m): m is Matchup => m !== null);

  // Group by region
  const regionMap: Record<string, Matchup[]> = {};
  const finalFourGames: Matchup[] = [];
  let championship: Matchup | null = null;

  for (const m of matchups) {
    if (m.roundNumber === 6) {
      championship = m;
    } else if (m.roundNumber === 5) {
      finalFourGames.push(m);
    } else {
      if (!regionMap[m.region]) regionMap[m.region] = [];
      regionMap[m.region].push(m);
    }
  }

  // Build regions with rounds
  const regions: Region[] = Object.entries(regionMap).map(([name, games]) => {
    const roundMap: Record<number, Matchup[]> = {};
    for (const g of games) {
      if (!roundMap[g.roundNumber]) roundMap[g.roundNumber] = [];
      roundMap[g.roundNumber].push(g);
    }

    // Create rounds 1-4, filling with placeholders if needed
    const rounds: Round[] = [];
    for (let r = 1; r <= 4; r++) {
      const expectedGames = r === 1 ? 8 : r === 2 ? 4 : r === 3 ? 2 : 1;
      const existingGames = roundMap[r] ?? [];

      // Assign bracket positions
      existingGames.forEach((g, i) => {
        g.bracketPosition = i;
      });

      // Fill with placeholders if we don't have enough games
      const gamesList = [...existingGames];
      while (gamesList.length < expectedGames) {
        gamesList.push(createPlaceholder(name, r, gamesList.length));
      }

      rounds.push({
        name: ROUND_NAMES[r] ?? `Round ${r}`,
        number: r,
        matchups: gamesList,
      });
    }

    return { name, rounds };
  });

  // If we have no region data yet, create placeholder regions
  if (regions.length === 0) {
    const placeholderRegions = ["South", "East", "Midwest", "West"];
    for (const name of placeholderRegions) {
      const rounds: Round[] = [];
      for (let r = 1; r <= 4; r++) {
        const expectedGames = r === 1 ? 8 : r === 2 ? 4 : r === 3 ? 2 : 1;
        const gamesList: Matchup[] = [];
        for (let i = 0; i < expectedGames; i++) {
          gamesList.push(createPlaceholder(name, r, i));
        }
        rounds.push({
          name: ROUND_NAMES[r] ?? `Round ${r}`,
          number: r,
          matchups: gamesList,
        });
      }
      regions.push({ name, rounds });
    }
  }

  // Fill Final Four placeholders
  while (finalFourGames.length < 2) {
    finalFourGames.push(createPlaceholder("Final Four", 5, finalFourGames.length));
  }

  if (!championship) {
    championship = createPlaceholder("Championship", 6, 0);
  }

  return {
    regions,
    finalFour: finalFourGames,
    championship,
    lastUpdated: new Date().toISOString(),
  };
}

function createPlaceholder(region: string, roundNumber: number, position: number): Matchup {
  return {
    gameId: `placeholder-${region}-${roundNumber}-${position}`,
    status: "pre",
    startTime: null,
    venue: null,
    city: null,
    state: null,
    broadcast: null,
    teams: [null, null],
    score: null,
    winner: null,
    region,
    roundNumber,
    bracketPosition: position,
  };
}
