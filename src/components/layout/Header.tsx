import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { PrintButton } from "./PrintButton";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 no-print">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              March Madness 2026
            </h1>
            <p className="text-xs text-muted-foreground">
              Bracket &middot; Schedule &middot; Odds &middot; Predictions
            </p>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="text-sm px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
            >
              Bracket
            </Link>
            <Link
              href="/bets"
              className="text-sm px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-foreground/80 hover:text-foreground font-medium"
            >
              Best Bets
            </Link>
            <Link
              href="/about"
              className="text-sm px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
            >
              How It Works
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground text-right hidden lg:block">
            NCAA Division I Men&apos;s Basketball Tournament
          </span>
          <PrintButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
