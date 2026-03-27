import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 8s = 240 frames

  const logoScale = interpolate(frame, [0, 25], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowSize = interpolate(frame, [20, 150], [0, 60], {
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
      {/* Logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          filter: `drop-shadow(0 0 ${glowSize}px rgba(120, 130, 255, 0.25))`,
          marginBottom: 32,
        }}
      >
        <Img
          src={staticFile("assets/logo.png")}
          style={{ width: 100, height: 100 }}
        />
      </div>

      <FadeIn startFrame={10} slideY={12}>
        <h1
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: theme.textPrimary,
            letterSpacing: "-1px",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Buildable
        </h1>
      </FadeIn>

      {/* Voice: "From description to drawing. In minutes, not weeks." */}
      <FadeIn startFrame={30}>
        <p
          style={{
            fontSize: 24,
            color: theme.textSecondary,
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 500,
          }}
        >
          From description to drawing.
          <br />
          <span style={{ color: theme.accent }}>In minutes, not weeks.</span>
        </p>
      </FadeIn>

      {/* Feature pills */}
      <FadeIn startFrame={60} slideY={10}>
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          {[
            { label: "2D Drawings", color: theme.accent },
            { label: "3D Models", color: theme.violet },
            { label: "Precast Concrete", color: theme.green },
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

      <FadeIn startFrame={90}>
        <p
          style={{
            marginTop: 50,
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
