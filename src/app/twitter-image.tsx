import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "March Madness 2026 Bracket — Live Odds & Predictions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Twitter uses the same image as OG — re-export the same component
export { default } from "./opengraph-image";
