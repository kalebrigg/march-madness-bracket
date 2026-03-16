import type { OddsAPIResponse, GameOdds, BookmakerOdds } from "./types";
import { TEAM_NAME_ALIASES } from "./constants";
import { americanToImplied, removeVig } from "./odds-utils";

const ODDS_API_BASE = "https://api.the-odds-api.com/v4/sports/basketball_ncaab";

/**
 * Fetch odds data from The Odds API.
 * Returns null if API key is not configured.
 */
export async function fetchOdds(): Promise<OddsAPIResponse[] | null> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `${ODDS_API_BASE}/odds?regions=us&markets=h2h&oddsFormat=american&apiKey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 1800 } }); // 30 min cache
    if (!res.ok) {
      console.error(`Odds API error: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch odds:", error);
    return null;
  }
}

/**
 * Normalize a team name for matching between ESPN and Odds API.
 */
function normalizeTeamName(name: string): string {
  // Check alias map first
  if (TEAM_NAME_ALIASES[name]) return TEAM_NAME_ALIASES[name];

  // Strip common suffixes like "Wildcats", "Bulldogs", etc.
  // Just use the school name
  return name
    .replace(/\s+(Wildcats|Bulldogs|Tigers|Bears|Eagles|Hawks|Huskies|Mountaineers|Wolverines|Spartans|Buckeyes|Jayhawks|Tar Heels|Blue Devils|Crimson Tide|Volunteers|Panthers|Cardinals|Seminoles|Hurricanes|Cavaliers|Hokies|Terrapins|Golden Gophers|Badgers|Hawkeyes|Boilermakers|Fighting Irish|Orange|Red Raiders|Longhorns|Aggies|Cowboys|Sooners|Razorbacks|Rebels|Commodores|Gamecocks|Bruins|Trojans|Beavers|Ducks|Sun Devils|Buffaloes|Utes|Cougars|Hoosiers|Illini|Cornhuskers|Cyclones|Mustangs|Friars|Gaels|Zags|Gonzaga Bulldogs)$/i, "")
    .trim();
}

/**
 * Parse Odds API response into our GameOdds format.
 */
export function parseOdds(oddsData: OddsAPIResponse[]): Map<string, GameOdds> {
  const oddsMap = new Map<string, GameOdds>();

  for (const game of oddsData) {
    const bookmakers: BookmakerOdds[] = [];

    for (const bm of game.bookmakers) {
      const h2h = bm.markets.find((m) => m.key === "h2h");
      if (!h2h || h2h.outcomes.length < 2) continue;

      // Outcomes are indexed by team name
      const team1Odds = h2h.outcomes[0]?.price ?? 0;
      const team2Odds = h2h.outcomes[1]?.price ?? 0;

      bookmakers.push({
        name: bm.title,
        moneyline: [team1Odds, team2Odds],
      });
    }

    // Calculate consensus implied probability (vig removed)
    let impliedProbability: [number, number] | null = null;
    if (bookmakers.length > 0) {
      let sum1 = 0;
      let sum2 = 0;
      for (const bm of bookmakers) {
        sum1 += americanToImplied(bm.moneyline[0]);
        sum2 += americanToImplied(bm.moneyline[1]);
      }
      const avg1 = sum1 / bookmakers.length;
      const avg2 = sum2 / bookmakers.length;
      impliedProbability = removeVig(avg1, avg2);
    }

    // Use normalized team names as key for matching
    const key = makeMatchKey(game.home_team, game.away_team);

    oddsMap.set(key, {
      gameId: game.id,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      bookmakers,
      impliedProbability,
    });
  }

  return oddsMap;
}

/**
 * Create a consistent match key from two team names for lookup.
 */
export function makeMatchKey(team1: string, team2: string): string {
  const n1 = normalizeTeamName(team1).toLowerCase();
  const n2 = normalizeTeamName(team2).toLowerCase();
  // Sort alphabetically for consistent keys regardless of order
  return [n1, n2].sort().join("|");
}
