import { useCurrentFrame, interpolate } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 25s = 750 frames

  // Animated percentage
  const pct = Math.min(
    80,
    Math.floor(
      interpolate(frame, [20, 90], [0, 80], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // Progress bar
  const barWidth = interpolate(frame, [20, 95], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pain point items
  const painPoints = [
    { text: "Same templates", start: 85 },
    { text: "Same beam sections", start: 125 },
    { text: "Same rebar schedules", start: 165 },
    { text: "Different numbers every time", start: 215 },
  ];

  const fadeOut = interpolate(frame, [728, 750], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.bgVoid,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.fontUi,
        padding: 80,
        opacity: fadeOut,
      }}
    >
      {/* "80%" big number — white on dark, no color needed */}
      <FadeIn startFrame={10}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span
            style={{
              fontSize: 150,
              fontWeight: 700,
              color: theme.textPrimary,
              lineHeight: 1,
              fontFamily: theme.fontMono,
              letterSpacing: "-4px",
            }}
          >
            {pct}%
          </span>
        </div>
      </FadeIn>

      {/* Progress bar — single muted color */}
      <FadeIn startFrame={15}>
        <div
          style={{
            width: 560,
            height: 4,
            borderRadius: 2,
            background: theme.bgElevated,
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${barWidth}%`,
              height: "100%",
              borderRadius: 2,
              background: theme.textTertiary,
            }}
          />
        </div>
      </FadeIn>

      <FadeIn startFrame={25}>
        <p style={{ fontSize: 26, color: theme.textSecondary, marginBottom: 40, fontWeight: 300 }}>
          of an engineer's time goes to <span style={{ fontWeight: 600, color: theme.textPrimary }}>drafting</span>
        </p>
      </FadeIn>

      {/* Pain point pills — subtle, no color coding */}
      <div style={{ display: "flex", gap: 10, marginBottom: 56, flexWrap: "wrap", justifyContent: "center" }}>
        {painPoints.map((item) => {
          const op = interpolate(frame, [item.start, item.start + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(frame, [item.start, item.start + 15], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={item.text}
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                padding: "8px 20px",
                borderRadius: 8,
                border: `1px solid ${theme.borderSubtle}`,
                background: theme.bgSurface,
                fontSize: 14,
                fontWeight: 400,
                color: theme.textSecondary,
              }}
            >
              {item.text}
            </div>
          );
        })}
      </div>

      {/* Stats row — monochromatic, emphasis through size/weight only */}
      <div style={{ display: "flex", gap: 60 }}>
        <FadeIn startFrame={310} slideY={8}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: theme.textPrimary,
                fontFamily: theme.fontMono,
                letterSpacing: "-1px",
              }}
            >
              $10K+
            </div>
            <div style={{ fontSize: 13, color: theme.textTertiary, marginTop: 6, fontWeight: 400 }}>
              per drawing error
            </div>
          </div>
        </FadeIn>

        <FadeIn startFrame={420} slideY={8}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: theme.textPrimary,
                fontFamily: theme.fontMono,
                letterSpacing: "-1px",
              }}
            >
              3+ days
            </div>
            <div style={{ fontSize: 13, color: theme.textTertiary, marginTop: 6, fontWeight: 400 }}>
              per revision cycle
            </div>
          </div>
        </FadeIn>

        <FadeIn startFrame={570} slideY={8}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: theme.textPrimary,
                fontFamily: theme.fontMono,
                letterSpacing: "-1px",
              }}
            >
              75%
            </div>
            <div style={{ fontSize: 13, color: theme.textTertiary, marginTop: 6, fontWeight: 400 }}>
              still manual AutoCAD
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};
