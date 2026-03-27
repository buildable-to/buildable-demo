import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 10s = 300 frames
  // Voice: "Two months of drawings. Fifteen days of construction. That's the reality of precast concrete today."

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
  const fadeOut = interpolate(frame, [260, 300], [1, 0], {
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
          marginBottom: 40,
        }}
      >
        <Img src={staticFile("assets/logo.png")} style={{ width: 120, height: 120 }} />
      </div>

      {/* "2 months" — synced with voice beat 1 */}
      <FadeIn startFrame={15} slideY={15}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: theme.error,
              fontFamily: theme.fontMono,
              lineHeight: 1,
            }}
          >
            2 months
          </span>
          <span style={{ fontSize: 28, color: theme.textTertiary }}>of drawings</span>
        </div>
      </FadeIn>

      {/* "15 days" — synced with voice beat 2 */}
      <FadeIn startFrame={65} slideY={15}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 32 }}>
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: theme.green,
              fontFamily: theme.fontMono,
              lineHeight: 1,
            }}
          >
            15 days
          </span>
          <span style={{ fontSize: 28, color: theme.textTertiary }}>of construction</span>
        </div>
      </FadeIn>

      {/* "That's the reality" — voice beat 3 */}
      <FadeIn startFrame={130}>
        <p style={{ fontSize: 22, color: theme.textSecondary, fontWeight: 400 }}>
          That's the reality of precast concrete today.
        </p>
      </FadeIn>
    </div>
  );
};
