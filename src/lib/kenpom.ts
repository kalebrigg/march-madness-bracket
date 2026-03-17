import type { KenPomRating, TeamKenPom } from "./types";

/**
 * Parse KenPom CSV data into TeamKenPom format.
 * Expected CSV columns: Rk, Team, Conf, W-L, NetRtg, ORtg, _, DRtg, _, AdjT, _, Luck
 */
export function parseKenPomCSV(csvText: string): TeamKenPom {
  const lines = csvText.trim().split("\n");
  const data: TeamKenPom = {};

  for (const line of lines) {
    // Skip empty lines or header lines
    if (!line.trim() || line.includes("Strength of Schedule") || line.includes("Rk,Team")) {
      continue;
    }

    const parts = line.split(",").map(p => p.trim());

    // Need at least: Rk, Team, Conf, W-L, NetRtg, ORtg, _, DRtg, _, AdjT, _, Luck
    if (parts.length < 12 || !parts[0].match(/^\d+$/)) {
      continue;
    }

    const rank = parseInt(parts[0]);
    const teamName = parts[1];
    const netRtg = parseFloat(parts[4]);
    const ORtg = parseFloat(parts[5]);
    const DRtg = parseFloat(parts[7]);
    const tempo = parseFloat(parts[9]);
    const luck = parseFloat(parts[11]);

    if (!isNaN(rank) && teamName) {
      data[teamName] = {
        rank,
        teamName,
        adjEM: netRtg,
        adjOffense: ORtg,
        adjDefense: DRtg,
        tempo,
        luck: isNaN(luck) ? 0 : luck,
      };
    }
  }

  return data;
}

/**
 * Common college basketball mascot names to strip for matching
 */
const MASCOT_NAMES = [
  "Wildcats", "Wolverines", "Red Raiders", "Longhorns", "Aggies", "Cowboys",
  "Sooners", "Razorbacks", "Rebels", "Commodores", "Gamecocks", "Bruins",
  "Trojans", "Beavers", "Ducks", "Sun Devils", "Buffaloes", "Utes", "Cougars",
  "Hoosiers", "Illini", "Cornhuskers", "Cyclones", "Mustangs", "Friars",
  "Gaels", "Zags", "Gonzaga", "Tigers", "Bears", "Eagles", "Hawks", "Huskies",
  "Mountaineers", "Spartans", "Buckeyes", "Jayhawks", "Tar Heels", "Blue Devils",
  "Crimson Tide", "Volunteers", "Panthers", "Cardinals", "Seminoles", "Hurricanes",
  "Cavaliers", "Hokies", "Terrapins", "Golden Gophers", "Badgers", "Hawkeyes",
  "Boilermakers", "Fighting Irish", "Orange", "Bulldogs", "Golden Eagles", "Patriots",
];

/**
 * Strip mascot name from team name to get school name
 * e.g., "Arizona Wildcats" → "Arizona", "Texas Tech Red Raiders" → "Texas Tech"
 */
function stripMascot(teamName: string): string {
  let cleanName = teamName.trim();

  // Remove numbered suffixes (e.g., "Duke 1" → "Duke")
  cleanName = cleanName.replace(/\s+\d+$/, "").trim();

  // Remove mascot names
  for (const mascot of MASCOT_NAMES) {
    const pattern = new RegExp(`\\s+${mascot}\\s*$`, "i");
    cleanName = cleanName.replace(pattern, "").trim();
  }

  return cleanName;
}

/**
 * Get KenPom rating for a specific team by name.
 * Searches the team name in the KenPom data with flexible matching.
 * Handles mascot names (e.g., "Arizona Wildcats" → matches "Arizona")
 */
export function getTeamKenPom(
  teamName: string,
  kenPomData: TeamKenPom | null
): KenPomRating | null {
  if (!kenPomData) return null;

  const lowerTeamName = teamName.toLowerCase();

  // Try exact match first
  if (kenPomData[teamName]) {
    return kenPomData[teamName];
  }

  // Try case-insensitive match
  for (const [key, value] of Object.entries(kenPomData)) {
    if (key.toLowerCase() === lowerTeamName) {
      return value;
    }
  }

  // Strip mascot and try again
  const cleanedName = stripMascot(teamName);
  const cleanedLower = cleanedName.toLowerCase();

  for (const [key, value] of Object.entries(kenPomData)) {
    if (key.toLowerCase() === cleanedLower) {
      return value;
    }
  }

  // Try partial match as fallback
  for (const [key, value] of Object.entries(kenPomData)) {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes(cleanedLower) ||
      cleanedLower.includes(lowerKey) ||
      lowerKey.includes(lowerTeamName) ||
      lowerTeamName.includes(lowerKey)
    ) {
      return value;
    }
  }

  return null;
}

/**
 * Real KenPom data parsed from CSV
 * Will be populated from the CSV file
 */
export const KENPOM_DATA: TeamKenPom = {
  "Duke": { rank: 1, teamName: "Duke", adjEM: 38.9, adjOffense: 128, adjDefense: 89.1, tempo: 65.3, luck: 0.049 },
  "Arizona": { rank: 2, teamName: "Arizona", adjEM: 37.66, adjOffense: 127.7, adjDefense: 90, tempo: 69.8, luck: 0.023 },
  "Michigan": { rank: 3, teamName: "Michigan", adjEM: 37.59, adjOffense: 126.6, adjDefense: 89, tempo: 70.9, luck: 0.045 },
  "Florida": { rank: 4, teamName: "Florida", adjEM: 33.79, adjOffense: 125.5, adjDefense: 91.7, tempo: 70.5, luck: -0.036 },
  "Houston": { rank: 5, teamName: "Houston", adjEM: 33.43, adjOffense: 124.9, adjDefense: 91.4, tempo: 63.3, luck: -0.006 },
  "Iowa St.": { rank: 6, teamName: "Iowa St.", adjEM: 32.42, adjOffense: 123.8, adjDefense: 91.4, tempo: 66.5, luck: -0.012 },
  "Illinois": { rank: 7, teamName: "Illinois", adjEM: 32.1, adjOffense: 131.2, adjDefense: 99.1, tempo: 65.5, luck: -0.05 },
  "Purdue": { rank: 8, teamName: "Purdue", adjEM: 31.2, adjOffense: 131.6, adjDefense: 100.4, tempo: 64.4, luck: -0.006 },
  "Michigan St.": { rank: 9, teamName: "Michigan St.", adjEM: 28.31, adjOffense: 123, adjDefense: 94.7, tempo: 66, luck: 0.005 },
  "Gonzaga": { rank: 10, teamName: "Gonzaga", adjEM: 28.1, adjOffense: 122, adjDefense: 93.9, tempo: 68.6, luck: 0.072 },
  "Connecticut": { rank: 11, teamName: "Connecticut", adjEM: 27.87, adjOffense: 122, adjDefense: 94.1, tempo: 64.4, luck: 0.055 },
  "Vanderbilt": { rank: 12, teamName: "Vanderbilt", adjEM: 27.51, adjOffense: 126.8, adjDefense: 99.3, tempo: 68.8, luck: 0.018 },
  "Virginia": { rank: 13, teamName: "Virginia", adjEM: 26.71, adjOffense: 122.5, adjDefense: 95.8, tempo: 65.7, luck: 0.056 },
  "Nebraska": { rank: 14, teamName: "Nebraska", adjEM: 26.16, adjOffense: 118.5, adjDefense: 92.4, tempo: 66.7, luck: 0.034 },
  "Arkansas": { rank: 15, teamName: "Arkansas", adjEM: 26.05, adjOffense: 127.7, adjDefense: 101.6, tempo: 71, luck: 0.051 },
  "Tennessee": { rank: 16, teamName: "Tennessee", adjEM: 26.02, adjOffense: 121.1, adjDefense: 95, tempo: 65, luck: -0.06 },
  "St. John's": { rank: 17, teamName: "St. John's", adjEM: 25.91, adjOffense: 120.1, adjDefense: 94.2, tempo: 69.6, luck: 0.061 },
  "Alabama": { rank: 18, teamName: "Alabama", adjEM: 25.72, adjOffense: 129, adjDefense: 103.3, tempo: 73.1, luck: 0.019 },
  "Louisville": { rank: 19, teamName: "Louisville", adjEM: 25.42, adjOffense: 124.1, adjDefense: 98.6, tempo: 69.6, luck: -0.02 },
  "Texas Tech": { rank: 20, teamName: "Texas Tech", adjEM: 25.22, adjOffense: 125, adjDefense: 99.8, tempo: 66.2, luck: 0.006 },
  "Kansas": { rank: 21, teamName: "Kansas", adjEM: 24.44, adjOffense: 118.3, adjDefense: 93.9, tempo: 67.6, luck: 0.053 },
};
