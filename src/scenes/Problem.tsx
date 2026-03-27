import { useCurrentFrame, interpolate } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 32s = 960 frames
  // Voice: "Engineers spend 80% of their time drafting. The same templates..."

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

  // Pain point items appear sequentially synced to voice
  // "same templates" ~3s(90f), "same beam sections" ~4.5s(135f), "same rebar" ~6s(180f)
  const painPoints = [
    { text: "Same templates", start: 100 },
    { text: "Same beam sections", start: 150 },
    { text: "Same rebar schedules", start: 200 },
    { text: "Different numbers every time", start: 260 },
  ];

  // Cost stats — synced with "one drawing error costs $10K" ~12s(360f)
  // "one parameter change takes hours" ~16s(480f)
  // "75% still in AutoCAD" ~22s(660f)

  const fadeOut = interpolate(frame, [920, 960], [1, 0], {
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
      {/* "80%" big number */}
      <FadeIn startFrame={10}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span
            style={{
              fontSize: 160,
              fontWeight: 700,
              color: theme.error,
              lineHeight: 1,
              fontFamily: theme.fontMono,
            }}
          >
            {pct}%
          </span>
        </div>
      </FadeIn>

      {/* Progress bar */}
      <FadeIn startFrame={15}>
        <div
          style={{
            width: 640,
            height: 14,
            borderRadius: 7,
            background: theme.bgElevated,
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${barWidth}%`,
              height: "100%",
              borderRadius: 7,
              background: `linear-gradient(90deg, ${theme.error}, ${theme.amber})`,
            }}
          />
        </div>
      </FadeIn>

      <FadeIn startFrame={25}>
        <p style={{ fontSize: 28, color: theme.textSecondary, marginBottom: 36 }}>
          of an engineer's time goes to <strong style={{ color: theme.textPrimary }}>drafting</strong>
        </p>
      </FadeIn>

      {/* Pain point pills */}
      <div style={{ display: "flex", gap: 14, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
        {painPoints.map((item) => {
          const op = interpolate(frame, [item.start, item.start + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(frame, [item.start, item.start + 15], [12, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={item.text}
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                padding: "10px 24px",
                borderRadius: 10,
                border: `1px solid ${theme.borderDefault}`,
                background: theme.bgElevated,
                fontSize: 16,
                fontWeight: 500,
                color: theme.textSecondary,
              }}
            >
              {item.text}
            </div>
          );
        })}
      </div>

      {/* Cost stats row — appears later */}
      <div style={{ display: "flex", gap: 40, marginTop: 10 }}>
        {/* $10K error cost */}
        <FadeIn startFrame={360} slideY={10}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: theme.error, fontFamily: theme.fontMono }}>
              $10K+
            </div>
            <div style={{ fontSize: 14, color: theme.textTertiary, marginTop: 6 }}>
              cost per drawing error
            </div>
          </div>
        </FadeIn>

        {/* Hours per change */}
        <FadeIn startFrame={480} slideY={10}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: theme.amber, fontFamily: theme.fontMono }}>
              3+ days
            </div>
            <div style={{ fontSize: 14, color: theme.textTertiary, marginTop: 6 }}>
              per revision cycle
            </div>
          </div>
        </FadeIn>

        {/* 75% AutoCAD */}
        <FadeIn startFrame={660} slideY={10}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: theme.textPrimary, fontFamily: theme.fontMono }}>
              75%
            </div>
            <div style={{ fontSize: 14, color: theme.textTertiary, marginTop: 6 }}>
              still using manual AutoCAD
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};
