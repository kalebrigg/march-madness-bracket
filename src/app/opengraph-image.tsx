import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "March Madness 2026 Bracket — Game Times, Odds & Predictions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0e1a 0%, #0f1f3d 50%, #0a1628 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-60px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Bracket lines decoration — right side */}
        <div
          style={{
            position: "absolute",
            right: "60px",
            top: "80px",
            display: "flex",
            flexDirection: "column",
            gap: "0px",
            opacity: 0.2,
          }}
        >
          {/* Round 1 */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: i % 2 === 0 ? "0px" : "32px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "28px",
                  border: "1.5px solid rgba(255,255,255,0.5)",
                  borderRadius: "4px",
                  marginRight: i % 2 === 0 ? "0px" : "0px",
                }}
              />
              {i % 2 === 0 && (
                <div
                  style={{
                    width: "24px",
                    height: "30px",
                    borderTop: "1.5px solid rgba(255,255,255,0.5)",
                    borderRight: "1.5px solid rgba(255,255,255,0.5)",
                  }}
                />
              )}
              {i % 2 === 1 && (
                <div
                  style={{
                    width: "24px",
                    height: "30px",
                    borderBottom: "1.5px solid rgba(255,255,255,0.5)",
                    borderRight: "1.5px solid rgba(255,255,255,0.5)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "70px 80px",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Top badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                background: "rgba(239,68,68,0.9)",
                borderRadius: "6px",
                padding: "5px 14px",
                fontSize: "13px",
                fontWeight: "700",
                color: "white",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              NCAA Tournament
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "6px",
                padding: "5px 14px",
                fontSize: "13px",
                fontWeight: "600",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.06em",
              }}
            >
              2026
            </div>
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: "76px",
              fontWeight: "900",
              color: "white",
              lineHeight: "1.0",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            March
          </div>
          <div
            style={{
              fontSize: "76px",
              fontWeight: "900",
              lineHeight: "1.0",
              letterSpacing: "-0.02em",
              marginBottom: "32px",
              background: "linear-gradient(90deg, #60a5fa, #3b82f6)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Madness.
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "44px",
              flexWrap: "wrap",
            }}
          >
            {["🏀 Live Bracket", "🕐 Game Times", "📺 TV Channels", "📊 Betting Odds", "🤖 AI Predictions"].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "100px",
                    padding: "8px 18px",
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: "500",
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>

          {/* URL bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <div
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "monospace",
                letterSpacing: "0.02em",
              }}
            >
              march-madness-bracket-nine.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
