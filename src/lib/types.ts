// ── Tournament bracket structure ──

export interface Tournament {
  regions: Region[];
  finalFour: Matchup[];
  championship: Matchup | null;
  lastUpdated: string;
}

export interface Region {
  name: string; // "South", "East", "Midwest", "West"
  rounds: Round[];
}

export interface Round {
  name: string; // "First Round", "Second Round", "Sweet 16", "Elite Eight"
  number: number; // 1-4
  matchups: Matchup[];
}

export interface Matchup {
  gameId: string;
  status: "pre" | "in" | "post";
  startTime: string | null; // ISO 8601
  venue: string | null;
  city: string | null;
  state: string | null;
  broadcast: string | null;
  teams: [TeamInGame | null, TeamInGame | null];
  score: [number, number] | null;
  winner: 0 | 1 | null;
  region: string;
  roundNumber: number;
  bracketPosition: number; // position within the round for connector logic
}

export interface TeamInGame {
  name: string;
  abbreviation: string;
  seed: number;
  logo: string;
  record: string;
  color: string;
  id: string;
}

// ── Odds ──

export interface GameOdds {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: BookmakerOdds[];
  impliedProbability: [number, number] | null; // [team1, team2] true probability (vig removed)
}

export interface BookmakerOdds {
  name: string;
  moneyline: [number, number]; // [team1 odds, team2 odds] in American format
  spread?: [number, number]; // [team1 point spread, team2 point spread] e.g. [-13.5, 13.5]
  spreadJuice?: [number, number]; // [team1 juice, team2 juice] e.g. [-110, -110]
}

// ── Predictions ──

export interface Prediction {
  team1WinPct: number; // 0-1
  team2WinPct: number; // 0-1
  source: "seed-history" | "odds-implied" | "blended";
}

// ── KenPom Ratings ──

export interface KenPomRating {
  rank: number;
  teamName: string;
  adjEM: number;
  adjOffense: number;
  adjDefense: number;
  tempo: number;
  sosEM?: number;
  luck?: number;
  record?: string; // W-L from KenPom CSV, used when ESPN doesn't return records
}

export interface TeamKenPom {
  [teamName: string]: KenPomRating;
}

// ── ESPN API response shapes (partial) ──

export interface ESPNScoreboardResponse {
  events: ESPNEvent[];
}

export interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  competitions: ESPNCompetition[];
  status: {
    type: {
      name: string; // "STATUS_SCHEDULED" | "STATUS_IN_PROGRESS" | "STATUS_FINAL"
      description: string;
    };
    period: number;
    displayClock: string;
  };
}

export interface ESPNCompetition {
  id: string;
  venue: {
    fullName: string;
    address: {
      city: string;
      state: string;
    };
  };
  competitors: ESPNCompetitor[];
  broadcasts?: { names: string[] }[];
  geoBroadcasts?: {
    media: {
      shortName: string;
    };
  }[];
  notes?: {
    headline: string;
  }[];
}

export interface ESPNCompetitor {
  id: string;
  team: {
    id: string;
    name: string;           // mascot only, e.g. "Wildcats"
    displayName?: string;   // full name, e.g. "Arizona Wildcats"
    location?: string;      // school/city, e.g. "Arizona"
    shortDisplayName?: string; // e.g. "Arizona"
    abbreviation: string;
    logo: string;
    color?: string;
  };
  score: string;
  curatedRank?: {
    current: number;
  };
  records?: {
    summary: string;
  }[];
  homeAway: "home" | "away";
}

// ── Odds API response shapes ──

export interface OddsAPIResponse {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsAPIBookmaker[];
}

export interface OddsAPIBookmaker {
  key: string;
  title: string;
  markets: {
    key: string;
    outcomes: {
      name: string;
      price: number;
      point?: number; // present for spreads/totals markets
    }[];
  }[];
}
