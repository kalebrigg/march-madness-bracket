"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  badge?: React.ReactNode;       // e.g. a "Pre-game estimate" pill
  defaultOpen?: boolean;
  /** When provided, overrides internal open state (expand/collapse all). */
  forceOpen?: boolean;
  /** Called when the user manually toggles this section (so parent can reset forceOpen). */
  onToggle?: () => void;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  badge,
  defaultOpen = true,
  forceOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Sync when parent forces a state (expand all / collapse all)
  useEffect(() => {
    if (forceOpen !== undefined) setOpen(forceOpen);
  }, [forceOpen]);

  return (
    <div className="border-t border-border">
      {/* Header row — full width clickable toggle */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          onToggle?.();
        }}
        className="w-full flex items-center justify-between gap-2 py-2.5 text-left hover:bg-muted/40 transition-colors px-0.5 rounded-sm"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Collapsible content */}
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}
