import React, { useEffect, useState } from "react";
import { useCurrentFrame, interpolate, staticFile, continueRender, delayRender, Img } from "remotion";
import { TypeWriter } from "../components/TypeWriter";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

export const RealDesignStudio: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 37s = 1110 frames

  const [svgContent, setSvgContent] = useState<string>("");
  const [handle] = useState(() => delayRender("Loading SVG"));

  useEffect(() => {
    fetch(staticFile("assets/beam-2d.svg"))
      .then((res) => res.text())
      .then((text) => {
        // Fix the SVG for embedding: override background, adjust sizing
        let svg = text;
        // Remove the transparent background rect
        svg = svg.replace(/fill-opacity="0\.0"/, 'fill-opacity="1.0"');
        setSvgContent(svg);
        continueRender(handle);
      })
      .catch(() => {
        continueRender(handle);
      });
  }, [handle]);

  // UI fade in
  const uiOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // User types message starting at frame 50
  const userMessage = "Design a rectangular precast beam detail with rebars, stirrups, dimensions and cross-sections";
  const typingStart = 50;
  const typingDone = typingStart + userMessage.length / 0.8;
  const thinkingStart = typingDone + 15;

  // SVG staged reveal — show views one by one
  // View 1: Elevation (0-70%) — reveal + hold
  // View 2: Cross-section A (72-82%) — reveal + hold
  // View 3: Cross-section B + details (85-100%) — reveal to full
  const t = thinkingStart;
  const svgReveal = interpolate(
    frame,
    [
      t + 30,  t + 120,   // View 1: elevation sweeps in
      t + 200, t + 260,   // View 2: first cross-section appears
      t + 360, t + 420,   // View 3: second cross-section + details
    ],
    [0, 72, 72, 84, 84, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pan & zoom — focus on each view as it appears, then pull back to full
  const svgScale = interpolate(
    frame,
    [t + 30, t + 80, t + 200, t + 240, t + 360, t + 400, t + 500, 1040],
    [1.8,    1.3,    1.3,     1.5,     1.5,     1.3,     1.05,   1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const svgPanX = interpolate(
    frame,
    [t + 30, t + 80, t + 200, t + 240, t + 360, t + 400, t + 500, 1040],
    [200,    40,     40,      -120,    -120,    -180,    0,       0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const svgPanY = interpolate(
    frame,
    [t + 30, t + 80, t + 200, t + 240, t + 360, t + 400, t + 500, 1040],
    [0,      0,      0,       -10,     -10,     -10,     0,       0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Layer items
  const layerAppear = (index: number) =>
    interpolate(
      frame,
      [thinkingStart + 50 + index * 25, thinkingStart + 70 + index * 25],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

  // Fade out at end
  const fadeOut = interpolate(frame, [1088, 1110], [1, 0], {
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
        <Img
          src={staticFile("assets/logo.png")}
          style={{ width: 28, height: 28, marginRight: 10 }}
        />
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
          { name: "CONCRETE", color: "#FFFFFF" },
          { name: "REBAR", color: "#FF0000" },
          { name: "STIRRUPS", color: "#0000FF" },
          { name: "DIMS", color: "#FBBF24" },
          { name: "TEXT", color: "#808080" },
          { name: "CENTERLINE", color: "#666666" },
        ].map((layer, i) => (
          <div
            key={layer.name}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 12px",
              fontSize: 11,
              fontFamily: theme.fontMono,
              color: theme.textSecondary,
              opacity: layerAppear(i),
              transform: `translateX(${(1 - layerAppear(i)) * -10}px)`,
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

      {/* Center — Viewport with real SVG */}
      <div
        style={{
          flex: 1,
          marginTop: 44,
          background: theme.bgViewport,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Real SVG drawing */}
        {svgReveal > 0 && svgContent && (
          <div
            style={{
              width: "95%",
              height: "85%",
              clipPath: `inset(0 ${100 - svgReveal}% 0 0)`,
              transform: `scale(${svgScale}) translate(${svgPanX}px, ${svgPanY}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {/* Empty state */}
        {svgReveal <= 0 && (
          <div style={{ textAlign: "center", color: theme.textTertiary }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>⬡</div>
            <p style={{ fontSize: 16 }}>Start designing</p>
            <p style={{ fontSize: 12, color: theme.textGhost, marginTop: 4 }}>
              Describe any structural element in the chat
            </p>
          </div>
        )}

        {/* Sheet tab */}
        {svgReveal > 30 && (
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
              opacity: interpolate(svgReveal, [30, 50], [0, 1], {
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
              RECTANGULAR BEAM — DETAIL
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
          {/* User message */}
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

          {/* Agent working */}
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
                  {frame < thinkingStart + 30
                    ? "⚙ Writing drawing.py..."
                    : frame < thinkingStart + 80
                      ? "⚙ Running script..."
                      : "✓ Drawing complete"}
                </div>

                {frame > thinkingStart + 100 && (
                  <FadeIn startFrame={thinkingStart + 100} slideY={4}>
                    <p style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 }}>
                      Done. <strong style={{ color: theme.textPrimary }}>Rectangular beam detail</strong> — elevation
                      view, cross-sections, rebar layout, stirrup spacing, and full dimensioning.
                      All layers follow standard conventions. Ready for production.
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
