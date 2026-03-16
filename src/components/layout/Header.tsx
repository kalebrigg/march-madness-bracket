export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            March Madness 2026
          </h1>
          <p className="text-xs text-muted-foreground">
            Bracket &middot; Schedule &middot; Odds &middot; Predictions
          </p>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          NCAA Division I Men&apos;s Basketball Tournament
        </div>
      </div>
    </header>
  );
}
