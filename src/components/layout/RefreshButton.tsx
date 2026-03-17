"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { revalidateTournamentData } from "@/app/actions";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  function handleRefresh() {
    startTransition(async () => {
      await revalidateTournamentData();
      router.refresh();
      setLastRefreshed(new Date());
    });
  }

  return (
    <div className="flex items-center gap-1.5 no-print">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isPending}
        title={lastRefreshed ? `Last refreshed at ${lastRefreshed.toLocaleTimeString()}` : "Refresh live scores and odds"}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">{isPending ? "Refreshing…" : "Refresh"}</span>
      </button>
    </div>
  );
}
