import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileNav } from "@/components/layout/MobileNav";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://march-madness-bracket-nine.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "March Madness 2026 Bracket — Game Times, Odds & Predictions",
  description:
    "The cleanest March Madness bracket on the internet. Live scores, game times, TV channels, betting odds, and KenPom win probability — all in one interactive bracket.",
  keywords: [
    "march madness bracket",
    "march madness schedule",
    "march madness bracket with times",
    "ncaa tournament bracket 2026",
    "march madness game times",
    "march madness odds",
    "ncaa tournament schedule",
    "march madness predictions",
    "kenpom predictions",
  ],
  openGraph: {
    title: "March Madness 2026 🏀",
    description:
      "Live bracket · Game times · Betting odds · KenPom predictions. The cleanest tournament tracker on the internet.",
    type: "website",
    url: BASE_URL,
    siteName: "March Madness 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "March Madness 2026 🏀",
    description:
      "Live bracket · Game times · Betting odds · KenPom predictions.",
    creator: "@kalebrigg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <div className="pb-16 sm:pb-0">{children}</div>
            <MobileNav />
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
