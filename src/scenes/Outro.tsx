import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 17s = 510 frames
  // Voice: "$150B industry. 80% of project time on repetitive drawings. Buildable. One description. Construction-ready output. In minutes."

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 25], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowSize = interpolate(frame, [20, 200], [0, 60], {
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
      }}
    >
      {/* $150B stat — first voice beat */}
      <FadeIn startFrame={5} slideY={10}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: theme.accent,
              fontFamily: theme.fontMono,
              lineHeight: 1,
            }}
          >
            $150B
          </span>
          <span style={{ fontSize: 22, color: theme.textTertiary }}>industry</span>
        </div>
      </FadeIn>

      {/* 80% stat */}
      <FadeIn startFrame={60}>
        <p style={{ fontSize: 20, color: theme.textSecondary, marginBottom: 48 }}>
          80% of project time spent on repetitive drawings
        </p>
      </FadeIn>

      {/* Logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          filter: `drop-shadow(0 0 ${glowSize}px rgba(120, 130, 255, 0.25))`,
          marginBottom: 24,
        }}
      >
        <Img src={staticFile("assets/logo.png")} style={{ width: 90, height: 90 }} />
      </div>

      {/* Buildable title */}
      <FadeIn startFrame={150} slideY={12}>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: theme.textPrimary,
            letterSpacing: "-1px",
            marginBottom: 16,
          }}
        >
          Buildable
        </h1>
      </FadeIn>

      {/* Tagline — matches voice */}
      <FadeIn startFrame={170}>
        <p style={{ fontSize: 24, color: theme.textSecondary, textAlign: "center", lineHeight: 1.6 }}>
          Accelerate precast engineering.
        </p>
      </FadeIn>

      <FadeIn startFrame={220}>
        <p style={{ fontSize: 28, color: theme.textPrimary, textAlign: "center", fontWeight: 600, marginTop: 8 }}>
          Stop redrawing. <span style={{ color: theme.accent }}>Start building.</span>
        </p>
      </FadeIn>

      {/* Feature pills */}
      <FadeIn startFrame={280} slideY={10}>
        <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
          {[
            { label: "2D Drawings", color: theme.accent },
            { label: "3D Models", color: theme.violet },
            { label: "Cost Estimation", color: theme.green },
          ].map((pill) => (
            <div
              key={pill.label}
              style={{
                padding: "8px 22px",
                borderRadius: 20,
                border: `1px solid ${pill.color}40`,
                background: `${pill.color}15`,
                fontSize: 15,
                fontWeight: 500,
                color: pill.color,
              }}
            >
              {pill.label}
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn startFrame={340}>
        <p
          style={{
            marginTop: 44,
            fontSize: 16,
            color: theme.textTertiary,
            fontFamily: theme.fontMono,
          }}
        >
          buildable.to
        </p>
      </FadeIn>
    </div>
  );
};
