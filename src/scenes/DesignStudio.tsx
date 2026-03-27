import { useCurrentFrame, interpolate } from "remotion";
import { TypeWriter } from "../components/TypeWriter";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

// Simulated column cross-section SVG drawing
const ColumnDrawingSvg: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      {/* Concrete outline */}
      {progress > 0.05 && (
        <rect
          x="80"
          y="80"
          width="240"
          height="240"
          fill="none"
          stroke="#E8E9ED"
          strokeWidth="2"
          strokeDasharray="960"
          strokeDashoffset={interpolate(
            progress,
            [0.05, 0.3],
            [960, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )}
        />
      )}

      {/* Rebar circles — 8 rebars */}
      {[
        [120, 120],
        [200, 120],
        [280, 120],
        [120, 200],
        [280, 200],
        [120, 280],
        [200, 280],
        [280, 280],
      ].map(([cx, cy], i) => {
        const rebarStart = 0.3 + i * 0.06;
        const rebarProgress = interpolate(
          progress,
          [rebarStart, rebarStart + 0.08],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="14"
            fill={
              rebarProgress > 0
                ? `rgba(248, 113, 113, ${rebarProgress})`
                : "none"
            }
            stroke="#F87171"
            strokeWidth="2"
            opacity={rebarProgress}
          />
        );
      })}

      {/* Stirrup (rectangle inside) */}
      {progress > 0.7 && (
        <rect
          x="100"
          y="100"
          width="200"
          height="200"
          fill="none"
          stroke="#34D399"
          strokeWidth="1.5"
          strokeDasharray="800"
          strokeDashoffset={interpolate(
            progress,
            [0.7, 0.95],
            [800, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )}
        />
      )}

      {/* Dimension lines */}
      {progress > 0.85 && (
        <g
          opacity={interpolate(progress, [0.85, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        >
          {/* Bottom dimension */}
          <line x1="80" y1="345" x2="320" y2="345" stroke="#FBBF24" strokeWidth="1" />
          <line x1="80" y1="335" x2="80" y2="355" stroke="#FBBF24" strokeWidth="1" />
          <line x1="320" y1="335" x2="320" y2="355" stroke="#FBBF24" strokeWidth="1" />
          <text x="200" y="365" textAnchor="middle" fill="#FBBF24" fontSize="14" fontFamily="JetBrains Mono, monospace">
            600 mm
          </text>

          {/* Right dimension */}
          <line x1="345" y1="80" x2="345" y2="320" stroke="#FBBF24" strokeWidth="1" />
          <line x1="335" y1="80" x2="355" y2="80" stroke="#FBBF24" strokeWidth="1" />
          <line x1="335" y1="320" x2="355" y2="320" stroke="#FBBF24" strokeWidth="1" />
          <text
            x="370"
            y="205"
            textAnchor="middle"
            fill="#FBBF24"
            fontSize="14"
            fontFamily="JetBrains Mono, monospace"
            transform="rotate(90, 370, 200)"
          >
            600 mm
          </text>
        </g>
      )}
    </svg>
  );
};

export const DesignStudio: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 18s = 540 frames

  // UI fade in
  const uiOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Voice: "you simply describe what you need" (~2s in)
  // Typing starts at frame 50 (~1.7s)
  const userMessage =
    "Design a 600mm precast column cross-section with 8 #8 rebars and stirrups at 150mm spacing";

  const typingStart = 50;
  const typingDone = typingStart + userMessage.length / 0.8;

  // Agent thinking starts after typing (~frame 170)
  const thinkingStart = typingDone + 15;

  // Drawing animation — starts ~frame 220, spans to ~frame 420
  const drawingProgress = interpolate(
    frame,
    [thinkingStart + 40, thinkingStart + 200],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Layer items appear as drawing progresses
  const layerAppear = (index: number) =>
    interpolate(
      frame,
      [thinkingStart + 70 + index * 30, thinkingStart + 90 + index * 30],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

  // Fade out at end
  const fadeOut = interpolate(frame, [500, 540], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.bgApp,
        display: "flex",
        fontFamily: theme.fontUi,
        opacity: uiOpacity * fadeOut,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          background: theme.bgSidebar,
          borderBottom: `1px solid ${theme.borderDefault}`,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDim})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>B</span>
        </div>
        <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 14, marginRight: 12 }}>
          Buildable
        </span>
        <span style={{ color: theme.borderStrong, margin: "0 8px" }}>|</span>
        <span style={{ color: theme.textSecondary, fontSize: 13 }}>Design Studio</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              background: theme.accentGlow,
              border: `1px solid ${theme.accentDim}`,
              borderRadius: 12,
              padding: "3px 12px",
              fontSize: 11,
              color: theme.accent,
              fontWeight: 500,
            }}
          >
            Claude Sonnet
          </div>
          <div
            style={{
              background: theme.accent,
              borderRadius: 6,
              padding: "5px 14px",
              fontSize: 12,
              color: "white",
              fontWeight: 500,
            }}
          >
            Download DXF
          </div>
        </div>
      </div>

      {/* Left sidebar — Layers */}
      <div
        style={{
          width: 200,
          marginTop: 44,
          background: theme.bgSidebar,
          borderRight: `1px solid ${theme.borderDefault}`,
          padding: "12px 0",
        }}
      >
        <div
          style={{
            padding: "0 12px 8px",
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: theme.textTertiary,
          }}
        >
          Layers
        </div>

        {[
          { name: "CONCRETE", color: "#E8E9ED", index: 0 },
          { name: "REBAR", color: "#F87171", index: 1 },
          { name: "STIRRUPS", color: "#34D399", index: 2 },
          { name: "DIMS", color: "#FBBF24", index: 3 },
        ].map((layer) => (
          <div
            key={layer.name}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 12px",
              fontSize: 11,
              fontFamily: theme.fontMono,
              color: theme.textSecondary,
              opacity: layerAppear(layer.index),
              transform: `translateX(${(1 - layerAppear(layer.index)) * -10}px)`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: layer.color,
                marginRight: 8,
                flexShrink: 0,
              }}
            />
            {layer.name}
          </div>
        ))}
      </div>

      {/* Center — Viewport */}
      <div
        style={{
          flex: 1,
          marginTop: 44,
          background: theme.bgViewport,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Drawing */}
        {drawingProgress > 0 && (
          <div style={{ width: 400, height: 400 }}>
            <ColumnDrawingSvg progress={drawingProgress} />
          </div>
        )}

        {/* Empty state */}
        {drawingProgress <= 0 && (
          <div style={{ textAlign: "center", color: theme.textTertiary }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>⬡</div>
            <p style={{ fontSize: 16 }}>Start designing</p>
            <p style={{ fontSize: 12, color: theme.textGhost, marginTop: 4 }}>
              Describe any structural element in the chat
            </p>
          </div>
        )}

        {/* Sheet tab */}
        {drawingProgress > 0.5 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 32,
              background: theme.bgSidebar,
              borderTop: `1px solid ${theme.borderDefault}`,
              display: "flex",
              alignItems: "center",
              padding: "0 8px",
              opacity: interpolate(drawingProgress, [0.5, 0.6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                padding: "4px 14px",
                fontSize: 11,
                fontFamily: theme.fontMono,
                color: theme.accent,
                borderTop: `2px solid ${theme.accent}`,
                background: theme.bgActive,
                borderRadius: "0 0 4px 4px",
              }}
            >
              COLUMN CROSS SECTION
            </div>
          </div>
        )}
      </div>

      {/* Right — Chat Panel */}
      <div
        style={{
          width: 400,
          marginTop: 44,
          background: theme.bgSurface,
          borderLeft: `1px solid ${theme.borderDefault}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "12px 16px 8px",
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: theme.textTertiary,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: theme.accent }}>●</span> AI Assistant
        </div>

        <div style={{ flex: 1, padding: "8px 16px", overflow: "hidden" }}>
          {/* User message bubble */}
          {frame > typingStart && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <div
                style={{
                  background: theme.accent,
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: "16px 16px 4px 16px",
                  fontSize: 13,
                  maxWidth: "85%",
                  lineHeight: 1.5,
                }}
              >
                <TypeWriter
                  text={userMessage}
                  startFrame={typingStart}
                  charsPerFrame={0.8}
                  style={{ color: "white" }}
                  cursorColor="white"
                />
              </div>
            </div>
          )}

          {/* Agent thinking */}
          {frame > thinkingStart && (
            <FadeIn startFrame={thinkingStart} slideY={6}>
              <div
                style={{
                  borderLeft: `2px solid ${theme.accentDim}`,
                  padding: "8px 12px",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: theme.fontMono,
                    color: theme.textTertiary,
                    background: theme.bgElevated,
                    border: `1px solid ${theme.borderSubtle}`,
                    padding: "6px 10px",
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  {frame < thinkingStart + 40
                    ? "⚙ Writing drawing.py..."
                    : frame < thinkingStart + 120
                      ? "⚙ Running script..."
                      : "⚙ Rendering drawing..."}
                </div>

                {/* Final response */}
                {frame > thinkingStart + 160 && (
                  <FadeIn startFrame={thinkingStart + 160} slideY={4}>
                    <p style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 }}>
                      I've created a{" "}
                      <strong style={{ color: theme.textPrimary }}>
                        600mm precast column cross-section
                      </strong>{" "}
                      with 8 #8 rebars in a square arrangement and stirrups at 150mm
                      spacing. All layers follow standard CAD conventions.
                    </p>
                  </FadeIn>
                )}
              </div>
            </FadeIn>
          )}
        </div>

        {/* Chat input */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${theme.borderFaint}` }}>
          <div
            style={{
              background: theme.bgElevated,
              border: `1px solid ${theme.borderDefault}`,
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              color: theme.textGhost,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Describe a structural element...</span>
            <span style={{ color: theme.accent, fontSize: 16 }}>↑</span>
          </div>
        </div>
      </div>
    </div>
  );
};
