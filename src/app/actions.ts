"use server";

import { revalidatePath } from "next/cache";

/**
 * Invalidates the Next.js data cache for the bracket and bets pages,
 * forcing a fresh fetch from ESPN + The Odds API on the next render.
 */
export async function revalidateTournamentData() {
  revalidatePath("/");
  revalidatePath("/bets");
}
