"use server";

import { revalidatePath } from "next/cache";

/**
 * Bust the Next.js route cache for the bracket and bets pages.
 * ESPN data uses cache: 'no-store' so it's always fresh.
 * This primarily forces a re-render and clears the 30-min Odds cache age.
 */
export async function revalidateTournamentData() {
  revalidatePath("/", "page");
  revalidatePath("/bets", "page");
}
