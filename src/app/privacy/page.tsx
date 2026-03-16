import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Privacy Policy — March Madness 2026 Bracket",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>

        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>Last updated: March 2026</p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Information We Collect</h2>
          <p>
            We use Google Analytics and Google AdSense, which may collect anonymous usage
            data such as pages visited, time spent on pages, and general geographic location.
            We do not collect any personally identifiable information.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Cookies</h2>
          <p>
            Third-party services like Google AdSense and Google Analytics use cookies to serve
            relevant ads and analyze site traffic. You can manage cookie preferences through
            your browser settings.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Third-Party Services</h2>
          <p>
            This site uses data from ESPN and The Odds API to provide tournament information
            and betting odds. We are not affiliated with the NCAA, ESPN, or any sportsbook.
          </p>

          <h2 className="text-lg font-semibold text-foreground mt-6">Contact</h2>
          <p>
            For questions about this privacy policy, please reach out via the About page.
          </p>
        </div>
      </main>
    </div>
  );
}
