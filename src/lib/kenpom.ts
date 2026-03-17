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
 * KenPom data for all 197 ranked teams (2025-26 season).
 * Parsed from KenPom CSV export. Columns: rank, adjEM, adjOffense, adjDefense, tempo, luck.
 * Team names match KenPom's format (school name only, no mascots).
 * Alternate name aliases are included for ESPN name matching.
 */
export const KENPOM_DATA: TeamKenPom = {
  "Duke": { rank: 1, teamName: "Duke", adjEM: 38.9, adjOffense: 128, adjDefense: 89.1, tempo: 65.3, luck: 0.049 },
  "Arizona": { rank: 2, teamName: "Arizona", adjEM: 37.66, adjOffense: 127.7, adjDefense: 90, tempo: 69.8, luck: 0.023 },
  "Michigan": { rank: 3, teamName: "Michigan", adjEM: 37.59, adjOffense: 126.6, adjDefense: 89, tempo: 70.9, luck: 0.045 },
  "Florida": { rank: 4, teamName: "Florida", adjEM: 33.79, adjOffense: 125.5, adjDefense: 91.7, tempo: 70.5, luck: -0.036 },
  "Houston": { rank: 5, teamName: "Houston", adjEM: 33.43, adjOffense: 124.9, adjDefense: 91.4, tempo: 63.3, luck: -0.006 },
  "Iowa St.": { rank: 6, teamName: "Iowa St.", adjEM: 32.42, adjOffense: 123.8, adjDefense: 91.4, tempo: 66.5, luck: -0.012 },
  "Iowa State": { rank: 6, teamName: "Iowa St.", adjEM: 32.42, adjOffense: 123.8, adjDefense: 91.4, tempo: 66.5, luck: -0.012 },
  "Illinois": { rank: 7, teamName: "Illinois", adjEM: 32.1, adjOffense: 131.2, adjDefense: 99.1, tempo: 65.5, luck: -0.05 },
  "Purdue": { rank: 8, teamName: "Purdue", adjEM: 31.2, adjOffense: 131.6, adjDefense: 100.4, tempo: 64.4, luck: -0.006 },
  "Michigan St.": { rank: 9, teamName: "Michigan St.", adjEM: 28.31, adjOffense: 123, adjDefense: 94.7, tempo: 66, luck: 0.005 },
  "Michigan State": { rank: 9, teamName: "Michigan St.", adjEM: 28.31, adjOffense: 123, adjDefense: 94.7, tempo: 66, luck: 0.005 },
  "Gonzaga": { rank: 10, teamName: "Gonzaga", adjEM: 28.1, adjOffense: 122, adjDefense: 93.9, tempo: 68.6, luck: 0.072 },
  "Connecticut": { rank: 11, teamName: "Connecticut", adjEM: 27.87, adjOffense: 122, adjDefense: 94.1, tempo: 64.4, luck: 0.055 },
  "UConn": { rank: 11, teamName: "Connecticut", adjEM: 27.87, adjOffense: 122, adjDefense: 94.1, tempo: 64.4, luck: 0.055 },
  "Vanderbilt": { rank: 12, teamName: "Vanderbilt", adjEM: 27.51, adjOffense: 126.8, adjDefense: 99.3, tempo: 68.8, luck: 0.018 },
  "Virginia": { rank: 13, teamName: "Virginia", adjEM: 26.71, adjOffense: 122.5, adjDefense: 95.8, tempo: 65.7, luck: 0.056 },
  "Nebraska": { rank: 14, teamName: "Nebraska", adjEM: 26.16, adjOffense: 118.5, adjDefense: 92.4, tempo: 66.7, luck: 0.034 },
  "Arkansas": { rank: 15, teamName: "Arkansas", adjEM: 26.05, adjOffense: 127.7, adjDefense: 101.6, tempo: 71, luck: 0.051 },
  "Tennessee": { rank: 16, teamName: "Tennessee", adjEM: 26.02, adjOffense: 121.1, adjDefense: 95, tempo: 65, luck: -0.06 },
  "St. John's": { rank: 17, teamName: "St. John's", adjEM: 25.91, adjOffense: 120.1, adjDefense: 94.2, tempo: 69.6, luck: 0.061 },
  "St. John's (NY)": { rank: 17, teamName: "St. John's", adjEM: 25.91, adjOffense: 120.1, adjDefense: 94.2, tempo: 69.6, luck: 0.061 },
  "Alabama": { rank: 18, teamName: "Alabama", adjEM: 25.72, adjOffense: 129, adjDefense: 103.3, tempo: 73.1, luck: 0.019 },
  "Louisville": { rank: 19, teamName: "Louisville", adjEM: 25.42, adjOffense: 124.1, adjDefense: 98.6, tempo: 69.6, luck: -0.02 },
  "Texas Tech": { rank: 20, teamName: "Texas Tech", adjEM: 25.22, adjOffense: 125, adjDefense: 99.8, tempo: 66.2, luck: 0.006 },
  "Kansas": { rank: 21, teamName: "Kansas", adjEM: 24.44, adjOffense: 118.3, adjDefense: 93.9, tempo: 67.6, luck: 0.053 },
  "Wisconsin": { rank: 22, teamName: "Wisconsin", adjEM: 23.39, adjOffense: 125.3, adjDefense: 102, tempo: 68.7, luck: 0.041 },
  "BYU": { rank: 23, teamName: "BYU", adjEM: 23.25, adjOffense: 125.5, adjDefense: 102.2, tempo: 69.9, luck: -0.017 },
  "Saint Mary's": { rank: 24, teamName: "Saint Mary's", adjEM: 23.07, adjOffense: 120.3, adjDefense: 97.2, tempo: 65.2, luck: 0.011 },
  "Saint Mary's (CA)": { rank: 24, teamName: "Saint Mary's", adjEM: 23.07, adjOffense: 120.3, adjDefense: 97.2, tempo: 65.2, luck: 0.011 },
  "Iowa": { rank: 25, teamName: "Iowa", adjEM: 22.44, adjOffense: 121.7, adjDefense: 99.3, tempo: 63, luck: -0.061 },
  "Ohio St.": { rank: 26, teamName: "Ohio St.", adjEM: 22.24, adjOffense: 124.3, adjDefense: 102.1, tempo: 66.1, luck: -0.031 },
  "Ohio State": { rank: 26, teamName: "Ohio St.", adjEM: 22.24, adjOffense: 124.3, adjDefense: 102.1, tempo: 66.1, luck: -0.031 },
  "UCLA": { rank: 27, teamName: "UCLA", adjEM: 21.67, adjOffense: 123.7, adjDefense: 102.1, tempo: 64.6, luck: 0.017 },
  "Kentucky": { rank: 28, teamName: "Kentucky", adjEM: 21.48, adjOffense: 120.5, adjDefense: 99, tempo: 68.3, luck: -0.019 },
  "North Carolina": { rank: 29, teamName: "North Carolina", adjEM: 20.84, adjOffense: 121.4, adjDefense: 100.5, tempo: 67.9, luck: 0.057 },
  "Utah St.": { rank: 30, teamName: "Utah St.", adjEM: 20.76, adjOffense: 122.1, adjDefense: 101.4, tempo: 67.7, luck: 0.065 },
  "Utah State": { rank: 30, teamName: "Utah St.", adjEM: 20.76, adjOffense: 122.1, adjDefense: 101.4, tempo: 67.7, luck: 0.065 },
  "Miami FL": { rank: 31, teamName: "Miami FL", adjEM: 20.68, adjOffense: 121.4, adjDefense: 100.7, tempo: 67.6, luck: 0.021 },
  "Miami": { rank: 31, teamName: "Miami FL", adjEM: 20.68, adjOffense: 121.4, adjDefense: 100.7, tempo: 67.6, luck: 0.021 },
  "Miami (FL)": { rank: 31, teamName: "Miami FL", adjEM: 20.68, adjOffense: 121.4, adjDefense: 100.7, tempo: 67.6, luck: 0.021 },
  "Georgia": { rank: 32, teamName: "Georgia", adjEM: 20.48, adjOffense: 124.7, adjDefense: 104.2, tempo: 71.4, luck: -0.005 },
  "Villanova": { rank: 33, teamName: "Villanova", adjEM: 19.97, adjOffense: 120.4, adjDefense: 100.4, tempo: 65.2, luck: 0.067 },
  "N.C. State": { rank: 34, teamName: "N.C. State", adjEM: 19.6, adjOffense: 124.1, adjDefense: 104.5, tempo: 69.1, luck: -0.029 },
  "NC State": { rank: 34, teamName: "N.C. State", adjEM: 19.6, adjOffense: 124.1, adjDefense: 104.5, tempo: 69.1, luck: -0.029 },
  "North Carolina State": { rank: 34, teamName: "N.C. State", adjEM: 19.6, adjOffense: 124.1, adjDefense: 104.5, tempo: 69.1, luck: -0.029 },
  "Santa Clara": { rank: 35, teamName: "Santa Clara", adjEM: 19.4, adjOffense: 123.6, adjDefense: 104.2, tempo: 69.2, luck: 0.015 },
  "Clemson": { rank: 36, teamName: "Clemson", adjEM: 19.24, adjOffense: 116.5, adjDefense: 97.3, tempo: 64.2, luck: 0.011 },
  "Texas": { rank: 37, teamName: "Texas", adjEM: 19.03, adjOffense: 125, adjDefense: 105.9, tempo: 66.9, luck: -0.083 },
  "Auburn": { rank: 38, teamName: "Auburn", adjEM: 19.02, adjOffense: 124.8, adjDefense: 105.8, tempo: 67.2, luck: -0.053 },
  "Texas A&M": { rank: 39, teamName: "Texas A&M", adjEM: 18.67, adjOffense: 119.7, adjDefense: 101, tempo: 70.5, luck: -0.002 },
  "Oklahoma": { rank: 40, teamName: "Oklahoma", adjEM: 18.37, adjOffense: 124.2, adjDefense: 105.8, tempo: 66.2, luck: -0.07 },
  "Saint Louis": { rank: 41, teamName: "Saint Louis", adjEM: 18.32, adjOffense: 119.5, adjDefense: 101.2, tempo: 71, luck: 0.03 },
  "SMU": { rank: 42, teamName: "SMU", adjEM: 18.09, adjOffense: 122.9, adjDefense: 104.8, tempo: 68.5, luck: -0.043 },
  "TCU": { rank: 43, teamName: "TCU", adjEM: 17.59, adjOffense: 115.4, adjDefense: 97.8, tempo: 67.7, luck: 0.004 },
  "Cincinnati": { rank: 44, teamName: "Cincinnati", adjEM: 17.49, adjOffense: 111.2, adjDefense: 93.7, tempo: 67.5, luck: -0.073 },
  "VCU": { rank: 45, teamName: "VCU", adjEM: 17.21, adjOffense: 119.9, adjDefense: 102.7, tempo: 68.5, luck: -0.007 },
  "Virginia Commonwealth": { rank: 45, teamName: "VCU", adjEM: 17.21, adjOffense: 119.9, adjDefense: 102.7, tempo: 68.5, luck: -0.007 },
  "Indiana": { rank: 46, teamName: "Indiana", adjEM: 17.18, adjOffense: 120.3, adjDefense: 103.2, tempo: 66.1, luck: -0.041 },
  "South Florida": { rank: 47, teamName: "South Florida", adjEM: 16.39, adjOffense: 117.3, adjDefense: 100.9, tempo: 71.5, luck: -0.026 },
  "USF": { rank: 47, teamName: "South Florida", adjEM: 16.39, adjOffense: 117.3, adjDefense: 100.9, tempo: 71.5, luck: -0.026 },
  "San Diego St.": { rank: 48, teamName: "San Diego St.", adjEM: 16.39, adjOffense: 113.2, adjDefense: 96.9, tempo: 68.7, luck: 0.015 },
  "San Diego State": { rank: 48, teamName: "San Diego St.", adjEM: 16.39, adjOffense: 113.2, adjDefense: 96.9, tempo: 68.7, luck: 0.015 },
  "Baylor": { rank: 49, teamName: "Baylor", adjEM: 16, adjOffense: 122.9, adjDefense: 106.9, tempo: 67.8, luck: -0.086 },
  "New Mexico": { rank: 50, teamName: "New Mexico", adjEM: 15.81, adjOffense: 117.1, adjDefense: 101.3, tempo: 69.8, luck: -0.035 },
  "Seton Hall": { rank: 51, teamName: "Seton Hall", adjEM: 15.71, adjOffense: 110.5, adjDefense: 94.8, tempo: 65.1, luck: -0.033 },
  "Missouri": { rank: 52, teamName: "Missouri", adjEM: 15.39, adjOffense: 119.5, adjDefense: 104.1, tempo: 66.2, luck: 0.041 },
  "Washington": { rank: 53, teamName: "Washington", adjEM: 15.12, adjOffense: 117.2, adjDefense: 102.1, tempo: 67.1, luck: -0.101 },
  "UCF": { rank: 54, teamName: "UCF", adjEM: 15.04, adjOffense: 120.5, adjDefense: 105.4, tempo: 69.2, luck: 0.097 },
  "Central Florida": { rank: 54, teamName: "UCF", adjEM: 15.04, adjOffense: 120.5, adjDefense: 105.4, tempo: 69.2, luck: 0.097 },
  "Virginia Tech": { rank: 55, teamName: "Virginia Tech", adjEM: 13.69, adjOffense: 117.2, adjDefense: 103.6, tempo: 67, luck: -0.01 },
  "Florida St.": { rank: 56, teamName: "Florida St.", adjEM: 13.48, adjOffense: 118.4, adjDefense: 104.9, tempo: 70.4, luck: -0.006 },
  "Florida State": { rank: 56, teamName: "Florida St.", adjEM: 13.48, adjOffense: 118.4, adjDefense: 104.9, tempo: 70.4, luck: -0.006 },
  "Northwestern": { rank: 57, teamName: "Northwestern", adjEM: 13.41, adjOffense: 117.5, adjDefense: 104.1, tempo: 65, luck: -0.079 },
  "Stanford": { rank: 58, teamName: "Stanford", adjEM: 13.37, adjOffense: 117.1, adjDefense: 103.7, tempo: 66.7, luck: 0.03 },
  "West Virginia": { rank: 59, teamName: "West Virginia", adjEM: 13.27, adjOffense: 110, adjDefense: 96.7, tempo: 62.2, luck: -0.033 },
  "LSU": { rank: 60, teamName: "LSU", adjEM: 13.23, adjOffense: 119.8, adjDefense: 106.6, tempo: 66.6, luck: -0.092 },
  "Louisiana State": { rank: 60, teamName: "LSU", adjEM: 13.23, adjOffense: 119.8, adjDefense: 106.6, tempo: 66.6, luck: -0.092 },
  "Grand Canyon": { rank: 61, teamName: "Grand Canyon", adjEM: 13.19, adjOffense: 111, adjDefense: 97.8, tempo: 68, luck: -0.068 },
  "Boise St.": { rank: 62, teamName: "Boise St.", adjEM: 13.18, adjOffense: 117, adjDefense: 103.8, tempo: 65.7, luck: 0.028 },
  "Boise State": { rank: 62, teamName: "Boise St.", adjEM: 13.18, adjOffense: 117, adjDefense: 103.8, tempo: 65.7, luck: 0.028 },
  "Tulsa": { rank: 63, teamName: "Tulsa", adjEM: 12.97, adjOffense: 121.2, adjDefense: 108.2, tempo: 67.9, luck: 0.021 },
  "Akron": { rank: 64, teamName: "Akron", adjEM: 12.8, adjOffense: 118.8, adjDefense: 106, tempo: 70.3, luck: 0.018 },
  "Mississippi": { rank: 65, teamName: "Mississippi", adjEM: 12.62, adjOffense: 114.1, adjDefense: 101.4, tempo: 66.3, luck: -0.07 },
  "Ole Miss": { rank: 65, teamName: "Mississippi", adjEM: 12.62, adjOffense: 114.1, adjDefense: 101.4, tempo: 66.3, luck: -0.07 },
  "Oklahoma St.": { rank: 66, teamName: "Oklahoma St.", adjEM: 12.58, adjOffense: 120.1, adjDefense: 107.5, tempo: 72, luck: 0.052 },
  "Oklahoma State": { rank: 66, teamName: "Oklahoma St.", adjEM: 12.58, adjOffense: 120.1, adjDefense: 107.5, tempo: 72, luck: 0.052 },
  "Arizona St.": { rank: 67, teamName: "Arizona St.", adjEM: 12.52, adjOffense: 115.8, adjDefense: 103.2, tempo: 69.2, luck: 0.062 },
  "Arizona State": { rank: 67, teamName: "Arizona St.", adjEM: 12.52, adjOffense: 115.8, adjDefense: 103.2, tempo: 69.2, luck: 0.062 },
  "McNeese": { rank: 68, teamName: "McNeese", adjEM: 12.48, adjOffense: 114.3, adjDefense: 101.8, tempo: 66.2, luck: 0.084 },
  "McNeese St.": { rank: 68, teamName: "McNeese", adjEM: 12.48, adjOffense: 114.3, adjDefense: 101.8, tempo: 66.2, luck: 0.084 },
  "Belmont": { rank: 69, teamName: "Belmont", adjEM: 12.26, adjOffense: 120.7, adjDefense: 108.4, tempo: 68.9, luck: 0.035 },
  "Colorado": { rank: 70, teamName: "Colorado", adjEM: 12.11, adjOffense: 118.9, adjDefense: 106.8, tempo: 68.7, luck: 0.024 },
  "Providence": { rank: 71, teamName: "Providence", adjEM: 11.81, adjOffense: 121.1, adjDefense: 109.3, tempo: 71.2, luck: -0.09 },
  "Northern Iowa": { rank: 72, teamName: "Northern Iowa", adjEM: 11.81, adjOffense: 110, adjDefense: 98.2, tempo: 62.3, luck: -0.07 },
  "California": { rank: 73, teamName: "California", adjEM: 11.43, adjOffense: 114.1, adjDefense: 102.6, tempo: 68, luck: 0.044 },
  "Cal": { rank: 73, teamName: "California", adjEM: 11.43, adjOffense: 114.1, adjDefense: 102.6, tempo: 68, luck: 0.044 },
  "Wake Forest": { rank: 74, teamName: "Wake Forest", adjEM: 11.39, adjOffense: 117, adjDefense: 105.6, tempo: 68.1, luck: -0.022 },
  "Nevada": { rank: 75, teamName: "Nevada", adjEM: 11.3, adjOffense: 115.7, adjDefense: 104.4, tempo: 66.1, luck: 0.012 },
  "Creighton": { rank: 76, teamName: "Creighton", adjEM: 11.01, adjOffense: 116.2, adjDefense: 105.2, tempo: 67.5, luck: -0.029 },
  "Minnesota": { rank: 77, teamName: "Minnesota", adjEM: 10.91, adjOffense: 114.6, adjDefense: 103.7, tempo: 62.5, luck: -0.061 },
  "Dayton": { rank: 78, teamName: "Dayton", adjEM: 10.91, adjOffense: 110.6, adjDefense: 99.7, tempo: 66.9, luck: 0.043 },
  "Georgetown": { rank: 79, teamName: "Georgetown", adjEM: 10.89, adjOffense: 114.6, adjDefense: 103.7, tempo: 66.2, luck: -0.049 },
  "USC": { rank: 80, teamName: "USC", adjEM: 10.81, adjOffense: 113.5, adjDefense: 102.7, tempo: 70.6, luck: 0.068 },
  "Southern California": { rank: 80, teamName: "USC", adjEM: 10.81, adjOffense: 113.5, adjDefense: 102.7, tempo: 70.6, luck: 0.068 },
  "Yale": { rank: 81, teamName: "Yale", adjEM: 10.65, adjOffense: 121.1, adjDefense: 110.4, tempo: 64.4, luck: 0.045 },
  "Wichita St.": { rank: 82, teamName: "Wichita St.", adjEM: 9.78, adjOffense: 112.6, adjDefense: 102.8, tempo: 66.1, luck: -0.038 },
  "Wichita State": { rank: 82, teamName: "Wichita St.", adjEM: 9.78, adjOffense: 112.6, adjDefense: 102.8, tempo: 66.1, luck: -0.038 },
  "Syracuse": { rank: 83, teamName: "Syracuse", adjEM: 9.74, adjOffense: 114.6, adjDefense: 104.9, tempo: 67.4, luck: -0.046 },
  "Marquette": { rank: 84, teamName: "Marquette", adjEM: 9.66, adjOffense: 111.8, adjDefense: 102.2, tempo: 68.9, luck: -0.111 },
  "George Washington": { rank: 85, teamName: "George Washington", adjEM: 9.64, adjOffense: 117.6, adjDefense: 108, tempo: 69.1, luck: -0.141 },
  "GW": { rank: 85, teamName: "George Washington", adjEM: 9.64, adjOffense: 117.6, adjDefense: 108, tempo: 69.1, luck: -0.141 },
  "Butler": { rank: 86, teamName: "Butler", adjEM: 9.49, adjOffense: 116.1, adjDefense: 106.6, tempo: 68.7, luck: -0.031 },
  "Hofstra": { rank: 87, teamName: "Hofstra", adjEM: 9.49, adjOffense: 114.6, adjDefense: 105.1, tempo: 64.7, luck: -0.052 },
  "Colorado St.": { rank: 88, teamName: "Colorado St.", adjEM: 9.49, adjOffense: 118.9, adjDefense: 109.4, tempo: 63, luck: 0.04 },
  "Colorado State": { rank: 88, teamName: "Colorado St.", adjEM: 9.49, adjOffense: 118.9, adjDefense: 109.4, tempo: 63, luck: 0.04 },
  "Notre Dame": { rank: 89, teamName: "Notre Dame", adjEM: 8.88, adjOffense: 115.5, adjDefense: 106.6, tempo: 65.9, luck: -0.059 },
  "Utah Valley": { rank: 90, teamName: "Utah Valley", adjEM: 8.82, adjOffense: 112.8, adjDefense: 104, tempo: 68.7, luck: 0.033 },
  "Stephen F. Austin": { rank: 91, teamName: "Stephen F. Austin", adjEM: 8.43, adjOffense: 112.6, adjDefense: 104.2, tempo: 65.7, luck: 0.029 },
  "SFA": { rank: 91, teamName: "Stephen F. Austin", adjEM: 8.43, adjOffense: 112.6, adjDefense: 104.2, tempo: 65.7, luck: 0.029 },
  "High Point": { rank: 92, teamName: "High Point", adjEM: 8.4, adjOffense: 117, adjDefense: 108.6, tempo: 69.9, luck: 0.048 },
  "Miami OH": { rank: 93, teamName: "Miami OH", adjEM: 8.26, adjOffense: 116.8, adjDefense: 108.5, tempo: 69.9, luck: 0.099 },
  "Miami (OH)": { rank: 93, teamName: "Miami OH", adjEM: 8.26, adjOffense: 116.8, adjDefense: 108.5, tempo: 69.9, luck: 0.099 },
  "Pittsburgh": { rank: 94, teamName: "Pittsburgh", adjEM: 7.6, adjOffense: 113.7, adjDefense: 106.1, tempo: 63.5, luck: -0.067 },
  "Pitt": { rank: 94, teamName: "Pittsburgh", adjEM: 7.6, adjOffense: 113.7, adjDefense: 106.1, tempo: 63.5, luck: -0.067 },
  "South Carolina": { rank: 95, teamName: "South Carolina", adjEM: 7.54, adjOffense: 112.5, adjDefense: 105, tempo: 66.3, luck: -0.062 },
  "George Mason": { rank: 96, teamName: "George Mason", adjEM: 7.5, adjOffense: 113.1, adjDefense: 105.6, tempo: 63.3, luck: 0.054 },
  "Xavier": { rank: 97, teamName: "Xavier", adjEM: 7.47, adjOffense: 116.9, adjDefense: 109.4, tempo: 70.2, luck: 0.016 },
  "Wyoming": { rank: 98, teamName: "Wyoming", adjEM: 7.4, adjOffense: 115.1, adjDefense: 107.7, tempo: 66, luck: -0.024 },
  "Oregon": { rank: 99, teamName: "Oregon", adjEM: 7.03, adjOffense: 111.6, adjDefense: 104.6, tempo: 65.9, luck: -0.036 },
  "Mississippi St.": { rank: 100, teamName: "Mississippi St.", adjEM: 7, adjOffense: 112.7, adjDefense: 105.7, tempo: 69.6, luck: -0.001 },
  "Mississippi State": { rank: 100, teamName: "Mississippi St.", adjEM: 7, adjOffense: 112.7, adjDefense: 105.7, tempo: 69.6, luck: -0.001 },
  "Kansas St.": { rank: 101, teamName: "Kansas St.", adjEM: 6.98, adjOffense: 113.2, adjDefense: 106.3, tempo: 72.6, luck: -0.074 },
  "Kansas State": { rank: 101, teamName: "Kansas St.", adjEM: 6.98, adjOffense: 113.2, adjDefense: 106.3, tempo: 72.6, luck: -0.074 },
  "DePaul": { rank: 102, teamName: "DePaul", adjEM: 6.83, adjOffense: 107.1, adjDefense: 100.3, tempo: 66.2, luck: -0.014 },
  "Illinois St.": { rank: 103, teamName: "Illinois St.", adjEM: 6.66, adjOffense: 110.5, adjDefense: 103.9, tempo: 66.7, luck: -0.009 },
  "Illinois State": { rank: 103, teamName: "Illinois St.", adjEM: 6.66, adjOffense: 110.5, adjDefense: 103.9, tempo: 66.7, luck: -0.009 },
  "UC Irvine": { rank: 104, teamName: "UC Irvine", adjEM: 6.21, adjOffense: 104.9, adjDefense: 98.7, tempo: 68.2, luck: -0.016 },
  "Illinois Chicago": { rank: 105, teamName: "Illinois Chicago", adjEM: 6.16, adjOffense: 110.4, adjDefense: 104.3, tempo: 66.3, luck: -0.061 },
  "UIC": { rank: 105, teamName: "Illinois Chicago", adjEM: 6.16, adjOffense: 110.4, adjDefense: 104.3, tempo: 66.3, luck: -0.061 },
  "Cal Baptist": { rank: 106, teamName: "Cal Baptist", adjEM: 5.99, adjOffense: 107.9, adjDefense: 101.9, tempo: 65.8, luck: 0.091 },
  "California Baptist": { rank: 106, teamName: "Cal Baptist", adjEM: 5.99, adjOffense: 107.9, adjDefense: 101.9, tempo: 65.8, luck: 0.091 },
  "UNLV": { rank: 107, teamName: "UNLV", adjEM: 5.97, adjOffense: 115, adjDefense: 109.1, tempo: 69.8, luck: 0.003 },
  "Hawaii": { rank: 108, teamName: "Hawaii", adjEM: 5.97, adjOffense: 107.1, adjDefense: 101.2, tempo: 69.7, luck: 0.038 },
  "St. Thomas": { rank: 109, teamName: "St. Thomas", adjEM: 5.88, adjOffense: 114, adjDefense: 108.1, tempo: 68.2, luck: -0.034 },
  "St. Thomas (MN)": { rank: 109, teamName: "St. Thomas", adjEM: 5.88, adjOffense: 114, adjDefense: 108.1, tempo: 68.2, luck: -0.034 },
  "UNC Wilmington": { rank: 110, teamName: "UNC Wilmington", adjEM: 5.79, adjOffense: 111.9, adjDefense: 106.1, tempo: 65.1, luck: 0.028 },
  "UNCW": { rank: 110, teamName: "UNC Wilmington", adjEM: 5.79, adjOffense: 111.9, adjDefense: 106.1, tempo: 65.1, luck: 0.028 },
  "Sam Houston St.": { rank: 111, teamName: "Sam Houston St.", adjEM: 5.56, adjOffense: 113.5, adjDefense: 107.9, tempo: 70, luck: -0.007 },
  "Sam Houston": { rank: 111, teamName: "Sam Houston St.", adjEM: 5.56, adjOffense: 113.5, adjDefense: 107.9, tempo: 70, luck: -0.007 },
  "Pacific": { rank: 112, teamName: "Pacific", adjEM: 5.42, adjOffense: 110.7, adjDefense: 105.3, tempo: 64.3, luck: -0.02 },
  "North Dakota St.": { rank: 113, teamName: "North Dakota St.", adjEM: 5.13, adjOffense: 111.7, adjDefense: 106.6, tempo: 66.3, luck: 0.04 },
  "North Dakota State": { rank: 113, teamName: "North Dakota St.", adjEM: 5.13, adjOffense: 111.7, adjDefense: 106.6, tempo: 66.3, luck: 0.04 },
  "Davidson": { rank: 114, teamName: "Davidson", adjEM: 4.94, adjOffense: 109.6, adjDefense: 104.7, tempo: 63.6, luck: 0.033 },
  "UT Rio Grande Valley": { rank: 115, teamName: "UT Rio Grande Valley", adjEM: 4.57, adjOffense: 111, adjDefense: 106.4, tempo: 66.3, luck: -0.056 },
  "UTRGV": { rank: 115, teamName: "UT Rio Grande Valley", adjEM: 4.57, adjOffense: 111, adjDefense: 106.4, tempo: 66.3, luck: -0.056 },
  "Saint Joseph's": { rank: 116, teamName: "Saint Joseph's", adjEM: 4.56, adjOffense: 107.3, adjDefense: 102.7, tempo: 68, luck: 0.088 },
  "St. Joseph's": { rank: 116, teamName: "Saint Joseph's", adjEM: 4.56, adjOffense: 107.3, adjDefense: 102.7, tempo: 68, luck: 0.088 },
  "Southern Illinois": { rank: 117, teamName: "Southern Illinois", adjEM: 4.55, adjOffense: 103.8, adjDefense: 99.2, tempo: 68.9, luck: -0.094 },
  "SIU": { rank: 117, teamName: "Southern Illinois", adjEM: 4.55, adjOffense: 103.8, adjDefense: 99.2, tempo: 68.9, luck: -0.094 },
  "UC San Diego": { rank: 118, teamName: "UC San Diego", adjEM: 4.53, adjOffense: 107.8, adjDefense: 103.3, tempo: 67.2, luck: 0.01 },
  "UCSD": { rank: 118, teamName: "UC San Diego", adjEM: 4.53, adjOffense: 107.8, adjDefense: 103.3, tempo: 67.2, luck: 0.01 },
  "Seattle": { rank: 119, teamName: "Seattle", adjEM: 4.49, adjOffense: 102.2, adjDefense: 97.7, tempo: 67.6, luck: 0.017 },
  "Maryland": { rank: 120, teamName: "Maryland", adjEM: 4.25, adjOffense: 111.1, adjDefense: 106.9, tempo: 66.1, luck: 0.016 },
  "San Francisco": { rank: 121, teamName: "San Francisco", adjEM: 4.2, adjOffense: 113.6, adjDefense: 109.4, tempo: 65.9, luck: -0.006 },
  "USF (CA)": { rank: 121, teamName: "San Francisco", adjEM: 4.2, adjOffense: 113.6, adjDefense: 109.4, tempo: 65.9, luck: -0.006 },
  "Murray St.": { rank: 122, teamName: "Murray St.", adjEM: 4.12, adjOffense: 116.3, adjDefense: 112.2, tempo: 71.5, luck: 0.043 },
  "Murray State": { rank: 122, teamName: "Murray St.", adjEM: 4.12, adjOffense: 116.3, adjDefense: 112.2, tempo: 71.5, luck: 0.043 },
  "Bradley": { rank: 123, teamName: "Bradley", adjEM: 3.96, adjOffense: 111.7, adjDefense: 107.8, tempo: 67.3, luck: 0.039 },
  "Rutgers": { rank: 124, teamName: "Rutgers", adjEM: 3.95, adjOffense: 110.5, adjDefense: 106.5, tempo: 66.8, luck: 0.043 },
  "Liberty": { rank: 125, teamName: "Liberty", adjEM: 3.9, adjOffense: 117.6, adjDefense: 113.7, tempo: 63.9, luck: 0.142 },
  "Utah": { rank: 126, teamName: "Utah", adjEM: 3.65, adjOffense: 114.7, adjDefense: 111, tempo: 66, luck: -0.012 },
  "UAB": { rank: 127, teamName: "UAB", adjEM: 3.46, adjOffense: 109.8, adjDefense: 106.4, tempo: 69.1, luck: 0.006 },
  "Duquesne": { rank: 128, teamName: "Duquesne", adjEM: 3.45, adjOffense: 110.7, adjDefense: 107.3, tempo: 68.6, luck: -0.012 },
  "Florida Atlantic": { rank: 129, teamName: "Florida Atlantic", adjEM: 3.31, adjOffense: 109.7, adjDefense: 106.4, tempo: 69.6, luck: -0.034 },
  "FAU": { rank: 129, teamName: "Florida Atlantic", adjEM: 3.31, adjOffense: 109.7, adjDefense: 106.4, tempo: 69.6, luck: -0.034 },
  "UC Santa Barbara": { rank: 130, teamName: "UC Santa Barbara", adjEM: 3.17, adjOffense: 113.7, adjDefense: 110.6, tempo: 64.4, luck: -0.067 },
  "UCSB": { rank: 130, teamName: "UC Santa Barbara", adjEM: 3.17, adjOffense: 113.7, adjDefense: 110.6, tempo: 64.4, luck: -0.067 },
  "Toledo": { rank: 131, teamName: "Toledo", adjEM: 3.15, adjOffense: 114.5, adjDefense: 111.3, tempo: 67.8, luck: -0.055 },
  "Fresno St.": { rank: 132, teamName: "Fresno St.", adjEM: 3.09, adjOffense: 107.4, adjDefense: 104.3, tempo: 68.2, luck: -0.078 },
  "Fresno State": { rank: 132, teamName: "Fresno St.", adjEM: 3.09, adjOffense: 107.4, adjDefense: 104.3, tempo: 68.2, luck: -0.078 },
  "Montana St.": { rank: 133, teamName: "Montana St.", adjEM: 3, adjOffense: 111, adjDefense: 108, tempo: 65.8, luck: -0.083 },
  "Montana State": { rank: 133, teamName: "Montana St.", adjEM: 3, adjOffense: 111, adjDefense: 108, tempo: 65.8, luck: -0.083 },
  "Memphis": { rank: 134, teamName: "Memphis", adjEM: 2.52, adjOffense: 107.2, adjDefense: 104.7, tempo: 70.2, luck: -0.053 },
  "Rhode Island": { rank: 135, teamName: "Rhode Island", adjEM: 2.47, adjOffense: 105.8, adjDefense: 103.4, tempo: 65.7, luck: -0.048 },
  "North Texas": { rank: 136, teamName: "North Texas", adjEM: 2.46, adjOffense: 103.4, adjDefense: 100.9, tempo: 65, luck: 0.01 },
  "Washington St.": { rank: 137, teamName: "Washington St.", adjEM: 2.32, adjOffense: 113.9, adjDefense: 111.6, tempo: 67.8, luck: -0.094 },
  "Washington State": { rank: 137, teamName: "Washington St.", adjEM: 2.32, adjOffense: 113.9, adjDefense: 111.6, tempo: 67.8, luck: -0.094 },
  "Penn St.": { rank: 138, teamName: "Penn St.", adjEM: 2.18, adjOffense: 114, adjDefense: 111.9, tempo: 67.4, luck: -0.012 },
  "Penn State": { rank: 138, teamName: "Penn St.", adjEM: 2.18, adjOffense: 114, adjDefense: 111.9, tempo: 67.4, luck: -0.012 },
  "St. Bonaventure": { rank: 139, teamName: "St. Bonaventure", adjEM: 2.17, adjOffense: 113.7, adjDefense: 111.5, tempo: 67.3, luck: -0.044 },
  "Wright St.": { rank: 140, teamName: "Wright St.", adjEM: 2.04, adjOffense: 112.1, adjDefense: 110, tempo: 67.2, luck: 0.009 },
  "Wright State": { rank: 140, teamName: "Wright St.", adjEM: 2.04, adjOffense: 112.1, adjDefense: 110, tempo: 67.2, luck: 0.009 },
  "Northern Colorado": { rank: 141, teamName: "Northern Colorado", adjEM: 1.87, adjOffense: 112.3, adjDefense: 110.4, tempo: 68.7, luck: -0.024 },
  "Navy": { rank: 142, teamName: "Navy", adjEM: 1.84, adjOffense: 107.4, adjDefense: 105.5, tempo: 65.1, luck: 0.053 },
  "Troy": { rank: 143, teamName: "Troy", adjEM: 1.72, adjOffense: 110.7, adjDefense: 109, tempo: 64.9, luck: 0.024 },
  "Robert Morris": { rank: 144, teamName: "Robert Morris", adjEM: 1.69, adjOffense: 110.8, adjDefense: 109.1, tempo: 64.4, luck: 0.029 },
  "Idaho": { rank: 145, teamName: "Idaho", adjEM: 1.53, adjOffense: 108.8, adjDefense: 107.3, tempo: 67.7, luck: -0.012 },
  "Portland St.": { rank: 146, teamName: "Portland St.", adjEM: 1.52, adjOffense: 103.5, adjDefense: 102, tempo: 68, luck: 0.008 },
  "Portland State": { rank: 146, teamName: "Portland St.", adjEM: 1.52, adjOffense: 103.5, adjDefense: 102, tempo: 68, luck: 0.008 },
  "Bowling Green": { rank: 147, teamName: "Bowling Green", adjEM: 1.51, adjOffense: 107.2, adjDefense: 105.7, tempo: 68.3, luck: -0.095 },
  "Kent St.": { rank: 148, teamName: "Kent St.", adjEM: 1.5, adjOffense: 111.8, adjDefense: 110.3, tempo: 70.2, luck: 0.136 },
  "Kent State": { rank: 148, teamName: "Kent St.", adjEM: 1.5, adjOffense: 111.8, adjDefense: 110.3, tempo: 70.2, luck: 0.136 },
  "William & Mary": { rank: 149, teamName: "William & Mary", adjEM: 1.49, adjOffense: 111, adjDefense: 109.5, tempo: 72.5, luck: 0.024 },
  "Penn": { rank: 150, teamName: "Penn", adjEM: 1.47, adjOffense: 107.4, adjDefense: 105.9, tempo: 69, luck: 0.068 },
  "Pennsylvania": { rank: 150, teamName: "Penn", adjEM: 1.47, adjOffense: 107.4, adjDefense: 105.9, tempo: 69, luck: 0.068 },
  "Arkansas St.": { rank: 151, teamName: "Arkansas St.", adjEM: 1.39, adjOffense: 110.6, adjDefense: 109.2, tempo: 71.9, luck: 0.008 },
  "Arkansas State": { rank: 151, teamName: "Arkansas St.", adjEM: 1.39, adjOffense: 110.6, adjDefense: 109.2, tempo: 71.9, luck: 0.008 },
  "Harvard": { rank: 152, teamName: "Harvard", adjEM: 1.26, adjOffense: 106.6, adjDefense: 105.3, tempo: 63, luck: -0.015 },
  "Central Arkansas": { rank: 153, teamName: "Central Arkansas", adjEM: 1.25, adjOffense: 110.2, adjDefense: 108.9, tempo: 67.9, luck: 0.041 },
  "UT Arlington": { rank: 154, teamName: "UT Arlington", adjEM: 1.13, adjOffense: 102.6, adjDefense: 101.5, tempo: 64.8, luck: 0.03 },
  "UTA": { rank: 154, teamName: "UT Arlington", adjEM: 1.13, adjOffense: 102.6, adjDefense: 101.5, tempo: 64.8, luck: 0.03 },
  "Winthrop": { rank: 155, teamName: "Winthrop", adjEM: 1.13, adjOffense: 111.7, adjDefense: 110.5, tempo: 70, luck: 0.025 },
  "Boston College": { rank: 156, teamName: "Boston College", adjEM: 1.07, adjOffense: 103.7, adjDefense: 102.7, tempo: 65.9, luck: -0.035 },
  "Towson": { rank: 157, teamName: "Towson", adjEM: 0.99, adjOffense: 105.7, adjDefense: 104.7, tempo: 63.4, luck: 0.012 },
  "Valparaiso": { rank: 158, teamName: "Valparaiso", adjEM: 0.97, adjOffense: 108.1, adjDefense: 107.2, tempo: 65.1, luck: 0.041 },
  "UC Davis": { rank: 159, teamName: "UC Davis", adjEM: 0.89, adjOffense: 108, adjDefense: 107.1, tempo: 68.9, luck: 0.04 },
  "Richmond": { rank: 160, teamName: "Richmond", adjEM: 0.81, adjOffense: 111.3, adjDefense: 110.5, tempo: 67.6, luck: -0.092 },
  "Loyola Marymount": { rank: 161, teamName: "Loyola Marymount", adjEM: 0.68, adjOffense: 106.5, adjDefense: 105.8, tempo: 66.9, luck: -0.045 },
  "LMU": { rank: 161, teamName: "Loyola Marymount", adjEM: 0.68, adjOffense: 106.5, adjDefense: 105.8, tempo: 66.9, luck: -0.045 },
  "Georgia Tech": { rank: 162, teamName: "Georgia Tech", adjEM: 0.58, adjOffense: 107.7, adjDefense: 107.1, tempo: 70.6, luck: -0.039 },
  "Kennesaw St.": { rank: 163, teamName: "Kennesaw St.", adjEM: 0.57, adjOffense: 110.6, adjDefense: 110.1, tempo: 71.2, luck: 0.009 },
  "Kennesaw State": { rank: 163, teamName: "Kennesaw St.", adjEM: 0.57, adjOffense: 110.6, adjDefense: 110.1, tempo: 71.2, luck: 0.009 },
  "Cornell": { rank: 164, teamName: "Cornell", adjEM: 0.51, adjOffense: 119.8, adjDefense: 119.3, tempo: 71.2, luck: -0.032 },
  "Temple": { rank: 165, teamName: "Temple", adjEM: 0.5, adjOffense: 111.7, adjDefense: 111.2, tempo: 64.9, luck: -0.073 },
  "Fordham": { rank: 166, teamName: "Fordham", adjEM: 0.47, adjOffense: 104.6, adjDefense: 104.1, tempo: 64.4, luck: -0.056 },
  "East Tennessee St.": { rank: 167, teamName: "East Tennessee St.", adjEM: 0.44, adjOffense: 109.7, adjDefense: 109.2, tempo: 66, luck: -0.021 },
  "ETSU": { rank: 167, teamName: "East Tennessee St.", adjEM: 0.44, adjOffense: 109.7, adjDefense: 109.2, tempo: 66, luck: -0.021 },
  "Cal St. Fullerton": { rank: 168, teamName: "Cal St. Fullerton", adjEM: 0.38, adjOffense: 109.4, adjDefense: 109, tempo: 72.8, luck: 0.047 },
  "CSUF": { rank: 168, teamName: "Cal St. Fullerton", adjEM: 0.38, adjOffense: 109.4, adjDefense: 109, tempo: 72.8, luck: 0.047 },
  "Oakland": { rank: 169, teamName: "Oakland", adjEM: 0.21, adjOffense: 115.2, adjDefense: 115, tempo: 69.8, luck: 0.016 },
  "Western Kentucky": { rank: 170, teamName: "Western Kentucky", adjEM: 0.02, adjOffense: 108.5, adjDefense: 108.5, tempo: 69.9, luck: 0.008 },
  "WKU": { rank: 170, teamName: "Western Kentucky", adjEM: 0.02, adjOffense: 108.5, adjDefense: 108.5, tempo: 69.9, luck: 0.008 },
  "Eastern Washington": { rank: 171, teamName: "Eastern Washington", adjEM: 0, adjOffense: 113.1, adjDefense: 113.1, tempo: 67.6, luck: -0.061 },
  "EWU": { rank: 171, teamName: "Eastern Washington", adjEM: 0, adjOffense: 113.1, adjDefense: 113.1, tempo: 67.6, luck: -0.061 },
  "Charleston": { rank: 172, teamName: "Charleston", adjEM: -0.19, adjOffense: 108, adjDefense: 108.2, tempo: 67.6, luck: 0.105 },
  "College of Charleston": { rank: 172, teamName: "Charleston", adjEM: -0.19, adjOffense: 108, adjDefense: 108.2, tempo: 67.6, luck: 0.105 },
  "Austin Peay": { rank: 173, teamName: "Austin Peay", adjEM: -0.28, adjOffense: 108, adjDefense: 108.3, tempo: 69.4, luck: 0.033 },
  "Texas A&M Corpus Christi": { rank: 174, teamName: "Texas A&M Corpus Christi", adjEM: -0.29, adjOffense: 104.8, adjDefense: 105.1, tempo: 66, luck: 0.003 },
  "Texas A&M-CC": { rank: 174, teamName: "Texas A&M Corpus Christi", adjEM: -0.29, adjOffense: 104.8, adjDefense: 105.1, tempo: 66, luck: 0.003 },
  "CSUN": { rank: 175, teamName: "CSUN", adjEM: -0.37, adjOffense: 108.9, adjDefense: 109.3, tempo: 73.5, luck: 0.078 },
  "Cal State Northridge": { rank: 175, teamName: "CSUN", adjEM: -0.37, adjOffense: 108.9, adjDefense: 109.3, tempo: 73.5, luck: 0.078 },
  "Northern Kentucky": { rank: 176, teamName: "Northern Kentucky", adjEM: -0.59, adjOffense: 109.5, adjDefense: 110.1, tempo: 70.2, luck: -0.022 },
  "NKU": { rank: 176, teamName: "Northern Kentucky", adjEM: -0.59, adjOffense: 109.5, adjDefense: 110.1, tempo: 70.2, luck: -0.022 },
  "Oregon St.": { rank: 177, teamName: "Oregon St.", adjEM: -0.66, adjOffense: 109.2, adjDefense: 109.8, tempo: 65.1, luck: 0.097 },
  "Oregon State": { rank: 177, teamName: "Oregon St.", adjEM: -0.66, adjOffense: 109.2, adjDefense: 109.8, tempo: 65.1, luck: 0.097 },
  "Middle Tennessee": { rank: 178, teamName: "Middle Tennessee", adjEM: -0.67, adjOffense: 109.1, adjDefense: 109.8, tempo: 65.8, luck: 0.012 },
  "MTSU": { rank: 178, teamName: "Middle Tennessee", adjEM: -0.67, adjOffense: 109.1, adjDefense: 109.8, tempo: 65.8, luck: 0.012 },
  "Merrimack": { rank: 179, teamName: "Merrimack", adjEM: -0.83, adjOffense: 106.5, adjDefense: 107.4, tempo: 63.4, luck: 0.115 },
  "Monmouth": { rank: 180, teamName: "Monmouth", adjEM: -0.89, adjOffense: 106.1, adjDefense: 107, tempo: 67.1, luck: 0.013 },
  "Queens": { rank: 181, teamName: "Queens", adjEM: -1.44, adjOffense: 115.8, adjDefense: 117.2, tempo: 69.6, luck: 0.067 },
  "Queens (NC)": { rank: 181, teamName: "Queens", adjEM: -1.44, adjOffense: 115.8, adjDefense: 117.2, tempo: 69.6, luck: 0.067 },
  "Campbell": { rank: 182, teamName: "Campbell", adjEM: -1.47, adjOffense: 111.2, adjDefense: 112.6, tempo: 69.7, luck: 0.009 },
  "Charlotte": { rank: 183, teamName: "Charlotte", adjEM: -1.48, adjOffense: 113, adjDefense: 114.5, tempo: 63.4, luck: 0.024 },
  "New Mexico St.": { rank: 184, teamName: "New Mexico St.", adjEM: -1.61, adjOffense: 108.7, adjDefense: 110.3, tempo: 66.9, luck: -0.061 },
  "New Mexico State": { rank: 184, teamName: "New Mexico St.", adjEM: -1.61, adjOffense: 108.7, adjDefense: 110.3, tempo: 66.9, luck: -0.061 },
  "UMBC": { rank: 185, teamName: "UMBC", adjEM: -1.67, adjOffense: 108.2, adjDefense: 109.9, tempo: 66.2, luck: 0.046 },
  "Montana": { rank: 186, teamName: "Montana", adjEM: -1.72, adjOffense: 106.7, adjDefense: 108.5, tempo: 69.6, luck: 0.047 },
  "Tennessee St.": { rank: 187, teamName: "Tennessee St.", adjEM: -1.83, adjOffense: 109.1, adjDefense: 110.9, tempo: 70.2, luck: 0.07 },
  "Tennessee State": { rank: 187, teamName: "Tennessee St.", adjEM: -1.83, adjOffense: 109.1, adjDefense: 110.9, tempo: 70.2, luck: 0.07 },
  "Utah Tech": { rank: 188, teamName: "Utah Tech", adjEM: -1.88, adjOffense: 110.9, adjDefense: 112.8, tempo: 66.3, luck: 0.099 },
  "Columbia": { rank: 189, teamName: "Columbia", adjEM: -1.96, adjOffense: 108.5, adjDefense: 110.5, tempo: 66.7, luck: 0.012 },
  "Mercer": { rank: 190, teamName: "Mercer", adjEM: -1.97, adjOffense: 111.8, adjDefense: 113.7, tempo: 68.9, luck: -0.021 },
  "Furman": { rank: 191, teamName: "Furman", adjEM: -1.98, adjOffense: 107.5, adjDefense: 109.4, tempo: 65.9, luck: 0.01 },
  "Siena": { rank: 192, teamName: "Siena", adjEM: -2.1, adjOffense: 107.1, adjDefense: 109.2, tempo: 64.6, luck: 0.005 },
  "New Orleans": { rank: 193, teamName: "New Orleans", adjEM: -2.2, adjOffense: 109.7, adjDefense: 111.9, tempo: 69.7, luck: 0.038 },
  "FIU": { rank: 194, teamName: "FIU", adjEM: -2.23, adjOffense: 107.4, adjDefense: 109.6, tempo: 71.5, luck: -0.051 },
  "Florida International": { rank: 194, teamName: "FIU", adjEM: -2.23, adjOffense: 107.4, adjDefense: 109.6, tempo: 71.5, luck: -0.051 },
  "Appalachian St.": { rank: 195, teamName: "Appalachian St.", adjEM: -2.33, adjOffense: 105.8, adjDefense: 108.2, tempo: 63, luck: 0.015 },
  "Appalachian State": { rank: 195, teamName: "Appalachian St.", adjEM: -2.33, adjOffense: 105.8, adjDefense: 108.2, tempo: 63, luck: 0.015 },
  "Massachusetts": { rank: 196, teamName: "Massachusetts", adjEM: -2.6, adjOffense: 108.7, adjDefense: 111.3, tempo: 69.9, luck: -0.045 },
  "UMass": { rank: 196, teamName: "Massachusetts", adjEM: -2.6, adjOffense: 108.7, adjDefense: 111.3, tempo: 69.9, luck: -0.045 },
  "Drake": { rank: 197, teamName: "Drake", adjEM: -2.64, adjOffense: 109.9, adjDefense: 112.6, tempo: 67.2, luck: -0.06 },
};
