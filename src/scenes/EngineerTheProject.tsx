import React from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { TypeWriter } from "../components/TypeWriter";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

// ── Frame ranges ────────────────────────────────────────────────────
const P1_START = 0;
const P2_START = 150;
const P3_START = 300;
const P4_START = 660;
const P5_START = 900;
const P6_START = 1140;
const P7_START = 1260;
const P8_START = 1440;

const TOTAL_FRAMES = 1650;

// ── Helper: clamp shortcut ──────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ── Animated Cursor ─────────────────────────────────────────────────
const Cursor: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) => (
  <svg
    width="32"
    height="40"
    viewBox="0 0 24 32"
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      pointerEvents: "none",
      zIndex: 100,
      filter: "drop-shadow(2px 3px 4px rgba(0,0,0,0.5))",
    }}
  >
    <path d="M2 2 L2 26 L9 20 L15 30 L19 28 L13 18 L22 16 Z" fill="white" stroke="#111" strokeWidth="1.5" />
  </svg>
);

// ── Wall Panel SVG ──────────────────────────────────────────────────
const WallPanelSVG: React.FC<{
  frame: number;
  showRebar: boolean;
  rebarCount: number;
  rebarStartFrame: number;
  showChamfer: boolean;
  chamferProgress: number;
  spacingLabel: string;
  showBom: boolean;
  bomWeight: number;
  windowY: number;
  panelId: string;
}> = ({
  frame,
  showRebar,
  rebarCount,
  rebarStartFrame,
  showChamfer,
  chamferProgress,
  spacingLabel,
  showBom,
  bomWeight,
  windowY,
  panelId,
}) => {
  const panelLeft = 200;
  const panelRight = 800;
  const panelTop = 60;
  const panelBottom = 720;
  const panelW = panelRight - panelLeft;

  // Rebar x positions
  const rebarXs: number[] = [];
  const rebarSpacing = panelW / (rebarCount + 1);
  for (let i = 1; i <= rebarCount; i++) {
    rebarXs.push(panelLeft + i * rebarSpacing);
  }

  const chamferSize = 20;
  const panelPath = showChamfer
    ? `M ${panelLeft + chamferSize} ${panelTop}
       L ${panelRight - chamferSize} ${panelTop}
       L ${panelRight} ${panelTop + chamferSize}
       L ${panelRight} ${panelBottom}
       L ${panelLeft} ${panelBottom}
       L ${panelLeft} ${panelTop + chamferSize}
       Z`
    : "";

  return (
    <svg viewBox="0 0 1200 800" style={{ width: "100%", height: "100%" }}>
      {/* Panel outline */}
      {showChamfer ? (
        <path
          d={panelPath}
          fill="none"
          stroke={theme.textPrimary}
          strokeWidth={2}
          opacity={chamferProgress}
        />
      ) : null}
      <rect
        x={panelLeft}
        y={panelTop}
        width={panelW}
        height={panelBottom - panelTop}
        fill="none"
        stroke={theme.textPrimary}
        strokeWidth={2}
        opacity={showChamfer ? 1 - chamferProgress : 1}
      />

      {/* Window opening (dashed) */}
      <rect
        x={350}
        y={windowY}
        width={300}
        height={200}
        fill="none"
        stroke={theme.textSecondary}
        strokeWidth={1.5}
        strokeDasharray="10,5"
      />

      {/* Dimension lines */}
      {/* Horizontal bottom */}
      <line x1={panelLeft} y1={760} x2={panelRight} y2={760} stroke={theme.textSecondary} strokeWidth={1} />
      <line x1={panelLeft} y1={750} x2={panelLeft} y2={770} stroke={theme.textSecondary} strokeWidth={1} />
      <line x1={panelRight} y1={750} x2={panelRight} y2={770} stroke={theme.textSecondary} strokeWidth={1} />
      <text x={(panelLeft + panelRight) / 2} y={785} textAnchor="middle" fill={theme.textSecondary} fontSize={18} fontFamily={theme.fontMono}>
        2400
      </text>

      {/* Vertical right */}
      <line x1={850} y1={panelTop} x2={850} y2={panelBottom} stroke={theme.textSecondary} strokeWidth={1} />
      <line x1={840} y1={panelTop} x2={860} y2={panelTop} stroke={theme.textSecondary} strokeWidth={1} />
      <line x1={840} y1={panelBottom} x2={860} y2={panelBottom} stroke={theme.textSecondary} strokeWidth={1} />
      <text x={870} y={(panelTop + panelBottom) / 2} textAnchor="start" fill={theme.textSecondary} fontSize={18} fontFamily={theme.fontMono} transform={`rotate(90, 870, ${(panelTop + panelBottom) / 2})`}>
        3000
      </text>

      {/* Rebar lines */}
      {showRebar &&
        rebarXs.map((x, i) => {
          const lineOpacity = interpolate(
            frame,
            [rebarStartFrame + i * 8, rebarStartFrame + i * 8 + 8],
            [0, 1],
            clamp,
          );
          return (
            <line
              key={`rebar-${i}`}
              x1={x}
              y1={panelTop + 15}
              x2={x}
              y2={panelBottom - 15}
              stroke="#FF4444"
              strokeWidth={1.5}
              opacity={lineOpacity}
            />
          );
        })}

      {/* Rebar annotation */}
      {showRebar && frame > rebarStartFrame + rebarCount * 8 + 20 && (
        <text x={panelRight + 30} y={400} fill={theme.textSecondary} fontSize={16} fontFamily={theme.fontMono}>
          {spacingLabel}
        </text>
      )}

      {/* Chamfer detail callout */}
      {showChamfer && chamferProgress > 0 && (
        <g opacity={chamferProgress}>
          {/* Callout circle */}
          <circle cx={1020} cy={140} r={70} fill="none" stroke={theme.textSecondary} strokeWidth={1} />
          {/* Leader line */}
          <line x1={panelRight} y1={panelTop} x2={960} y2={140} stroke={theme.textSecondary} strokeWidth={1} strokeDasharray="4,3" />
          {/* Corner profile inside callout */}
          <line x1={990} y1={100} x2={990} y2={140} stroke={theme.textPrimary} strokeWidth={2} />
          <line x1={990} y1={140} x2={1050} y2={140} stroke={theme.textPrimary} strokeWidth={2} />
          {/* Chamfer diagonal */}
          <line
            x1={990}
            y1={100}
            x2={1050}
            y2={140}
            stroke={theme.accent}
            strokeWidth={2}
            strokeDasharray={`${60 * chamferProgress} 60`}
          />
          <text x={1020} y={235} textAnchor="middle" fill={theme.textSecondary} fontSize={14} fontFamily={theme.fontMono}>
            Chamfer 20x20
          </text>
        </g>
      )}

      {/* BOM table */}
      {showBom && (
        <g>
          <text x={900} y={620} fill={theme.textTertiary} fontSize={14} fontFamily={theme.fontMono} fontWeight={600} letterSpacing={2}>
            REBAR SCHEDULE
          </text>
          <line x1={900} y1={630} x2={1160} y2={630} stroke={theme.borderDefault} strokeWidth={1} />
          <text x={900} y={655} fill={theme.textSecondary} fontSize={14} fontFamily={theme.fontMono}>
            {`\u00D812 \u2014 32 pcs \u2014 L=3450mm \u2014 ${Math.round(bomWeight)} kg`}
          </text>
        </g>
      )}

      {/* Title block */}
      <line x1={0} y1={770} x2={1200} y2={770} stroke={theme.borderDefault} strokeWidth={1} />
      <text x={40} y={792} fill={theme.textPrimary} fontSize={22} fontFamily={theme.fontMono} fontWeight={600}>
        {panelId}
      </text>
      <text x={200} y={792} fill={theme.textTertiary} fontSize={16} fontFamily={theme.fontMono}>
        Scale 1:25
      </text>
    </svg>
  );
};

// ── Isometric Building ──────────────────────────────────────────────
const IsometricBuilding: React.FC<{
  frame: number;
  highlightPanel: boolean;
  scale?: number;
}> = ({ frame, highlightPanel, scale = 1 }) => {
  const floors = 5;
  const floorH = 60;
  const floorW = 400;
  const gap = 2;

  const panelHighlightOpacity = highlightPanel
    ? interpolate(frame, [60, 80], [0, 1], clamp)
    : 0;

  return (
    <div
      style={{
        perspective: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          transform: "rotateX(-25deg) rotateY(45deg)",
          transformStyle: "preserve-3d",
          position: "relative",
        }}
      >
        {Array.from({ length: floors }).map((_, i) => {
          const isTarget = i === 2; // 3rd floor (0-indexed)
          return (
            <div key={i} style={{ position: "relative", marginBottom: gap }}>
              {/* Floor slab */}
              <div
                style={{
                  width: floorW,
                  height: 4,
                  background: theme.borderDefault,
                  marginBottom: 1,
                }}
              />
              {/* Floor body */}
              <div
                style={{
                  width: floorW,
                  height: floorH,
                  background: theme.bgElevated,
                  border: `1px solid ${theme.borderSubtle}`,
                  display: "flex",
                  position: "relative",
                }}
              >
                {/* Panel segments */}
                {Array.from({ length: 8 }).map((_, j) => {
                  const isW14 = isTarget && j === 4;
                  return (
                    <div
                      key={j}
                      style={{
                        flex: 1,
                        borderRight: j < 7 ? `1px solid ${theme.borderFaint}` : "none",
                        background: isW14
                          ? `rgba(79, 143, 247, ${0.15 * panelHighlightOpacity})`
                          : "transparent",
                        border: isW14 && panelHighlightOpacity > 0.5
                          ? `2px solid ${theme.accent}`
                          : undefined,
                        position: "relative",
                      }}
                    >
                      {isW14 && panelHighlightOpacity > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: -30,
                            left: "50%",
                            transform: "translateX(-50%)",
                            color: theme.accent,
                            fontSize: 28,
                            fontWeight: 600,
                            fontFamily: theme.fontMono,
                            opacity: interpolate(frame, [70, 90], [0, 1], clamp),
                            whiteSpace: "nowrap",
                          }}
                        >
                          W-14
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Scene ──────────────────────────────────────────────────────
export const EngineerTheProject: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Global opacity transitions ────────────────────────────────────
  const uiOpacity = interpolate(frame, [P1_START, P1_START + 20], [0, 1], clamp);
  const endFadeOut = interpolate(frame, [1628, TOTAL_FRAMES], [1, 0], clamp);
  const statsTransition = interpolate(frame, [P8_START, P8_START + 40], [0, 1], clamp);

  // ── Phase 2: split widths ─────────────────────────────────────────
  const leftPct = interpolate(frame, [P2_START, P2_START + 70], [100, 35], clamp);
  const buildingScale = interpolate(frame, [P2_START, P2_START + 70], [1.0, 0.55], clamp);
  const rightRevealPct = interpolate(frame, [P2_START + 30, P2_START + 110], [0, 100], clamp);

  // ── Phase 3: chat bar ─────────────────────────────────────────────
  const chatBarH = interpolate(frame, [P3_START, P3_START + 20], [0, 300], clamp);
  const userMsg = "Add \u00D812 vertical rebar at 200mm spacing, 30mm cover, both faces.";
  const typingStart = P3_START + 10;
  const thinkingText =
    frame < P3_START + 140
      ? "\u2699 Generating reinforcement layout..."
      : "\u2713 Reinforcement added";

  // ── Phase 4: toolbar ──────────────────────────────────────────────
  const toolbarOpacity = interpolate(frame, [P4_START, P4_START + 20], [0, 1], clamp);

  // Cursor for Edge Profile
  const edgeBtnX = 1580;
  const edgeBtnY = 170;
  const p4CursorX = interpolate(frame, [700, 720], [2400, edgeBtnX], clamp);
  const p4CursorY = interpolate(frame, [700, 720], [600, edgeBtnY], clamp);
  const edgeBtnActive = frame >= 720 && frame < 770;
  const dropdownOpacity = interpolate(frame, [725, 735], [0, 1], clamp) * (frame < 770 ? 1 : interpolate(frame, [770, 775], [1, 0], clamp));
  const hoverIdx = frame >= 750 ? 2 : -1;

  // Chamfer
  const chamferProgress = interpolate(frame, [780, 860], [0, 1], clamp);

  // ── Phase 5: property panel ───────────────────────────────────────
  const buildingFadeOut = interpolate(frame, [P5_START, P5_START + 30], [1, 0], clamp);
  const propPanelIn = interpolate(frame, [P5_START + 20, P5_START + 50], [0, 1], clamp);

  const spacingHighlight = frame >= 960 && frame < 1020;
  const spacingOldOpacity = frame < 970 ? 1 : interpolate(frame, [970, 990], [1, 0], clamp);
  const spacingNewOpacity = frame < 970 ? 0 : interpolate(frame, [970, 990], [0, 1], clamp);

  const rebarCount = frame < P5_START + 120 ? 12 : 16;
  const spacingLabel = frame < P5_START + 120 ? "\u00D812 c/c 200" : "\u00D812 c/c 150";

  const bomOpacity = interpolate(frame, [1060, 1080], [0, 1], clamp);
  const bomWeight = interpolate(frame, [1060, 1100], [82, 108], clamp);

  // ── Phase 6: window drag ──────────────────────────────────────────
  const windowBaseY = 350;
  const windowDragY = interpolate(frame, [1160, 1200], [windowBaseY, windowBaseY - 30], clamp);
  const toastOpacity = interpolate(frame, [1200, 1215], [0, 1], clamp);
  const toastTranslateY = interpolate(frame, [1200, 1215], [60, 0], clamp);

  // ── Phase 7: montage panel IDs ────────────────────────────────────
  const montageW15Opacity = frame >= P7_START && frame < P7_START + 60
    ? interpolate(frame, [P7_START, P7_START + 10], [0, 1], clamp)
    : frame >= P7_START + 10 ? interpolate(frame, [P7_START + 50, P7_START + 60], [1, 0], clamp) : 0;
  const montageW16Opacity = frame >= P7_START + 60 && frame < P7_START + 120
    ? interpolate(frame, [P7_START + 60, P7_START + 70], [0, 1], clamp)
    : frame >= P7_START + 70 ? interpolate(frame, [P7_START + 110, P7_START + 120], [1, 0], clamp) : 0;
  const montageW17Opacity = frame >= P7_START + 120
    ? interpolate(frame, [P7_START + 120, P7_START + 130], [0, 1], clamp)
    : 0;

  const checkScale = interpolate(frame, [P7_START + 140, P7_START + 155, P7_START + 165], [0, 1.2, 1.0], clamp);

  // ── Determine active phase context ────────────────────────────────
  const inStudioPhase = frame < P8_START;
  const showLeftPanel = frame >= P2_START && frame < P8_START;
  const showRightPanel = frame >= P2_START && frame < P8_START;
  const showChat = frame >= P3_START && frame < P7_START;
  const showToolbar = frame >= P4_START && frame < P7_START;
  const showBuildingView = frame < P5_START + 30;
  const showPropertyPanel = frame >= P5_START + 20 && frame < P7_START;

  // Which panel to show in montage
  const montagePanelId = frame >= P7_START + 120 ? "W-17" : frame >= P7_START + 60 ? "W-16" : frame >= P7_START ? "W-15" : "W-14";
  void (frame >= P7_START ? montagePanelId : "W-14");

  // ── Phase 2: AI Generated badge ───────────────────────────────────
  const badgeOpacity = interpolate(frame, [250, 270], [0, 1], clamp);

  // ── Phase 1 cursor ────────────────────────────────────────────────
  const p1CursorOpacity = interpolate(frame, [40, 50, 85, 95], [0, 1, 1, 0], clamp);
  const p1CursorX = interpolate(frame, [40, 70], [1200, 720], clamp);
  const p1CursorY = interpolate(frame, [40, 70], [500, 380], clamp);

  // Viewport cursor visibility
  const p4CursorOpacity = interpolate(frame, [700, 710, 760, 770], [0, 1, 1, 0], clamp);

  // Phase 6 cursor
  const p6CursorOpacity = interpolate(frame, [1150, 1160, 1195, 1205], [0, 1, 1, 0], clamp);
  const p6CursorX = interpolate(frame, [1160, 1200], [1100, 1100], clamp);
  const p6CursorY = interpolate(frame, [1160, 1200], [600, 540], clamp);

  // Phase 8 sub-animations
  const comparisonFade = interpolate(frame, [1550, 1565], [0, 1], clamp);
  const endCardFade = interpolate(frame, [1580, 1595], [0, 1], clamp);

  // Progress bar
  const barPct = interpolate(
    frame,
    [1590, 1600, 1601, 1610, 1611, 1620],
    [0, 65, 65, 80, 80, 95],
    clamp,
  );
  const barColor = barPct <= 65 ? theme.accent : barPct <= 80 ? theme.green : "#5EEAA0";

  // All panels fade out for Phase 8
  const studioFadeOut = interpolate(frame, [P8_START, P8_START + 40], [1, 0], clamp);

  return (
    <div
      style={{
        width: 3840,
        height: 2160,
        background: frame >= P8_START ? theme.bgVoid : theme.bgApp,
        fontFamily: theme.fontUi,
        overflow: "hidden",
        position: "relative",
        opacity: uiOpacity * endFadeOut,
      }}
    >
      {/* ═══ Studio UI ═══ */}
      {inStudioPhase && (
        <div style={{ width: "100%", height: "100%", opacity: studioFadeOut }}>
          {/* ── Top bar ── */}
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
          </div>

          {/* ── Main content area ── */}
          <div style={{ display: "flex", marginTop: 88, height: "calc(100% - 88px)" }}>
            {/* ── Left Panel ── */}
            <div
              style={{
                width: `${leftPct}%`,
                height: "100%",
                position: "relative",
                borderRight: showLeftPanel && leftPct < 100 ? `2px solid ${theme.borderDefault}` : "none",
                overflow: "hidden",
              }}
            >
              {/* Isometric Building */}
              {showBuildingView && (
                <div style={{ width: "100%", height: "100%", opacity: frame >= P5_START ? buildingFadeOut : 1 }}>
                  {leftPct < 100 && (
                    <div
                      style={{
                        padding: "16px 24px",
                        fontSize: 18,
                        fontWeight: 600,
                        textTransform: "uppercase" as const,
                        letterSpacing: 3,
                        color: theme.textTertiary,
                        opacity: interpolate(frame, [P2_START + 70, P2_START + 90], [0, 1], clamp),
                      }}
                    >
                      3D View
                    </div>
                  )}
                  <IsometricBuilding
                    frame={frame}
                    highlightPanel={frame >= 40 && frame < P2_START}
                    scale={frame < P2_START ? 1 : buildingScale}
                  />
                </div>
              )}

              {/* Property Panel (Phase 5) */}
              {showPropertyPanel && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: propPanelIn,
                    padding: "32px 28px",
                    background: theme.bgSidebar,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      textTransform: "uppercase" as const,
                      letterSpacing: 3,
                      color: theme.textTertiary,
                      marginBottom: 32,
                    }}
                  >
                    REBAR — VERTICAL FACE A
                  </div>

                  {[
                    { label: "Diameter", value: "\u00D812" },
                    { label: "Spacing", value: "spacing" },
                    { label: "Cover", value: "30 mm" },
                    { label: "Grade", value: "B500C" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 0",
                        borderBottom: `1px solid ${theme.borderFaint}`,
                      }}
                    >
                      <span style={{ fontSize: 24, color: theme.textTertiary }}>{row.label}</span>
                      <div
                        style={{
                          background: theme.bgElevated,
                          border: `2px solid ${row.label === "Spacing" && spacingHighlight ? theme.accent : theme.borderSubtle}`,
                          borderRadius: 8,
                          padding: "8px 20px",
                          fontSize: 24,
                          color: theme.textPrimary,
                          fontFamily: theme.fontMono,
                          minWidth: 120,
                          textAlign: "center" as const,
                          position: "relative" as const,
                        }}
                      >
                        {row.value === "spacing" ? (
                          <>
                            <span style={{ opacity: spacingOldOpacity }}>200 mm</span>
                            <span
                              style={{
                                position: "absolute",
                                top: 8,
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                opacity: spacingNewOpacity,
                              }}
                            >
                              150 mm
                            </span>
                          </>
                        ) : (
                          row.value
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Apply button */}
                  {frame >= 995 && frame < 1020 && (
                    <div
                      style={{
                        marginTop: 24,
                        padding: "10px 28px",
                        background: theme.accent,
                        borderRadius: 8,
                        textAlign: "center" as const,
                        fontSize: 22,
                        color: "white",
                        fontWeight: 600,
                        opacity: interpolate(frame, [995, 1000, 1015, 1020], [0, 1, 1, 0.8], clamp),
                      }}
                    >
                      Apply
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Right Panel (SVG Viewport) ── */}
            {showRightPanel && (
              <div
                style={{
                  flex: 1,
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                  clipPath: `inset(0 ${100 - rightRevealPct}% 0 0)`,
                }}
              >
                {/* Grid background */}
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

                {/* Toolbar (Phase 4+) */}
                {showToolbar && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 56,
                      background: theme.bgSidebar,
                      borderBottom: `2px solid ${theme.borderDefault}`,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 16px",
                      gap: 8,
                      zIndex: 5,
                      opacity: toolbarOpacity,
                    }}
                  >
                    {["Select", "Edge Profile", "Embed", "Annotate"].map((btn) => (
                      <div
                        key={btn}
                        style={{
                          background: btn === "Edge Profile" && edgeBtnActive ? theme.accent : theme.bgElevated,
                          border: `1px solid ${theme.borderSubtle}`,
                          padding: "8px 20px",
                          fontSize: 20,
                          color: btn === "Edge Profile" && edgeBtnActive ? "white" : theme.textSecondary,
                          borderRadius: 6,
                          position: "relative" as const,
                        }}
                      >
                        {btn}
                        {/* Dropdown */}
                        {btn === "Edge Profile" && dropdownOpacity > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              background: theme.bgElevated,
                              border: `1px solid ${theme.borderDefault}`,
                              borderRadius: 8,
                              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                              opacity: dropdownOpacity,
                              zIndex: 20,
                              width: 240,
                              overflow: "hidden",
                            }}
                          >
                            {["Square", "Chamfer 10\u00D710", "Chamfer 20\u00D720", "Bullnose R15"].map((opt, idx) => (
                              <div
                                key={opt}
                                style={{
                                  height: 40,
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0 16px",
                                  fontSize: 18,
                                  color: idx === hoverIdx ? theme.textPrimary : theme.textSecondary,
                                  background: idx === hoverIdx ? theme.bgHover : "transparent",
                                }}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* SVG Viewport area */}
                <div
                  style={{
                    position: "absolute",
                    top: showToolbar ? 56 : 0,
                    left: 0,
                    right: 0,
                    bottom: showChat ? chatBarH : 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 40,
                  }}
                >
                  {/* Main panel (W-14 or montage) */}
                  {frame < P7_START && (
                    <WallPanelSVG
                      frame={frame}
                      showRebar={frame >= 450}
                      rebarCount={rebarCount}
                      rebarStartFrame={450}
                      showChamfer={frame >= 780}
                      chamferProgress={chamferProgress}
                      spacingLabel={spacingLabel}
                      showBom={frame >= 1060}
                      bomWeight={bomWeight}
                      windowY={windowDragY}
                      panelId="W-14"
                    />
                  )}

                  {/* Montage panels */}
                  {frame >= P7_START && (
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      {/* W-15 */}
                      <div style={{ position: "absolute", inset: 0, opacity: montageW15Opacity }}>
                        <WallPanelSVG
                          frame={frame}
                          showRebar={true}
                          rebarCount={16}
                          rebarStartFrame={0}
                          showChamfer={true}
                          chamferProgress={1}
                          spacingLabel={"\u00D812 c/c 150"}
                          showBom={false}
                          bomWeight={0}
                          windowY={320}
                          panelId="W-15"
                        />
                        {/* Correction markers */}
                        {[
                          { cx: 400, cy: 200 },
                          { cx: 600, cy: 450 },
                          { cx: 350, cy: 600 },
                        ].map((pos, i) => (
                          <div
                            key={i}
                            style={{
                              position: "absolute",
                              left: `${(pos.cx / 1200) * 100}%`,
                              top: `${(pos.cy / 800) * 100}%`,
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: theme.error,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: 18,
                              fontWeight: 700,
                            }}
                          >
                            !
                          </div>
                        ))}
                      </div>

                      {/* W-16 */}
                      <div style={{ position: "absolute", inset: 0, opacity: montageW16Opacity }}>
                        <WallPanelSVG
                          frame={frame}
                          showRebar={true}
                          rebarCount={14}
                          rebarStartFrame={0}
                          showChamfer={false}
                          chamferProgress={0}
                          spacingLabel={"\u00D812 c/c 175"}
                          showBom={false}
                          bomWeight={0}
                          windowY={380}
                          panelId="W-16"
                        />
                        <div
                          style={{
                            position: "absolute",
                            left: "42%",
                            top: "30%",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: theme.error,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 18,
                            fontWeight: 700,
                          }}
                        >
                          !
                        </div>
                      </div>

                      {/* W-17 */}
                      <div style={{ position: "absolute", inset: 0, opacity: montageW17Opacity }}>
                        <WallPanelSVG
                          frame={frame}
                          showRebar={true}
                          rebarCount={16}
                          rebarStartFrame={0}
                          showChamfer={true}
                          chamferProgress={1}
                          spacingLabel={"\u00D812 c/c 150"}
                          showBom={false}
                          bomWeight={0}
                          windowY={340}
                          panelId="W-17"
                        />
                        {/* Green checkmark */}
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: `translate(-50%, -50%) scale(${checkScale})`,
                          }}
                        >
                          <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="56" fill="none" stroke={theme.green} strokeWidth="4" />
                            <polyline
                              points="35,60 52,78 85,42"
                              fill="none"
                              stroke={theme.green}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Montage badges */}
                {frame >= P7_START && frame < P7_START + 60 && (
                  <div
                    style={{
                      position: "absolute",
                      top: showToolbar ? 70 : 16,
                      right: 16,
                      background: "rgba(251,191,36,0.12)",
                      border: "2px solid rgba(251,191,36,0.3)",
                      borderRadius: 12,
                      padding: "8px 20px",
                      fontSize: 20,
                      fontFamily: theme.fontMono,
                      color: theme.amber,
                      opacity: montageW15Opacity,
                    }}
                  >
                    3 CORRECTIONS
                  </div>
                )}
                {frame >= P7_START + 60 && frame < P7_START + 120 && (
                  <div
                    style={{
                      position: "absolute",
                      top: showToolbar ? 70 : 16,
                      right: 16,
                      background: "rgba(251,191,36,0.08)",
                      border: "2px solid rgba(251,191,36,0.2)",
                      borderRadius: 12,
                      padding: "8px 20px",
                      fontSize: 20,
                      fontFamily: theme.fontMono,
                      color: theme.amber,
                      opacity: montageW16Opacity,
                    }}
                  >
                    1 CORRECTION
                  </div>
                )}
                {frame >= P7_START + 120 && (
                  <div
                    style={{
                      position: "absolute",
                      top: showToolbar ? 70 : 16,
                      right: 16,
                      background: theme.greenDim,
                      border: "2px solid rgba(52,211,153,0.3)",
                      borderRadius: 12,
                      padding: "8px 20px",
                      fontSize: 20,
                      fontFamily: theme.fontMono,
                      color: theme.green,
                      opacity: montageW17Opacity,
                    }}
                  >
                    APPROVED
                  </div>
                )}

                {/* AI Generated badge (Phase 2) */}
                {frame >= 250 && frame < P7_START && (
                  <div
                    style={{
                      position: "absolute",
                      top: showToolbar ? 70 : 16,
                      right: 16,
                      background: theme.greenDim,
                      border: "2px solid rgba(52,211,153,0.3)",
                      borderRadius: 12,
                      padding: "8px 20px",
                      fontSize: 22,
                      fontFamily: theme.fontMono,
                      color: theme.green,
                      opacity: badgeOpacity,
                      zIndex: 6,
                    }}
                  >
                    AI GENERATED — READY FOR REVIEW
                  </div>
                )}

                {/* Chat bar (Phase 3-6) */}
                {showChat && chatBarH > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: chatBarH,
                      background: theme.bgSurface,
                      borderTop: `2px solid ${theme.borderDefault}`,
                      padding: 24,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      gap: 16,
                      overflow: "hidden",
                    }}
                  >
                    {/* User message bubble */}
                    {frame >= typingStart && (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div
                          style={{
                            background: theme.accent,
                            color: "white",
                            padding: "16px 24px",
                            borderRadius: "24px 24px 8px 24px",
                            fontSize: 24,
                            maxWidth: "80%",
                            lineHeight: 1.5,
                          }}
                        >
                          <TypeWriter
                            text={userMsg}
                            startFrame={typingStart}
                            charsPerFrame={0.8}
                            style={{ color: "white" }}
                            cursorColor="white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Thinking / response */}
                    {frame >= P3_START + 100 && (
                      <FadeIn startFrame={P3_START + 100} slideY={8}>
                        <div
                          style={{
                            fontSize: 20,
                            fontFamily: theme.fontMono,
                            color: theme.textTertiary,
                            background: theme.bgElevated,
                            border: `2px solid ${theme.borderSubtle}`,
                            padding: "10px 18px",
                            borderRadius: 10,
                            marginBottom: 8,
                          }}
                        >
                          {thinkingText}
                        </div>
                      </FadeIn>
                    )}

                    {frame >= P3_START + 160 && (
                      <FadeIn startFrame={P3_START + 160} slideY={6}>
                        <p style={{ fontSize: 22, color: theme.textSecondary, lineHeight: 1.5, margin: 0 }}>
                          Added vertical rebar — <strong style={{ color: theme.textPrimary }}>12 bars per face</strong> at 200mm centers, 30mm cover.
                        </p>
                      </FadeIn>
                    )}
                  </div>
                )}

                {/* BOM table overlay */}
                {frame >= 1060 && frame < P7_START && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: showChat ? chatBarH + 20 : 20,
                      right: 20,
                      opacity: bomOpacity,
                    }}
                  >
                    {/* Rendered inside SVG now */}
                  </div>
                )}

                {/* Toast notification (Phase 6) */}
                {frame >= 1200 && frame < P7_START && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: showChat ? chatBarH + 20 : 20,
                      right: 20,
                      background: theme.bgElevated,
                      borderLeft: `4px solid ${theme.accent}`,
                      borderRadius: 12,
                      padding: "20px 24px",
                      maxWidth: 520,
                      opacity: toastOpacity,
                      transform: `translateY(${toastTranslateY}px)`,
                      zIndex: 15,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                    }}
                  >
                    <div style={{ fontSize: 28, lineHeight: 1 }}>💡</div>
                    <p style={{ fontSize: 22, color: theme.textSecondary, margin: 0, lineHeight: 1.5 }}>
                      Correction logged — AI will{" "}
                      <span style={{ color: theme.textPrimary, fontWeight: 600 }}>apply this pattern</span>{" "}
                      to similar panels.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Phase 1: full-width viewport before split */}
            {!showRightPanel && (
              <div
                style={{
                  position: "absolute",
                  top: 88,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <IsometricBuilding frame={frame} highlightPanel={frame >= 40} />
              </div>
            )}
          </div>

          {/* ── Cursors ── */}
          {/* Phase 1 cursor */}
          <Cursor x={p1CursorX} y={p1CursorY} opacity={frame < P2_START ? p1CursorOpacity : 0} />

          {/* Phase 4 cursor */}
          <Cursor x={p4CursorX} y={p4CursorY} opacity={frame >= 700 && frame < 780 ? p4CursorOpacity : 0} />

          {/* Phase 6 cursor */}
          <Cursor x={p6CursorX} y={p6CursorY} opacity={frame >= P6_START && frame < P7_START ? p6CursorOpacity : 0} />
        </div>
      )}

      {/* ═══ Phase 8: Stats + End Card ═══ */}
      {frame >= P8_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: statsTransition * endFadeOut,
          }}
        >
          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
            <FadeIn startFrame={1490} slideY={30}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 96, fontWeight: 700, color: theme.textPrimary }}>96</span>
                <span style={{ fontSize: 40, color: theme.textSecondary, marginLeft: 20 }}>panels detailed</span>
              </div>
            </FadeIn>

            <FadeIn startFrame={1510} slideY={30}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 96, fontWeight: 700, color: theme.amber }}>34</span>
                <span style={{ fontSize: 40, color: theme.textSecondary, marginLeft: 20 }}>required corrections</span>
              </div>
            </FadeIn>

            <FadeIn startFrame={1530} slideY={30}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 96, fontWeight: 700, color: theme.green }}>62</span>
                <span style={{ fontSize: 40, color: theme.textSecondary, marginLeft: 20 }}>approved as-generated</span>
              </div>
            </FadeIn>

            {/* Comparison */}
            <div style={{ opacity: comparisonFade, marginTop: 24, textAlign: "center" }}>
              <div style={{ fontSize: 48, color: theme.green, fontWeight: 600, marginBottom: 12 }}>
                Average time per panel: 4 min
              </div>
              <div style={{ fontSize: 36, color: theme.textTertiary, position: "relative", display: "inline-block" }}>
                Manual baseline:{" "}
                <span style={{ position: "relative" }}>
                  45 min
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: -4,
                      right: -4,
                      height: 3,
                      background: theme.textTertiary,
                    }}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* End card */}
          <div
            style={{
              opacity: endCardFade,
              marginTop: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 44, color: theme.textSecondary, marginBottom: 48 }}>
              Every correction makes the AI smarter.
            </div>

            {/* Progress bar */}
            {frame >= 1590 && (
              <div style={{ position: "relative", width: 1200 }}>
                {/* Bar container */}
                <div
                  style={{
                    width: 1200,
                    height: 40,
                    background: theme.bgElevated,
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barPct}%`,
                      height: "100%",
                      background: barColor,
                      borderRadius: 20,
                      transition: "none",
                    }}
                  />
                </div>

                {/* Percentage label */}
                {barPct > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -36,
                      left: `${barPct}%`,
                      transform: "translateX(-50%)",
                      fontSize: 24,
                      fontWeight: 600,
                      color: theme.textPrimary,
                      fontFamily: theme.fontMono,
                    }}
                  >
                    {Math.round(barPct)}%
                  </div>
                )}

                {/* Stage labels */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, position: "relative" }}>
                  <div style={{ position: "absolute", left: "65%", transform: "translateX(-50%)", fontSize: 22, color: theme.textTertiary }}>
                    Today
                  </div>
                  <div style={{ position: "absolute", left: "80%", transform: "translateX(-50%)", fontSize: 22, color: theme.textTertiary }}>
                    Next month
                  </div>
                  <div style={{ position: "absolute", left: "95%", transform: "translateX(-50%)", fontSize: 22, color: theme.textTertiary }}>
                    Next year
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
