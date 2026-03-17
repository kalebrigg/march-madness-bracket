"use client";

import { cn } from "@/lib/utils";

interface RoundConnectorProps {
  matchCount: number;
  reverse?: boolean;
}

/**
 * Draws traditional bracket connector lines between two rounds.
 *
 * For each pair of source matchups, renders:
 *   [source1] ───┐
 *                 ├─── [dest]
 *   [source2] ───┘
 *
 * The connector has two sections:
 *   1. Merge section (w-4): vertical bar with horizontal inputs from each source
 *   2. Output section (w-4): horizontal line from merge midpoint to destination
 */
export function RoundConnector({ matchCount, reverse }: RoundConnectorProps) {
  const pairCount = Math.floor(matchCount / 2);

  if (pairCount === 0) return null;

  return (
    <div className="hidden lg:flex flex-col justify-around w-8 shrink-0">
      {Array.from({ length: pairCount }).map((_, i) => (
        <div key={i} className={cn("flex flex-1", reverse && "flex-row-reverse")}>
          {/* Merge section: two horizontal lines converging into a vertical bar */}
          <div className="flex flex-col flex-1">
            <div
              className={cn(
                "flex-1 border-border",
                reverse
                  ? "border-l-2 border-b-2"
                  : "border-r-2 border-b-2"
              )}
            />
            <div
              className={cn(
                "flex-1 border-border",
                reverse
                  ? "border-l-2 border-t-2"
                  : "border-r-2 border-t-2"
              )}
            />
          </div>
          {/* Output section: horizontal line from merge midpoint to next matchup */}
          <div className="flex flex-col flex-1">
            <div className="flex-1 border-border border-b-2" />
            <div className="flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
