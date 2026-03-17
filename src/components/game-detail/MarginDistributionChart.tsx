"use client";

import { HIST_BINS, HIST_BIN_WIDTH, HIST_MIN } from "@/lib/monte-carlo";

interface MarginDistributionChartProps {
  bins: number[];           // raw counts, length = HIST_BINS
  bookSpread: number | null; // team1's line, e.g. -8.5
  team1Abbr: string;
  team2Abbr: string;
}

const W = 300;   // viewBox width
const H = 72;    // viewBox height
const BAR_AREA_H = 56; // height reserved for bars
const PAD_TOP = 4;

// Convert a margin value to an x position in viewBox coordinates
function marginToX(margin: number): number {
  // HIST_MIN = -60, HIST_MAX = +60, range = 120
  return ((margin - HIST_MIN) / (HIST_BINS * HIST_BIN_WIDTH)) * W;
}

export function MarginDistributionChart({
  bins,
  bookSpread,
  team1Abbr,
  team2Abbr,
}: MarginDistributionChartProps) {
  const maxCount = Math.max(...bins, 1);
  const barW = W / HIST_BINS;

  // The zero line: margin = 0
  const zeroX = marginToX(0);

  // The cover line: team1 covers when margin > -bookSpread
  const coverX = bookSpread !== null ? marginToX(-bookSpread) : null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="font-medium">{team2Abbr} wins →</span>
        <span className="font-medium text-muted-foreground/60">Margin distribution</span>
        <span className="font-medium">← {team1Abbr} wins</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "72px" }}
        aria-label="Margin outcome distribution"
      >
        {/* Bars */}
        {bins.map((count, i) => {
          const barH = (count / maxCount) * BAR_AREA_H;
          const x = i * barW;
          const y = PAD_TOP + BAR_AREA_H - barH;

          // Bin center margin
          const binCenterMargin = HIST_MIN + (i + 0.5) * HIST_BIN_WIDTH;

          // Color logic:
          // If no spread: blue = team1 wins (margin > 0), gray = team2 wins
          // If spread: green = covers (margin > -bookSpread), red = doesn't cover
          let fill: string;
          if (coverX !== null && bookSpread !== null) {
            fill = binCenterMargin > -bookSpread ? "#16a34a" : "#ef4444";
          } else {
            fill = binCenterMargin > 0 ? "#3b82f6" : "#6b7280";
          }

          return (
            <rect
              key={i}
              x={x + 0.5}
              y={y}
              width={barW - 1}
              height={barH}
              fill={fill}
              opacity={0.75}
              rx={1}
            />
          );
        })}

        {/* Axis baseline */}
        <line
          x1={0} y1={PAD_TOP + BAR_AREA_H}
          x2={W} y2={PAD_TOP + BAR_AREA_H}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={1}
        />

        {/* Zero line */}
        <line
          x1={zeroX} y1={PAD_TOP}
          x2={zeroX} y2={PAD_TOP + BAR_AREA_H + 2}
          stroke="currentColor"
          strokeOpacity={0.5}
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />

        {/* Spread cover line */}
        {coverX !== null && (
          <>
            <line
              x1={coverX} y1={PAD_TOP}
              x2={coverX} y2={PAD_TOP + BAR_AREA_H + 2}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              opacity={0.9}
            />
            {/* Spread label */}
            <text
              x={coverX + (coverX > W * 0.7 ? -3 : 3)}
              y={PAD_TOP + 8}
              fontSize={7}
              fill="#f59e0b"
              textAnchor={coverX > W * 0.7 ? "end" : "start"}
              opacity={0.9}
            >
              {bookSpread! > 0 ? "+" : ""}{bookSpread}
            </text>
          </>
        )}

        {/* Zero label */}
        <text
          x={zeroX + 3}
          y={PAD_TOP + BAR_AREA_H + 10}
          fontSize={7}
          fill="currentColor"
          fillOpacity={0.45}
          textAnchor="start"
        >
          0
        </text>
      </svg>

      {/* Legend */}
      {coverX !== null ? (
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-green-600 opacity-80" />
            {team1Abbr} covers
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-red-500 opacity-80" />
            {team1Abbr} doesn&apos;t cover
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 border-t border-dashed border-amber-400" />
            spread
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-blue-500 opacity-80" />
            {team1Abbr} wins
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-gray-500 opacity-80" />
            {team2Abbr} wins
          </span>
        </div>
      )}
    </div>
  );
}
