import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 8s = 240 frames

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 25], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glowSize = interpolate(frame, [20, 120], [0, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [218, 240], [1, 0], {
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
        opacity: fadeOut,
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          filter: `drop-shadow(0 0 ${glowSize}px ${theme.accentGlowStrong})`,
          marginBottom: 48,
        }}
      >
        <Img src={staticFile("assets/logo.png")} style={{ width: 100, height: 100 }} />
      </div>

      {/* "2 months of drawings" */}
      <FadeIn startFrame={15} slideY={12}>
        <p style={{ fontSize: 52, fontWeight: 300, color: theme.textPrimary, letterSpacing: "-0.5px", lineHeight: 1.3 }}>
          <span style={{ fontWeight: 700, fontFamily: theme.fontMono, fontSize: 56 }}>2 months</span>
          {" "}of drawings.
        </p>
      </FadeIn>

      {/* "15 days of construction" */}
      <FadeIn startFrame={55} slideY={12}>
        <p style={{ fontSize: 52, fontWeight: 300, color: theme.textPrimary, letterSpacing: "-0.5px", lineHeight: 1.3, marginTop: 4 }}>
          <span style={{ fontWeight: 700, fontFamily: theme.fontMono, fontSize: 56 }}>15 days</span>
          {" "}of construction.
        </p>
      </FadeIn>

      {/* Subtle divider line */}
      <FadeIn startFrame={105}>
        <div style={{ width: 60, height: 1, background: theme.borderDefault, margin: "28px 0" }} />
      </FadeIn>

      {/* "That's the reality" */}
      <FadeIn startFrame={115}>
        <p style={{ fontSize: 20, color: theme.textTertiary, fontWeight: 400, letterSpacing: "0.3px" }}>
          The reality of precast concrete today.
        </p>
      </FadeIn>
    </div>
  );
};
