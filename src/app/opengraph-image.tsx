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
          background: "#080f1e",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Big blue glow top-left */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "-100px",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 65%)",
          }}
        />
        {/* Orange glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "-80px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234,88,12,0.25) 0%, transparent 65%)",
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            bottom: "0",
            width: "8px",
            background: "linear-gradient(180deg, #2563eb 0%, #7c3aed 50%, #ea580c 100%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px 60px 88px",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Top label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                background: "#ea580c",
                borderRadius: "8px",
                padding: "6px 18px",
                fontSize: "25px",
                fontWeight: "800",
                color: "white",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              NCAA Tournament
            </div>
            <div
              style={{
                fontSize: "25px",
                fontWeight: "700",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em",
              }}
            >
              · Men's Basketball
            </div>
          </div>

          {/* Giant headline */}
          <div
            style={{
              fontSize: "110px",
              fontWeight: "900",
              color: "white",
              lineHeight: "0.95",
              letterSpacing: "-0.03em",
              marginBottom: "6px",
            }}
          >
            MARCH
          </div>
          <div
            style={{
              fontSize: "110px",
              fontWeight: "900",
              lineHeight: "0.95",
              letterSpacing: "-0.03em",
              marginBottom: "36px",
              color: "#3b82f6",
            }}
          >
            MADNESS
          </div>

          {/* 3 big stats / features */}
          <div
            style={{
              display: "flex",
              gap: "0px",
            }}
          >
            {[
              { icon: "🏀", label: "Live Bracket" },
              { icon: "📊", label: "Betting Odds" },
              { icon: "🤖", label: "AI Predictions" },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 28px",
                  borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                  paddingLeft: i === 0 ? "0" : "28px",
                }}
              >
                <span style={{ fontSize: "28px" }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: "25px",
                    fontWeight: "700",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side — year + URL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "60px 60px 60px 0",
            position: "relative",
          }}
        >
          {/* Big year */}
          <div
            style={{
              fontSize: "96px",
              fontWeight: "900",
              color: "rgba(255,255,255,0.07)",
              letterSpacing: "-0.04em",
              lineHeight: "1",
              textAlign: "right",
            }}
          >
            2026
          </div>

          {/* URL */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#22c55e",
                }}
              />
              <span
                style={{
                  fontSize: "25px",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "monospace",
                }}
              >
                mm26-bracketedge.vercel.app
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
