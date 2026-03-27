import { useCurrentFrame, interpolate } from "remotion";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

// Isometric 3D building wireframe
const Building3D: React.FC<{ progress: number; frame: number }> = ({
  progress,
  frame,
}) => {
  const rotateY = interpolate(frame, [0, 400], [0, 6], {
    extrapolateRight: "clamp",
  });

  return (
    <svg viewBox="0 0 500 450" width="100%" height="100%">
      <g
        transform={`translate(250, 225) rotate(${rotateY}) translate(-250, -225)`}
      >
        {/* Floor slab */}
        {progress > 0.05 && (
          <g
            opacity={interpolate(progress, [0.05, 0.15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            <path
              d="M100,320 L250,380 L400,320 L250,260 Z"
              fill="rgba(139,141,154,0.15)"
              stroke="#8B8D9A"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Columns */}
        {[
          [145, 280],
          [250, 250],
          [355, 280],
          [250, 310],
        ].map(([x, baseY], i) => {
          const colStart = 0.15 + i * 0.08;
          const colHeight = interpolate(
            progress,
            [colStart, colStart + 0.15],
            [0, 140],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <g key={i}>
              <line
                x1={x}
                y1={baseY}
                x2={x}
                y2={baseY - colHeight}
                stroke="#E8E9ED"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {colHeight > 5 && (
                <rect
                  x={x! - 6}
                  y={baseY - 3}
                  width="12"
                  height="6"
                  fill="#8B8D9A"
                  rx="1"
                />
              )}
            </g>
          );
        })}

        {/* Beams */}
        {progress > 0.55 && (
          <g
            opacity={interpolate(progress, [0.55, 0.7], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            <line x1="145" y1="140" x2="355" y2="140" stroke="#4F8FF7" strokeWidth="2.5" />
            <line x1="145" y1="140" x2="250" y2="110" stroke="#4F8FF7" strokeWidth="2" />
            <line x1="355" y1="140" x2="250" y2="110" stroke="#4F8FF7" strokeWidth="2" />
            <line x1="145" y1="140" x2="250" y2="170" stroke="#4F8FF7" strokeWidth="2" />
            <line x1="355" y1="140" x2="250" y2="170" stroke="#4F8FF7" strokeWidth="2" />
          </g>
        )}

        {/* Roof slab */}
        {progress > 0.7 && (
          <g
            opacity={interpolate(progress, [0.7, 0.85], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            <path
              d="M120,140 L250,100 L380,140 L250,180 Z"
              fill="rgba(79,143,247,0.1)"
              stroke="#4F8FF7"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Rebar hints */}
        {progress > 0.85 && (
          <g
            opacity={interpolate(progress, [0.85, 1], [0, 0.8], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            {[145, 250, 355].map((x, i) => (
              <line
                key={i}
                x1={x}
                y1="280"
                x2={x}
                y2="145"
                stroke="#F87171"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
};

export const ModelingStudio: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 16s = 480 frames

  const uiOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Building progress
  const buildProgress = interpolate(frame, [40, 280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // X-ray mode switch — voice says "toggle x-ray" ~10s in (frame 300)
  const xrayStart = 300;
  const isXray = frame > xrayStart;
  const xrayOpacity = interpolate(frame, [xrayStart, xrayStart + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
            background: `linear-gradient(135deg, ${theme.violet}, #7c5ce0)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>B</span>
        </div>
        <span
          style={{
            color: theme.textPrimary,
            fontWeight: 600,
            fontSize: 14,
            marginRight: 12,
          }}
        >
          Buildable
        </span>
        <span style={{ color: theme.borderStrong, margin: "0 8px" }}>|</span>
        <span style={{ color: theme.textSecondary, fontSize: 13 }}>
          3D Modeling Studio
        </span>

        {/* View mode buttons */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 2,
            background: theme.bgElevated,
            borderRadius: 8,
            padding: 2,
            border: `1px solid ${theme.borderSubtle}`,
          }}
        >
          {["Normal", "X-Ray", "Rebar"].map((mode, i) => (
            <div
              key={mode}
              style={{
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 500,
                borderRadius: 6,
                color:
                  (i === 0 && !isXray) || (i === 1 && isXray)
                    ? theme.textPrimary
                    : theme.textTertiary,
                background:
                  (i === 0 && !isXray) || (i === 1 && isXray)
                    ? theme.bgActive
                    : "transparent",
              }}
            >
              {mode}
            </div>
          ))}
        </div>
      </div>

      {/* Left sidebar — Models */}
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
          Models
        </div>

        {buildProgress > 0.3 && (
          <FadeIn startFrame={80} slideY={5}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                fontSize: 12,
                color: theme.textPrimary,
                background: theme.bgActive,
                borderLeft: `2px solid ${theme.violet}`,
              }}
            >
              <span style={{ marginRight: 8, fontSize: 14 }}>📦</span>
              Warehouse Frame
            </div>
          </FadeIn>
        )}

        {/* Source code preview */}
        {buildProgress > 0.6 && (
          <FadeIn startFrame={160} slideY={5}>
            <div style={{ padding: "12px", marginTop: 8 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: theme.textTertiary,
                  marginBottom: 6,
                }}
              >
                source.py
              </div>
              <div
                style={{
                  background: theme.bgVoid,
                  borderRadius: 6,
                  padding: 8,
                  fontSize: 9,
                  fontFamily: theme.fontMono,
                  color: theme.textTertiary,
                  lineHeight: 1.6,
                  overflow: "hidden",
                  maxHeight: 120,
                }}
              >
                <span style={{ color: "#c678dd" }}>import</span>{" "}
                <span style={{ color: theme.textSecondary }}>FreeCAD</span>
                <br />
                <span style={{ color: "#c678dd" }}>import</span>{" "}
                <span style={{ color: theme.textSecondary }}>Part</span>
                <br />
                <br />
                <span style={{ color: theme.textGhost }}># Create columns</span>
                <br />
                <span style={{ color: "#e5c07b" }}>col</span>
                <span style={{ color: theme.textTertiary }}> = Part.makeBox(</span>
                <br />
                <span style={{ color: "#d19a66" }}>{"  "}400, 400, 3500</span>
                <span style={{ color: theme.textTertiary }}>)</span>
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* Center — 3D Viewport */}
      <div
        style={{
          flex: 1,
          marginTop: 44,
          background: isXray
            ? `linear-gradient(180deg, #0d1520, ${theme.bgViewport})`
            : theme.bgViewport,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Grid floor */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            opacity: 0.05,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            transform: "perspective(600px) rotateX(60deg)",
            transformOrigin: "bottom",
          }}
        />

        {/* 3D Building */}
        <div
          style={{
            width: 500,
            height: 450,
            opacity: isXray ? 0.6 : 1,
          }}
        >
          <Building3D progress={buildProgress} frame={frame} />
        </div>

        {/* X-Ray label */}
        {isXray && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              fontSize: 11,
              fontFamily: theme.fontMono,
              color: theme.violet,
              background: "rgba(155, 122, 255, 0.1)",
              border: "1px solid rgba(155, 122, 255, 0.3)",
              padding: "4px 10px",
              borderRadius: 6,
              opacity: xrayOpacity,
            }}
          >
            X-RAY MODE
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
          <span style={{ color: theme.violet }}>●</span> AI Assistant
        </div>

        <div style={{ flex: 1, padding: "8px 16px" }}>
          {/* User message */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                background: theme.violet,
                color: "white",
                padding: "10px 14px",
                borderRadius: "16px 16px 4px 16px",
                fontSize: 13,
                maxWidth: "85%",
                lineHeight: 1.5,
              }}
            >
              Build a precast warehouse frame — 4 columns, beams, and a roof slab
            </div>
          </div>

          {/* Agent response */}
          {frame > 40 && (
            <FadeIn startFrame={40} slideY={6}>
              <div
                style={{
                  borderLeft: "2px solid rgba(155, 122, 255, 0.4)",
                  padding: "8px 12px",
                }}
              >
                {frame < 160 ? (
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: theme.fontMono,
                      color: theme.textTertiary,
                      background: theme.bgElevated,
                      border: `1px solid ${theme.borderSubtle}`,
                      padding: "6px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {frame < 80
                      ? "⚙ Writing source.py with FreeCAD API..."
                      : "⚙ Running FreeCADCmd..."}
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: 13,
                      color: theme.textSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    I've created a{" "}
                    <strong style={{ color: theme.textPrimary }}>
                      warehouse frame
                    </strong>{" "}
                    with 4 precast columns (400×400mm), connecting beams, and a
                    roof slab. Try{" "}
                    <strong style={{ color: theme.violet }}>X-Ray mode</strong>{" "}
                    to see the rebar layout.
                  </p>
                )}
              </div>
            </FadeIn>
          )}
        </div>

        {/* Chat input */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: `1px solid ${theme.borderFaint}`,
          }}
        >
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
            <span>Describe a 3D model...</span>
            <span style={{ color: theme.violet, fontSize: 16 }}>↑</span>
          </div>
        </div>
      </div>
    </div>
  );
};
