// Historical seed matchup win rates (higher seed win %)
// Based on all NCAA tournament games 1985-2024
export const SEED_WIN_RATES: Record<string, number> = {
  "1v16": 0.993,
  "2v15": 0.944,
  "3v14": 0.850,
  "4v13": 0.792,
  "5v12": 0.646,
  "6v11": 0.625,
  "7v10": 0.607,
  "8v9": 0.512,
};

// Standard bracket seed order within a region (matchup pairings)
export const BRACKET_SEED_ORDER = [
  [1, 16],
  [8, 9],
  [5, 12],
  [4, 13],
  [6, 11],
  [3, 14],
  [7, 10],
  [2, 15],
];

export const ROUND_NAMES: Record<number, string> = {
  0: "First Four",
  1: "First Round",
  2: "Second Round",
  3: "Sweet 16",
  4: "Elite Eight",
  5: "Final Four",
  6: "Championship",
};

export const REGION_NAMES = ["South", "East", "Midwest", "West"];

/**
 * The display order of regions in the bracket view.
 * Left side (index 0-1): East top, South bottom.
 * Right side (index 2-3): West top, Midwest bottom.
 * This matches the official NCAA bracket layout.
 */
export const REGION_ORDER = ["East", "South", "West", "Midwest"];

// Team name aliases: Maps Odds API names → ESPN names
// This handles the most common discrepancies
export const TEAM_NAME_ALIASES: Record<string, string> = {
  "Connecticut Huskies": "UConn",
  "Connecticut": "UConn",
  "UConn Huskies": "UConn",
  "Southern California": "USC",
  "North Carolina Tar Heels": "North Carolina",
  "North Carolina": "North Carolina",
  "Louisiana State": "LSU",
  "Louisiana State Tigers": "LSU",
  "Mississippi State": "Mississippi St",
  "Mississippi State Bulldogs": "Mississippi St",
  "Saint Mary's": "Saint Mary's",
  "Saint Mary's Gaels": "Saint Mary's",
  "Brigham Young": "BYU",
  "Brigham Young Cougars": "BYU",
  "Texas Christian": "TCU",
  "Texas Christian Horned Frogs": "TCU",
  "Virginia Commonwealth": "VCU",
  "College of Charleston": "Charleston",
  "UC San Diego": "UCSD",
  "UC Irvine": "UC Irvine",
  "UC Santa Barbara": "UCSB",
  "North Carolina State": "NC State",
  "North Carolina State Wolfpack": "NC State",
  "Central Florida": "UCF",
  "UCF Knights": "UCF",
  "Florida Atlantic": "FAU",
  "Miami (FL)": "Miami",
  "Miami Florida": "Miami",
  // Multi-word mascots the strip regex can't handle cleanly
  "Illinois Fighting Illini": "Illinois",
  "California Golden Bears": "California",
  "California Bears": "California",
  "Colorado State Rams": "Colorado St",
  "Queens University Royals": "Queens University",
  "Queens University": "Queens University",
  "St. John's Red Storm": "St. John's",
  "TCU Horned Frogs": "TCU",
  "Hawaii Rainbow Warriors": "Hawai'i",
  "Hawai'i Rainbow Warriors": "Hawai'i",
  "NC State Wolfpack": "NC State",
  "VCU Rams": "VCU",
  "Virginia Commonwealth Rams": "VCU",
  "Wright State Raiders": "Wright State",
  "Wright St Raiders": "Wright State",
  "Cal Baptist Lancers": "California Baptist",
  "California Baptist Lancers": "California Baptist",
  "California Baptist": "California Baptist",
  "Saint Louis Billikens": "Saint Louis",
  "Kennesaw State Owls": "Kennesaw State",
  "Kennesaw St Owls": "Kennesaw State",
  "Furman Paladins": "Furman",
  "South Alabama Jaguars": "South Alabama",
  "Northern Iowa Panthers": "Northern Iowa",
  "Purdue Boilermakers": "Purdue",
  "Akron Zips": "Akron",
  "Pennsylvania Quakers": "Pennsylvania",
  "Siena Saints": "Siena",
  "Hofstra Pride": "Hofstra",
  "LIU Sharks": "Long Island University",
  "Long Island Sharks": "Long Island University",
  "Long Island University Sharks": "Long Island University",
  "Idaho Vandals": "Idaho",
  "Santa Clara Broncos": "Santa Clara",
  "Texas Tech Red Raiders": "Texas Tech",
  "North Dakota State Bison": "North Dakota State",
  "North Dakota St Bison": "North Dakota State",
  "Michigan State Spartans": "Michigan State",
  "Michigan St Spartans": "Michigan State",
  "Ohio State Buckeyes": "Ohio State",
  "Alabama Crimson Tide": "Alabama",
  "Arizona Wildcats": "Arizona",
  "Houston Cougars": "Houston",
  "Virginia Cavaliers": "Virginia",
  "Kansas Jayhawks": "Kansas",
  "Georgia Bulldogs": "Georgia",
  "Gonzaga Bulldogs": "Gonzaga",
  "Auburn Tigers": "Auburn",
  "UCLA Bruins": "UCLA",
  "Iowa State Cyclones": "Iowa State",
  "Clemson Tigers": "Clemson",
  "Miami Hurricanes": "Miami",
  "Vanderbilt Commodores": "Vanderbilt",
  "Wisconsin Badgers": "Wisconsin",
  "Duke Blue Devils": "Duke",
  "Kentucky Wildcats": "Kentucky",
  "Texas Longhorns": "Texas",
  "Arkansas Razorbacks": "Arkansas",
  "Iowa Hawkeyes": "Iowa",
  "Missouri Tigers": "Missouri",
  "Tennessee St Tigers": "Tennessee State",
  "Tennessee State Tigers": "Tennessee State",
  // Miami (OH) — Odds API may use "Miami Ohio" rather than the ESPN "Miami (OH)" format
  "Miami Ohio": "Miami (OH)",
  "Miami Ohio Redhawks": "Miami (OH)",
  "Miami Ohio RedHawks": "Miami (OH)",
  "Miami (Ohio)": "Miami (OH)",
  "Miami (Ohio) Redhawks": "Miami (OH)",
  // McNeese — Odds API may use full "McNeese State" but ESPN uses "McNeese"
  "McNeese State": "McNeese",
  "McNeese State Cowboys": "McNeese",
  // Hawaii — Odds API often drops the ʻokina apostrophe
  "Hawaii": "Hawai'i",
  // Prairie View A&M — ensure mascot-stripped form still maps correctly
  "Prairie View Panthers": "Prairie View A&M",
  "Prairie View A&M Panthers": "Prairie View A&M",
  // North Dakota State — ESPN uses full name
  "North Dakota State": "North Dakota State",
};

// Tournament date ranges for 2026 (approximate - adjust when actual dates announced)
// First Four: Mar 17-18, First Round: Mar 19-20, Second Round: Mar 21-22
// Sweet 16: Mar 26-27, Elite 8: Mar 28-29, Final Four: Apr 4, Championship: Apr 6
export const TOURNAMENT_DATES_2026 = [
  "20260317", "20260318", // First Four
  "20260319", "20260320", // First Round
  "20260321", "20260322", // Second Round
  "20260326", "20260327", // Sweet 16
  "20260328", "20260329", // Elite Eight
  "20260404",             // Final Four
  "20260406",             // Championship
];
