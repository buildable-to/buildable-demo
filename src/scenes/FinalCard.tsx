import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const FinalCard: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 8s = 240 frames

  // Scene fade in (0-20)
  const sceneOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logo scale (10-35)
  const logoOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [10, 35], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logo glow expands (20-200)
  const glowSize = interpolate(frame, [20, 200], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out (218-240)
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
        opacity: sceneOpacity * fadeOut,
      }}
    >
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

      {/* Divider */}
      <FadeIn startFrame={30} slideY={0}>
        <div style={{ width: 80, height: 2, background: theme.borderDefault, margin: "32px 0" }} />
      </FadeIn>

      {/* Buildable title */}
      <FadeIn startFrame={100} slideY={20}>
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
      <FadeIn startFrame={40}>
        <p
          style={{
            fontSize: 52,
            color: theme.textSecondary,
            fontWeight: 300,
          }}
        >
          Win the project. Engineer it. Understand your business.
        </p>
      </FadeIn>

      {/* One platform */}
      <FadeIn startFrame={80} slideY={20}>
        <p
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: theme.textPrimary,
            marginTop: 16,
          }}
        >
          One platform.
        </p>
      </FadeIn>

      {/* URL */}
      <FadeIn startFrame={160}>
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
