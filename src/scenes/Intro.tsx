import { useCurrentFrame, interpolate } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // Logo scale: pop in 0→25
  const logoScale = interpolate(frame, [0, 25], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse
  const glowSize = interpolate(frame, [20, 90], [0, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at end
  const fadeOut = interpolate(frame, [180, 210], [1, 0], {
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
      {/* Logo box */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          width: 110,
          height: 110,
          borderRadius: 22,
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDim})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 ${glowSize}px ${glowSize / 2}px ${theme.accentGlowStrong}`,
          marginBottom: 36,
        }}
      >
        <span
          style={{
            fontSize: 62,
            fontWeight: 700,
            color: "white",
            fontFamily: theme.fontUi,
            lineHeight: 1,
          }}
        >
          B
        </span>
      </div>

      {/* Title */}
      <FadeIn startFrame={25} slideY={15}>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: theme.textPrimary,
            letterSpacing: "-1.5px",
            marginBottom: 16,
          }}
        >
          Buildable
        </h1>
      </FadeIn>

      {/* Tagline — synced with voice: "AI-powered design for precast concrete" */}
      <FadeIn startFrame={55}>
        <p
          style={{
            fontSize: 26,
            color: theme.textSecondary,
            fontWeight: 400,
          }}
        >
          AI-powered design for precast concrete
        </p>
      </FadeIn>
    </div>
  );
};
