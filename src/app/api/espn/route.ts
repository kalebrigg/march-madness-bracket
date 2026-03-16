import { NextResponse } from "next/server";
import { fetchTournamentData, buildTournament } from "@/lib/espn";

export async function GET() {
  try {
    const events = await fetchTournamentData();
    const tournament = buildTournament(events);
    return NextResponse.json(tournament);
  } catch (error) {
    console.error("ESPN API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournament data" },
      { status: 500 }
    );
  }
}
