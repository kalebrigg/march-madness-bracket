import { NextResponse } from "next/server";
import { fetchOdds, parseOdds } from "@/lib/odds";

export async function GET() {
  try {
    const oddsData = await fetchOdds();
    if (!oddsData) {
      return NextResponse.json({ odds: {} });
    }
    const oddsMap = parseOdds(oddsData);
    // Convert Map to plain object for JSON serialization
    const oddsObj: Record<string, unknown> = {};
    oddsMap.forEach((value, key) => {
      oddsObj[key] = value;
    });
    return NextResponse.json({ odds: oddsObj });
  } catch (error) {
    console.error("Odds API error:", error);
    return NextResponse.json({ odds: {} });
  }
}
