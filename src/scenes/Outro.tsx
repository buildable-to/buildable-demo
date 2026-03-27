import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 14s = 420 frames

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 25], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowSize = interpolate(frame, [20, 200], [0, 100], {
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
      {/* $150B stat */}
      <FadeIn startFrame={5} slideY={20}>
        <p style={{ fontSize: 40, color: theme.textTertiary, marginBottom: 8, fontWeight: 400, letterSpacing: "1px" }}>
          A <span style={{ fontFamily: theme.fontMono, fontWeight: 600, color: theme.textSecondary }}>$150B</span> industry.{" "}
          <span style={{ fontFamily: theme.fontMono, fontWeight: 600, color: theme.textSecondary }}>80%</span> of time on repetitive drawings.
        </p>
      </FadeIn>

      {/* Divider */}
      <FadeIn startFrame={60}>
        <div style={{ width: 80, height: 2, background: theme.borderDefault, margin: "56px 0" }} />
      </FadeIn>

      {/* Logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          filter: `drop-shadow(0 0 ${glowSize}px ${theme.accentGlowStrong})`,
          marginBottom: 40,
        }}
      >
        <Img src={staticFile("assets/logo.png")} style={{ width: 160, height: 160 }} />
      </div>

      {/* Buildable title */}
      <FadeIn startFrame={120} slideY={20}>
        <h1
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: theme.textPrimary,
            letterSpacing: "-3px",
            marginBottom: 24,
          }}
        >
          Buildable
        </h1>
      </FadeIn>

      {/* Tagline */}
      <FadeIn startFrame={150}>
        <p style={{ fontSize: 44, color: theme.textTertiary, fontWeight: 300 }}>
          Accelerate precast engineering.
        </p>
      </FadeIn>

      <FadeIn startFrame={195}>
        <p style={{ fontSize: 52, color: theme.textPrimary, fontWeight: 500, marginTop: 16 }}>
          Reduce project timelines 2-3x.
        </p>
      </FadeIn>

      <FadeIn startFrame={270}>
        <p
          style={{
            marginTop: 96,
            fontSize: 30,
            color: theme.textGhost,
            fontFamily: theme.fontMono,
            fontWeight: 400,
          }}
        >
          buildable.to
        </p>
      </FadeIn>
    </div>
  );
};
