import type { KenPomRating, TeamKenPom } from "./types";

/**
 * Fetch KenPom ratings data.
 * Since KenPom doesn't have a public API, this uses a scraping approach.
 * Returns null if unable to fetch.
 */
export async function fetchKenPomData(): Promise<TeamKenPom | null> {
  try {
    // Try to fetch from a proxy API that serves KenPom data
    // Using an alternative approach: fetch from a public data source or API
    const res = await fetch("https://kenpom.com/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 }, // 1 hour cache
    });

    if (!res.ok) {
      console.warn("Could not fetch KenPom data");
      return null;
    }

    // For now, return a placeholder/empty object
    // In production, you would parse the HTML here
    return {};
  } catch (error) {
    console.warn("Error fetching KenPom data:", error);
    return null;
  }
}

/**
 * Get KenPom rating for a specific team by name.
 * Searches the team name in the KenPom data.
 */
export function getTeamKenPom(
  teamName: string,
  kenPomData: TeamKenPom | null
): KenPomRating | null {
  if (!kenPomData) return null;

  // Try exact match first
  if (kenPomData[teamName]) {
    return kenPomData[teamName];
  }

  // Try case-insensitive match
  const lowerTeamName = teamName.toLowerCase();
  for (const [key, value] of Object.entries(kenPomData)) {
    if (key.toLowerCase() === lowerTeamName) {
      return value;
    }
  }

  // Try partial match (team name contains)
  for (const [key, value] of Object.entries(kenPomData)) {
    if (
      key.toLowerCase().includes(lowerTeamName) ||
      lowerTeamName.includes(key.toLowerCase())
    ) {
      return value;
    }
  }

  return null;
}

/**
 * Mock KenPom data for development/testing
 * Replace with real data when KenPom integration is complete
 */
export const MOCK_KENPOM_DATA: TeamKenPom = {
  Alabama: {
    rank: 18,
    teamName: "Alabama",
    adjEM: 25.7,
    adjOffense: 129.0,
    adjDefense: 103.3,
    tempo: 73.1,
    sosEM: 16.8,
    luck: 0.019,
  },
  Duke: {
    rank: 5,
    teamName: "Duke",
    adjEM: 29.2,
    adjOffense: 131.2,
    adjDefense: 102.0,
    tempo: 70.5,
    sosEM: 11.2,
    luck: -0.025,
  },
  Kansas: {
    rank: 3,
    teamName: "Kansas",
    adjEM: 31.5,
    adjOffense: 132.8,
    adjDefense: 101.3,
    tempo: 68.9,
    sosEM: 15.3,
    luck: 0.045,
  },
  // Add more teams as needed
};
