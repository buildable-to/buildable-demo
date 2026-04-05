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
        // Fix the SVG for embedding: scale to fit container and fix background
        let svg = text;
        // Strip mm width/height attrs and add CSS sizing so viewBox scales properly
        svg = svg.replace(/width="9264\.4mm"/, '');
        svg = svg.replace(/height="3809\.3mm"/, '');
        svg = svg.replace(/<svg/, '<svg style="width:100%;height:100%;display:block"');
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
    [400,    80,     80,      -240,    -240,    -360,    0,       0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const svgPanY = interpolate(
    frame,
    [t + 30, t + 80, t + 200, t + 240, t + 360, t + 400, t + 500, 1040],
    [0,      0,      0,       -20,     -20,     -20,     0,       0],
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
          height: 88,
          background: theme.bgSidebar,
          borderBottom: `2px solid ${theme.borderDefault}`,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          zIndex: 10,
        }}
      >
        <Img
          src={staticFile("assets/logo.png")}
          style={{ width: 56, height: 56, marginRight: 20 }}
        />
        <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 28, marginRight: 24 }}>
          Buildable
        </span>
        <span style={{ color: theme.borderStrong, margin: "0 16px" }}>|</span>
        <span style={{ color: theme.textSecondary, fontSize: 26 }}>Design Studio</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              background: theme.accentGlow,
              border: `2px solid ${theme.accentDim}`,
              borderRadius: 24,
              padding: "6px 24px",
              fontSize: 22,
              color: theme.accent,
              fontWeight: 500,
            }}
          >
            Claude Sonnet
          </div>
          <div
            style={{
              background: theme.accent,
              borderRadius: 12,
              padding: "10px 28px",
              fontSize: 24,
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
          width: 400,
          marginTop: 88,
          background: theme.bgSidebar,
          borderRight: `2px solid ${theme.borderDefault}`,
          padding: "24px 0",
        }}
      >
        <div
          style={{
            padding: "0 24px 16px",
            fontSize: 20,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 3,
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
              padding: "12px 24px",
              fontSize: 22,
              fontFamily: theme.fontMono,
              color: theme.textSecondary,
              opacity: layerAppear(i),
              transform: `translateX(${(1 - layerAppear(i)) * -40}px)`,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: layer.color,
                marginRight: 16,
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
          marginTop: 88,
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
            backgroundSize: "80px 80px",
          }}
        />

        {/* Real SVG drawing */}
        {svgReveal > 0 && svgContent && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              clipPath: `inset(0 ${100 - svgReveal}% 0 0)`,
              transform: `scale(${svgScale}) translate(${svgPanX}px, ${svgPanY}px)`,
            }}
          >
            <div
              style={{
                width: "95%",
                height: "85%",
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        )}

        {/* Empty state */}
        {svgReveal <= 0 && (
          <div style={{ textAlign: "center", color: theme.textTertiary }}>
            <div style={{ fontSize: 96, marginBottom: 24, opacity: 0.3 }}>⬡</div>
            <p style={{ fontSize: 32 }}>Start designing</p>
            <p style={{ fontSize: 24, color: theme.textGhost, marginTop: 8 }}>
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
              height: 64,
              background: theme.bgSidebar,
              borderTop: `2px solid ${theme.borderDefault}`,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              opacity: interpolate(svgReveal, [30, 50], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                padding: "8px 28px",
                fontSize: 22,
                fontFamily: theme.fontMono,
                color: theme.accent,
                borderTop: `4px solid ${theme.accent}`,
                background: theme.bgActive,
                borderRadius: "0 0 8px 8px",
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
          width: 800,
          marginTop: 88,
          background: theme.bgSurface,
          borderLeft: `2px solid ${theme.borderDefault}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "24px 32px 16px",
            fontSize: 20,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 3,
            color: theme.textTertiary,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ color: theme.accent }}>●</span> AI Assistant
        </div>

        <div style={{ flex: 1, padding: "16px 32px", overflow: "hidden" }}>
          {/* User message */}
          {frame > typingStart && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
              <div
                style={{
                  background: theme.accent,
                  color: "white",
                  padding: "20px 28px",
                  borderRadius: "32px 32px 8px 32px",
                  fontSize: 26,
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
            <FadeIn startFrame={thinkingStart} slideY={12}>
              <div
                style={{
                  borderLeft: `4px solid ${theme.accentDim}`,
                  padding: "16px 24px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontFamily: theme.fontMono,
                    color: theme.textTertiary,
                    background: theme.bgElevated,
                    border: `2px solid ${theme.borderSubtle}`,
                    padding: "12px 20px",
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  {frame < thinkingStart + 30
                    ? "⚙ Writing drawing.py..."
                    : frame < thinkingStart + 80
                      ? "⚙ Running script..."
                      : "✓ Drawing complete"}
                </div>

                {frame > thinkingStart + 100 && (
                  <FadeIn startFrame={thinkingStart + 100} slideY={8}>
                    <p style={{ fontSize: 26, color: theme.textSecondary, lineHeight: 1.6 }}>
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
        <div style={{ padding: "24px 32px", borderTop: `2px solid ${theme.borderFaint}` }}>
          <div
            style={{
              background: theme.bgElevated,
              border: `2px solid ${theme.borderDefault}`,
              borderRadius: 24,
              padding: "20px 28px",
              fontSize: 26,
              color: theme.textGhost,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Describe a structural element...</span>
            <span style={{ color: theme.accent, fontSize: 32 }}>↑</span>
          </div>
        </div>
      </div>
    </div>
  );
};
