"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="hidden lg:flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
      aria-label="Print bracket"
    >
      <Printer className="w-4 h-4" />
      <span>Print</span>
    </button>
  );
}
