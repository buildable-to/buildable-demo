import { useCurrentFrame, interpolate } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 16s = 480 frames

  // Counter animation: count up from 0 to 20 (frames 20-80)
  const count = Math.min(
    20,
    Math.floor(
      interpolate(frame, [20, 80], [0, 20], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // Progress bar
  const barWidth = interpolate(frame, [20, 85], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Second section: the bottleneck items appear one by one
  // Voice: "Connection details, fabrication plans, section views" starts ~8s in
  const items = [
    "Connection Details",
    "Fabrication Plans",
    "Section Views",
    "Rebar Schedules",
  ];

  // Fade out at end
  const fadeOut = interpolate(frame, [440, 480], [1, 0], {
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
      <FadeIn startFrame={0} slideY={10}>
        <p
          style={{
            fontSize: 16,
            color: theme.textTertiary,
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 40,
            fontWeight: 600,
          }}
        >
          The Bottleneck
        </p>
      </FadeIn>

      {/* Big number */}
      <FadeIn startFrame={10}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span
            style={{
              fontSize: 160,
              fontWeight: 700,
              color: theme.error,
              lineHeight: 1,
              fontFamily: theme.fontMono,
            }}
          >
            {count}
          </span>
          <span
            style={{
              fontSize: 52,
              color: theme.textTertiary,
              fontWeight: 300,
              marginLeft: 14,
            }}
          >
            / 25
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
            marginBottom: 36,
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

      {/* Description */}
      <FadeIn startFrame={30}>
        <p
          style={{
            fontSize: 28,
            color: theme.textSecondary,
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 700,
            marginBottom: 40,
          }}
        >
          days spent producing{" "}
          <strong style={{ color: theme.textPrimary }}>shop drawings</strong>{" "}
          after winning a precast contract
        </p>
      </FadeIn>

      {/* Bottleneck items — appear one by one synced with voice */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 10,
        }}
      >
        {items.map((item, i) => {
          // Items appear starting at ~frame 240 (8s), spaced 35 frames apart
          const itemStart = 240 + i * 35;
          const itemOpacity = interpolate(
            frame,
            [itemStart, itemStart + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const itemY = interpolate(
            frame,
            [itemStart, itemStart + 15],
            [12, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={item}
              style={{
                opacity: itemOpacity,
                transform: `translateY(${itemY}px)`,
                padding: "10px 24px",
                borderRadius: 10,
                border: `1px solid ${theme.borderDefault}`,
                background: theme.bgElevated,
                fontSize: 15,
                fontWeight: 500,
                color: theme.textSecondary,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};
