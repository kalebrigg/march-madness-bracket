import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "March Madness 2026 Bracket — Game Times, Odds & Predictions",
  description:
    "The cleanest March Madness bracket on the internet. See every game time, TV channel, venue, betting odds, and win probability in one interactive bracket.",
  keywords: [
    "march madness bracket",
    "march madness schedule",
    "march madness bracket with times",
    "ncaa tournament bracket 2026",
    "march madness game times",
    "march madness odds",
    "ncaa tournament schedule",
  ],
  openGraph: {
    title: "March Madness 2026 Bracket — Game Times, Odds & Predictions",
    description:
      "Every game time, TV channel, venue, and betting odds in one interactive bracket.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "March Madness 2026 Bracket — Game Times, Odds & Predictions",
    description:
      "The cleanest March Madness bracket on the internet.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
