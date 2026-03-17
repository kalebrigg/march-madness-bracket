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
    const url = `${ODDS_API_BASE}/odds?regions=us&markets=h2h,spreads&oddsFormat=american&bookmakers=draftkings,fanduel,betmgm&apiKey=${apiKey}`;
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
  // Check alias map first (handles full-name → ESPN-name mappings)
  if (TEAM_NAME_ALIASES[name]) return TEAM_NAME_ALIASES[name];

  // Strip mascot suffixes (multi-word first, then single-word).
  // This is a broad fallback so any team not in the alias map still normalizes.
  return name
    // Multi-word mascots (must come before single-word pass)
    .replace(/\s+(Rainbow Warriors|Horned Frogs|Red Storm|Fighting Illini|Blue Devils|Tar Heels|Crimson Tide|Golden Gophers|Golden Eagles|Golden Bears|Golden Flashes|Golden Hurricane|Red Raiders|Fighting Irish|Sun Devils|Demon Deacons|Wolf Pack|Blue Hens|Mean Green|Red Flash|Flying Dutchmen|Mountain Hawks|Blue Raiders|Green Wave|Purple Aces|Silver Hawks|Runnin Rebels|Running Rebels|Blazing Trails)$/i, "")
    // Single-word mascots
    .replace(/\s+(Wildcats|Bulldogs|Tigers|Bears|Eagles|Hawks|Huskies|Mountaineers|Wolverines|Spartans|Buckeyes|Jayhawks|Badgers|Hawkeyes|Boilermakers|Orange|Longhorns|Aggies|Cowboys|Sooners|Razorbacks|Rebels|Commodores|Gamecocks|Bruins|Trojans|Beavers|Ducks|Buffaloes|Utes|Cougars|Hoosiers|Illini|Cornhuskers|Cyclones|Mustangs|Friars|Gaels|Zags|Seminoles|Hurricanes|Cavaliers|Hokies|Terrapins|Volunteers|Panthers|Cardinals|Rams|Wolfpack|Bison|Pride|Sharks|Vandals|Broncos|Raiders|Lancers|Billikens|Owls|Paladins|Jaguars|Knights|Royals|Zips|Quakers|Saints|Flyers|Fliers|Bearcats|Musketeers|Ramblers|Miners|Penguins|Flames|Blazers|Racers|Shockers|Falcons|Lobos|Retrievers|Terriers|Pioneers|Matadors|Roadrunners|Lumberjacks|Bearkats|Warhawks|Vikings|Waves|Anteaters|Hatters|Rattlers|Peacocks|Buccaneers|Pirates|Chanticleers|Gorillas|Dolphins|Ospreys|Seawolves|Grizzlies|Highlanders|Engineers|Explorers|Firebirds|Seahawks|Mavericks|Roadrunners|Redhawks|Phoenix|Pilots|Toreros|Coyotes|Hilltoppers|Sycamores|Thunderbirds|Colonials|Spiders|Leopards|Bonnies|Crusaders|Midshipmen|Cardinal|Lopes|Racers|Monarchs|Minutemen|Dukes|Penguins|Vols|Tribe|Eagles|Braves|Bears|Flames|Gauchos|Banana Slugs|Normans|Zips|Scarlet|Matadors|Warriors|Tommies|Billikens|Retrievers|Salukis|Gators|Utes)$/i, "")
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

      // Explicitly match outcomes to home/away team by name.
      // Do NOT rely on array index — outcome order is not consistent across bookmakers.
      const findOutcome = (market: typeof h2h, teamName: string) => {
        const norm = normalizeTeamName(teamName).toLowerCase();
        return market.outcomes.find((o) => {
          const n = normalizeTeamName(o.name).toLowerCase();
          return n === norm || n.includes(norm) || norm.includes(n);
        });
      };

      const homeMoneyline = findOutcome(h2h, game.home_team)?.price ?? 0;
      const awayMoneyline = findOutcome(h2h, game.away_team)?.price ?? 0;

      // Parse spread market if available
      const spreadsMarket = bm.markets.find((m) => m.key === "spreads");
      let spread: [number, number] | undefined;
      let spreadJuice: [number, number] | undefined;
      if (spreadsMarket && spreadsMarket.outcomes.length >= 2) {
        const homeSpread = findOutcome(spreadsMarket, game.home_team);
        const awaySpread = findOutcome(spreadsMarket, game.away_team);
        if (homeSpread?.point !== undefined && awaySpread?.point !== undefined) {
          spread = [homeSpread.point, awaySpread.point];
          spreadJuice = [homeSpread.price, awaySpread.price];
        }
      }

      bookmakers.push({
        name: bm.title,
        moneyline: [homeMoneyline, awayMoneyline],
        ...(spread && { spread, spreadJuice }),
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
