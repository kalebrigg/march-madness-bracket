"use client";

import { useState } from "react";
import { runMonteCarlo, type MonteCarloResult } from "@/lib/monte-carlo";

interface MonteCarloSectionProps {
  projSpread: number;       // KenPom projected margin (positive = team1 favored)
  projTotal: number;        // KenPom projected total
  bookSpread: number | null; // average book spread for team1 (e.g. -8.5)
  ouLine: number | null;    // consensus O/U line
  team1Abbr: string;
  team2Abbr: string;
  isPreGame: boolean;
}

function pctColor(p: number): string {
  if (p >= 0.55) return "text-green-600 font-semibold";
  if (p >= 0.525) return "text-green-500";
  if (p <= 0.45) return "text-red-500";
  if (p <= 0.475) return "text-red-400";
  return "text-muted-foreground";
}

function pctBar(p: number, color: string) {
  return (
    <div className="w-full bg-muted rounded-full h-1.5 mt-0.5">
      <div
        className={`h-1.5 rounded-full transition-all ${color}`}
        style={{ width: `${Math.round(p * 100)}%`, backgroundColor: "currentColor" }}
      />
    </div>
  );
}

function StatRow({
  label,
  valA,
  valB,
  sublabel,
}: {
  label: string;
  valA: number;
  valB: number;
  sublabel?: string;
}) {
  const colorA = pctColor(valA);
  const colorB = pctColor(valB);
  return (
    <div className="border-t border-border/50 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        {sublabel && (
          <span className="text-[10px] text-muted-foreground/60">{sublabel}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 text-right">
          <span className={`text-sm font-mono ${colorA}`}>
            {Math.round(valA * 100)}%
          </span>
        </div>
        <div className="w-full max-w-[120px]">
          <div className="flex h-2 rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${valA * 100}%`,
                backgroundColor: valA >= 0.525 ? "#16a34a" : valA <= 0.475 ? "#ef4444" : "#6b7280",
              }}
            />
            <div
              className="h-full transition-all"
              style={{
                width: `${valB * 100}%`,
                backgroundColor: valB >= 0.525 ? "#16a34a" : valB <= 0.475 ? "#ef4444" : "#6b7280",
              }}
            />
          </div>
        </div>
        <div className="flex-1">
          <span className={`text-sm font-mono ${colorB}`}>
            {Math.round(valB * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function MonteCarloSection({
  projSpread,
  projTotal,
  bookSpread,
  ouLine,
  team1Abbr,
  team2Abbr,
  isPreGame,
}: MonteCarloSectionProps) {
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [running, setRunning] = useState(false);

  function run() {
    setRunning(true);
    // Use setTimeout(0) so the button state updates before the synchronous loop blocks
    setTimeout(() => {
      const r = runMonteCarlo(projSpread, projTotal, bookSpread, ouLine);
      setResult(r);
      setRunning(false);
    }, 0);
  }

  const hasSpread = bookSpread !== null;
  const hasOU = ouLine !== null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Monte Carlo Simulation
        </div>
        {!isPreGame && (
          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
            Pre-game estimate
          </span>
        )}
      </div>

      {!result ? (
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Runs 10,000 simulated games using the KenPom score projection with
            historical variance (σ&nbsp;=&nbsp;11 pts for margin,
            σ&nbsp;=&nbsp;18 pts for total) to compute{" "}
            {hasSpread && "ATS cover probability"}
            {hasSpread && hasOU && " and "}
            {hasOU && "over/under hit rate"}
            {!hasSpread && !hasOU && "win probability distribution"}
            .
          </p>
          <button
            onClick={run}
            disabled={running}
            className="w-full py-2 px-3 rounded-md border border-primary/40 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {running ? "Simulating…" : "▶ Run 10,000 Simulations"}
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Column headers */}
          <div className="flex items-center gap-3 pb-1">
            <span className="flex-1 text-right text-[10px] font-semibold text-foreground">
              {team1Abbr}
            </span>
            <span className="w-full max-w-[120px]" />
            <span className="flex-1 text-[10px] font-semibold text-foreground">
              {team2Abbr}
            </span>
          </div>

          {/* Win % */}
          <StatRow
            label="Win %"
            valA={result.winPctA}
            valB={result.winPctB}
          />

          {/* ATS Cover */}
          {result.coverPctA !== null && result.coverPctB !== null && (
            <StatRow
              label="Cover ATS"
              valA={result.coverPctA}
              valB={result.coverPctB}
              sublabel={
                bookSpread !== null
                  ? `${team1Abbr} ${bookSpread > 0 ? "+" : ""}${bookSpread}`
                  : undefined
              }
            />
          )}

          {/* Over / Under */}
          {result.overPct !== null && result.underPct !== null && (
            <div className="border-t border-border/50 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Over / Under</span>
                <span className="text-[10px] text-muted-foreground/60">
                  {ouLine != null ? `O/U ${ouLine}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`text-sm font-mono ${pctColor(result.overPct)}`}>
                    {Math.round(result.overPct * 100)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">Over</span>
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-muted flex">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${result.overPct * 100}%`,
                      backgroundColor: result.overPct >= 0.525 ? "#16a34a" : result.overPct <= 0.475 ? "#ef4444" : "#6b7280",
                    }}
                  />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`text-sm font-mono ${pctColor(result.underPct)}`}>
                    {Math.round(result.underPct * 100)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">Under</span>
                </div>
              </div>
            </div>
          )}

          {/* Simulation metadata */}
          <div className="pt-1 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground/60">
              {result.n.toLocaleString()} simulations · margin σ {result.marginStdDev.toFixed(1)} · total σ {result.totalStdDev.toFixed(1)}
            </p>
            <button
              onClick={run}
              className="text-[10px] text-primary/60 hover:text-primary underline transition-colors"
            >
              Re-run
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
