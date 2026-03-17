"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ adSlot, adFormat = "auto", className }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet
    }
  }, [clientId]);

  if (!clientId) {
    // Show placeholder in development
    return (
      <div className={`no-print bg-muted/30 border border-dashed border-muted-foreground/20 rounded flex items-center justify-center text-muted-foreground text-xs py-2 ${className ?? ""}`}>
        Ad Space
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle block no-print ${className ?? ""}`}
      data-ad-client={clientId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
}
