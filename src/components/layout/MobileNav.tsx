"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, TrendingUp, Info } from "lucide-react";

const tabs = [
  { href: "/", label: "Bracket", icon: Trophy },
  { href: "/bets", label: "Best Bets", icon: TrendingUp },
  { href: "/about", label: "How It Works", icon: Info },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-colors ${
                  active ? "text-primary" : ""
                }`}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
