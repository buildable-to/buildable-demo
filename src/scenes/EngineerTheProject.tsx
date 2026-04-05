import React, { useMemo, useEffect } from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

// ── Constants ───────────────────────────────────────────────────────
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// Beam params (mm)
const L = 6000;
const D = 600;
const W = 300;
const COVER = 40;
const BOT_COUNT = 3;
const BOT_DIA = 20;
const TOP_COUNT = 2;
const TOP_DIA = 16;
const S_DIA = 10;
const S_SPACING = 200;
const S_CLOSE_SPACING = 100;
const S_CLOSE_ZONE = 1200;

// Scale factor: mm -> three.js units
const SC = 1 / 4000;

// ── Pre-created Materials (module-level, never recreated) ───────────
const CONCRETE_MAT = new THREE.MeshStandardMaterial({
  color: 0xb0b0b0,
  roughness: 0.7,
  metalness: 0.1,
});
const CONCRETE_SELECTED_MAT = new THREE.MeshStandardMaterial({
  color: 0x818cf8,
  roughness: 0.7,
  metalness: 0.1,
});
const REBAR_MAT = new THREE.MeshStandardMaterial({
  color: 0xc0392b,
  roughness: 0.4,
  metalness: 0.3,
});
const STIRRUP_MAT = new THREE.MeshStandardMaterial({
  color: 0x27ae60,
  roughness: 0.5,
  metalness: 0.2,
});
const WIRE_MAT = new THREE.LineBasicMaterial({ color: 0x555566 });

// ── Beam Camera Rig ─────────────────────────────────────────────────
const BeamCameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();

  // Phase-based camera control
  const angle = interpolate(
    frame,
    [0, 120, 180, 280, 350, 420, 1130, 1200],
    [0.4, 1.2, 1.6, 2.4, 2.8, 3.4, 3.8, 4.2],
    clamp
  );
  const elevation = interpolate(
    frame,
    [0, 120, 280, 420, 1130, 1200],
    [0.5, 0.3, 0.5, 0.35, 0.4, 0.3],
    clamp
  );
  const dist = interpolate(
    frame,
    [0, 30, 120, 350, 1130, 1200],
    [3.0, 2.2, 2.0, 2.2, 2.0, 2.4],
    clamp
  );

  camera.position.set(
    Math.cos(angle) * dist,
    elevation,
    Math.sin(angle) * dist
  );
  camera.lookAt(0, -0.02, 0);
  camera.updateProjectionMatrix();

  return null;
};

// ── Beam Model ──────────────────────────────────────────────────────
const BeamModel: React.FC<{
  viewMode: "normal" | "xray" | "rebar";
  selected: boolean;
  xrayProgress: number;
}> = ({ viewMode, selected, xrayProgress }) => {
  const beamGeo = useMemo(() => {
    const group = new THREE.Group();

    // Concrete box
    const concreteGeo = new THREE.BoxGeometry(L * SC, D * SC, W * SC);
    const concreteMesh = new THREE.Mesh(concreteGeo, CONCRETE_MAT);
    concreteMesh.name = "concrete";
    group.add(concreteMesh);

    // Wireframe edges
    const edgesGeo = new THREE.EdgesGeometry(concreteGeo);
    const wireframe = new THREE.LineSegments(edgesGeo, WIRE_MAT);
    wireframe.name = "wireframe";
    group.add(wireframe);

    // Bottom rebar (3 bars)
    const botY = (-D / 2 + COVER + S_DIA + BOT_DIA / 2) * SC;
    const barLen = (L - 2 * (COVER + S_DIA)) * SC;
    const botRadius = (BOT_DIA / 2) * SC;
    const innerW = W - 2 * (COVER + S_DIA);
    for (let i = 0; i < BOT_COUNT; i++) {
      const z =
        (-innerW / 2 + (innerW / (BOT_COUNT - 1)) * i) * SC;
      const rebarGeo = new THREE.CylinderGeometry(
        botRadius,
        botRadius,
        barLen,
        8
      );
      rebarGeo.rotateZ(Math.PI / 2);
      const mesh = new THREE.Mesh(rebarGeo, REBAR_MAT);
      mesh.position.set(0, botY, z);
      mesh.name = "rebar";
      group.add(mesh);
    }

    // Top rebar (2 bars)
    const topY = (D / 2 - COVER - S_DIA - TOP_DIA / 2) * SC;
    const topRadius = (TOP_DIA / 2) * SC;
    for (let i = 0; i < TOP_COUNT; i++) {
      const z =
        (-innerW / 2 + (innerW / (TOP_COUNT - 1)) * i) * SC;
      const rebarGeo = new THREE.CylinderGeometry(
        topRadius,
        topRadius,
        barLen,
        8
      );
      rebarGeo.rotateZ(Math.PI / 2);
      const mesh = new THREE.Mesh(rebarGeo, REBAR_MAT);
      mesh.position.set(0, topY, z);
      mesh.name = "rebar";
      group.add(mesh);
    }

    // Stirrup positions
    const stirrupPositions: number[] = [];
    // Close zone start
    for (
      let x = -L / 2 + COVER;
      x <= -L / 2 + S_CLOSE_ZONE;
      x += S_CLOSE_SPACING
    ) {
      stirrupPositions.push(x);
    }
    // Mid zone
    const midStart = -L / 2 + S_CLOSE_ZONE + S_SPACING;
    const midEnd = L / 2 - S_CLOSE_ZONE;
    for (let x = midStart; x <= midEnd; x += S_SPACING) {
      stirrupPositions.push(x);
    }
    // Close zone end
    for (
      let x = L / 2 - S_CLOSE_ZONE;
      x <= L / 2 - COVER;
      x += S_CLOSE_SPACING
    ) {
      stirrupPositions.push(x);
    }

    const sInnerH = (D - 2 * COVER) * SC;
    const sInnerW = (W - 2 * COVER) * SC;

    stirrupPositions.forEach((xPos) => {
      const x = xPos * SC;
      const thickness = S_DIA * SC;

      // Top bar
      const topBar = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, thickness, sInnerW),
        STIRRUP_MAT
      );
      topBar.position.set(x, (D / 2 - COVER - S_DIA / 2) * SC, 0);
      topBar.name = "stirrup";
      group.add(topBar);

      // Bottom bar
      const botBar = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, thickness, sInnerW),
        STIRRUP_MAT
      );
      botBar.position.set(
        x,
        (-D / 2 + COVER + S_DIA / 2) * SC,
        0
      );
      botBar.name = "stirrup";
      group.add(botBar);

      // Left bar
      const leftBar = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, sInnerH, thickness),
        STIRRUP_MAT
      );
      leftBar.position.set(x, 0, (-W / 2 + COVER + S_DIA / 2) * SC);
      leftBar.name = "stirrup";
      group.add(leftBar);

      // Right bar
      const rightBar = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, sInnerH, thickness),
        STIRRUP_MAT
      );
      rightBar.position.set(x, 0, (W / 2 - COVER - S_DIA / 2) * SC);
      rightBar.name = "stirrup";
      group.add(rightBar);
    });

    return group;
  }, []);

  // Update materials based on viewMode
  useEffect(() => {
    beamGeo.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name === "concrete") {
          if (viewMode === "rebar") {
            child.visible = false;
          } else {
            child.visible = true;
            const mat = selected ? CONCRETE_SELECTED_MAT : CONCRETE_MAT;
            child.material = mat;
            if (viewMode === "xray") {
              mat.transparent = true;
              mat.opacity = interpolate(xrayProgress, [0, 1], [1.0, 0.25]);
              mat.depthWrite = xrayProgress < 0.5;
              mat.needsUpdate = true;
            } else {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.depthWrite = true;
              mat.needsUpdate = true;
            }
          }
        } else if (child.name === "rebar" || child.name === "stirrup") {
          child.visible = true;
        }
      } else if (child instanceof THREE.LineSegments) {
        child.visible = viewMode !== "rebar";
      }
    });
  }, [viewMode, selected, xrayProgress, beamGeo]);

  return <primitive object={beamGeo} />;
};

// ── Animated Cursor ─────────────────────────────────────────────────
const Cursor: React.FC<{ x: number; y: number; opacity: number; clicking?: boolean }> = ({
  x,
  y,
  opacity,
  clicking,
}) => (
  <svg
    width={clicking ? "28" : "32"}
    height={clicking ? "36" : "40"}
    viewBox="0 0 24 32"
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      pointerEvents: "none",
      zIndex: 9999,
      filter: "drop-shadow(2px 3px 6px rgba(0,0,0,0.6))",
      transition: "width 0.05s, height 0.05s",
    }}
  >
    <path
      d="M2 2 L2 26 L9 20 L15 30 L19 28 L13 18 L22 16 Z"
      fill="white"
      stroke="#111"
      strokeWidth="1.5"
    />
  </svg>
);

// ── SVG Shop Drawing ────────────────────────────────────────────────
const ShopDrawingSVG: React.FC<{ spacing: number; frame: number; animStart: number }> = ({
  spacing,
  frame,
  animStart,
}) => {
  // Elevation view bounds
  const eL = 100;
  const eR = 1050;
  const eT = 120;
  const eB = 520;
  const eW = eR - eL;
  const eH = eB - eT;

  // Stirrup tick marks based on spacing
  const stirrupXs: number[] = [];
  const closeZonePx = (S_CLOSE_ZONE / L) * eW;
  // Close zone start
  for (let px = 0; px <= closeZonePx; px += (S_CLOSE_SPACING / L) * eW) {
    stirrupXs.push(eL + px);
  }
  // Mid zone
  const midStartPx = closeZonePx + (spacing / L) * eW;
  const midEndPx = eW - closeZonePx;
  for (let px = midStartPx; px <= midEndPx; px += (spacing / L) * eW) {
    stirrupXs.push(eL + px);
  }
  // Close zone end
  for (let px = eW - closeZonePx; px <= eW; px += (S_CLOSE_SPACING / L) * eW) {
    stirrupXs.push(eL + px);
  }

  // Cross-section bounds
  const csL = 1120;
  const csT = 160;
  const csW = 200;
  const csH = 400;

  const drawProgress = interpolate(frame, [animStart, animStart + 60], [0, 1], clamp);

  return (
    <svg
      viewBox="0 0 1400 700"
      style={{
        width: "100%",
        height: "100%",
        opacity: drawProgress,
      }}
    >
      {/* Arrow marker */}
      <defs>
        <marker id="arrowL" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
          <path d="M8,0 L0,3 L8,6" fill="none" stroke="#8B8D9A" strokeWidth="1" />
        </marker>
        <marker id="arrowR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="#8B8D9A" strokeWidth="1" />
        </marker>
      </defs>

      {/* Title block */}
      <text x="100" y="50" fill="#E8E9ED" fontSize="24" fontFamily="DM Sans" fontWeight="700">
        BEAM B-01
      </text>
      <text x="100" y="78" fill="#8B8D9A" fontSize="16" fontFamily="DM Sans">
        Elevation + Cross-Section &mdash; Scale 1:25
      </text>

      {/* Concrete outline (elevation) */}
      <rect
        x={eL}
        y={eT}
        width={eW}
        height={eH}
        fill="none"
        stroke="#8B8D9A"
        strokeWidth="2"
      />

      {/* Bottom rebar lines */}
      {[0.3, 0.5, 0.7].map((frac, i) => (
        <line
          key={`bot-${i}`}
          x1={eL + 20}
          x2={eR - 20}
          y1={eB - 40}
          y2={eB - 40}
          stroke="#c0392b"
          strokeWidth="3"
          transform={`translate(0, ${-i * 18})`}
        />
      ))}

      {/* Top rebar lines */}
      {[0.35, 0.65].map((frac, i) => (
        <line
          key={`top-${i}`}
          x1={eL + 20}
          x2={eR - 20}
          y1={eT + 40 + i * 16}
          y2={eT + 40 + i * 16}
          stroke="#c0392b"
          strokeWidth="2.5"
        />
      ))}

      {/* Stirrup tick marks */}
      {stirrupXs.map((sx, i) => (
        <line
          key={`st-${i}`}
          x1={sx}
          x2={sx}
          y1={eT + 8}
          y2={eB - 8}
          stroke="#27ae60"
          strokeWidth="1.2"
          opacity={0.7}
        />
      ))}

      {/* Dimension: Length */}
      <line
        x1={eL}
        x2={eR}
        y1={eB + 50}
        y2={eB + 50}
        stroke="#8B8D9A"
        strokeWidth="1"
        markerStart="url(#arrowL)"
        markerEnd="url(#arrowR)"
      />
      <text
        x={(eL + eR) / 2}
        y={eB + 45}
        fill="#E8E9ED"
        fontSize="16"
        fontFamily="JetBrains Mono"
        textAnchor="middle"
      >
        6000
      </text>

      {/* Dimension: Depth */}
      <line
        x1={eL - 40}
        x2={eL - 40}
        y1={eT}
        y2={eB}
        stroke="#8B8D9A"
        strokeWidth="1"
        markerStart="url(#arrowL)"
        markerEnd="url(#arrowR)"
      />
      <text
        x={eL - 50}
        y={(eT + eB) / 2}
        fill="#E8E9ED"
        fontSize="14"
        fontFamily="JetBrains Mono"
        textAnchor="middle"
        transform={`rotate(-90, ${eL - 50}, ${(eT + eB) / 2})`}
      >
        600
      </text>

      {/* Spacing annotations */}
      <text x={eL + 10} y={eB + 80} fill="#27ae60" fontSize="13" fontFamily="JetBrains Mono">
        {`Ø10 c/c ${S_CLOSE_SPACING}`}
      </text>
      <text x={(eL + eR) / 2 - 40} y={eB + 80} fill="#27ae60" fontSize="13" fontFamily="JetBrains Mono">
        {`Ø10 c/c ${spacing}`}
      </text>
      <text x={eR - 130} y={eB + 80} fill="#27ae60" fontSize="13" fontFamily="JetBrains Mono">
        {`Ø10 c/c ${S_CLOSE_SPACING}`}
      </text>

      {/* Rebar annotations */}
      <text x={eR + 10} y={eT + 50} fill="#c0392b" fontSize="13" fontFamily="JetBrains Mono">
        2{"Ø"}16 (top)
      </text>
      <text x={eR + 10} y={eB - 50} fill="#c0392b" fontSize="13" fontFamily="JetBrains Mono">
        3{"Ø"}20 (bot)
      </text>

      {/* Cross-section box */}
      <rect
        x={csL}
        y={csT}
        width={csW}
        height={csH}
        fill="none"
        stroke="#8B8D9A"
        strokeWidth="2"
      />
      <text
        x={csL + csW / 2}
        y={csT - 14}
        fill="#E8E9ED"
        fontSize="15"
        fontFamily="DM Sans"
        textAnchor="middle"
        fontWeight="600"
      >
        Section A-A
      </text>

      {/* Dimension: Width under cross-section */}
      <line
        x1={csL}
        x2={csL + csW}
        y1={csT + csH + 30}
        y2={csT + csH + 30}
        stroke="#8B8D9A"
        strokeWidth="1"
        markerStart="url(#arrowL)"
        markerEnd="url(#arrowR)"
      />
      <text
        x={csL + csW / 2}
        y={csT + csH + 25}
        fill="#E8E9ED"
        fontSize="14"
        fontFamily="JetBrains Mono"
        textAnchor="middle"
      >
        300
      </text>

      {/* Cross-section top rebar circles (2) */}
      {[0.35, 0.65].map((frac, i) => (
        <circle
          key={`cs-top-${i}`}
          cx={csL + csW * frac}
          cy={csT + 35}
          r={8}
          fill="#c0392b"
        />
      ))}

      {/* Cross-section bottom rebar circles (3) */}
      {[0.25, 0.5, 0.75].map((frac, i) => (
        <circle
          key={`cs-bot-${i}`}
          cx={csL + csW * frac}
          cy={csT + csH - 35}
          r={10}
          fill="#c0392b"
        />
      ))}

      {/* Stirrup outline in cross-section */}
      <rect
        x={csL + 20}
        y={csT + 15}
        width={csW - 40}
        height={csH - 30}
        fill="none"
        stroke="#27ae60"
        strokeWidth="2"
        rx="3"
      />
    </svg>
  );
};

// ── Properties Panel Row ────────────────────────────────────────────
const PropRow: React.FC<{
  label: string;
  value: string;
  highlighted?: boolean;
  mono?: boolean;
}> = ({ label, value, highlighted, mono }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "6px 0",
      borderBottom: `1px solid ${theme.borderFaint}`,
    }}
  >
    <span
      style={{
        color: theme.textSecondary,
        fontSize: 22,
        fontFamily: theme.fontUi,
      }}
    >
      {label}
    </span>
    <span
      style={{
        color: highlighted ? theme.accent : theme.textPrimary,
        fontSize: 22,
        fontFamily: mono ? theme.fontMono : theme.fontUi,
        fontWeight: 600,
        background: highlighted ? theme.accentGlow : "transparent",
        padding: highlighted ? "2px 10px" : 0,
        borderRadius: 4,
        border: highlighted ? `1px solid ${theme.accent}` : "none",
      }}
    >
      {value}
    </span>
  </div>
);

// ── Properties Section ──────────────────────────────────────────────
const PropSection: React.FC<{
  title: string;
  children: React.ReactNode;
  startFrame: number;
  frame: number;
}> = ({ title, children, startFrame, frame }) => {
  const opacity = interpolate(frame, [startFrame, startFrame + 12], [0, 1], clamp);
  const slideY = interpolate(frame, [startFrame, startFrame + 12], [16, 0], clamp);
  return (
    <div style={{ opacity, transform: `translateY(${slideY}px)`, marginBottom: 16 }}>
      <div
        style={{
          fontSize: 18,
          fontFamily: theme.fontUi,
          fontWeight: 700,
          color: theme.textTertiary,
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
};

// ── Stat Counter ────────────────────────────────────────────────────
const StatCounter: React.FC<{
  value: number;
  label: string;
  color: string;
  startFrame: number;
  frame: number;
  fontSize?: number;
}> = ({ value, label, color, startFrame, frame, fontSize = 80 }) => {
  const progress = interpolate(frame, [startFrame, startFrame + 40], [0, 1], clamp);
  const displayVal = Math.round(progress * value);
  const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], clamp);
  const slideY = interpolate(frame, [startFrame, startFrame + 15], [30, 0], clamp);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${slideY}px)`,
        textAlign: "center",
        marginBottom: 48,
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 800,
          fontFamily: theme.fontMono,
          color,
          lineHeight: 1,
        }}
      >
        {displayVal}
      </div>
      <div
        style={{
          fontSize: 32,
          fontFamily: theme.fontUi,
          color: theme.textSecondary,
          marginTop: 8,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ── Main Scene ──────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════
export const EngineerTheProject: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Derived animation state ─────────────────────────────────────
  const uiOpacity = interpolate(frame, [0, 30], [0, 1], clamp);
  const uiFadeOut = interpolate(frame, [1200, 1280], [1, 0], clamp);
  const editorVisible = uiOpacity * uiFadeOut;

  // View mode
  const viewMode: "normal" | "xray" | "rebar" =
    frame >= 350
      ? "normal"
      : frame >= 290
        ? "rebar"
        : frame >= 140
          ? "xray"
          : "normal";

  const xrayProgress = interpolate(frame, [140, 180], [0, 1], clamp);
  const isSelected = frame >= 420 && frame < 1130;

  // Beam appear
  const beamOpacity = interpolate(frame, [30, 60], [0, 1], clamp);

  // Modal
  const modalVisible = frame >= 450 && frame < 1130;
  const modalOpacity = modalVisible
    ? frame < 480
      ? interpolate(frame, [450, 480], [0, 1], clamp)
      : frame >= 1100
        ? interpolate(frame, [1100, 1130], [1, 0], clamp)
        : 1
    : 0;

  // Spacing edit
  const spacingValue = frame >= 940 ? 150 : 200;

  // Toast
  const toastOpacity =
    frame >= 1020 && frame < 1100
      ? interpolate(frame, [1020, 1035], [0, 1], clamp) *
        interpolate(frame, [1080, 1100], [1, 0], clamp)
      : 0;

  // Stats phase
  const showStats = frame >= 1280;
  const statsOpacity = interpolate(frame, [1280, 1310], [0, 1], clamp) *
    interpolate(frame, [1540, 1560], [1, 0], clamp);

  // End card
  const showEndCard = frame >= 1550;
  const endCardOpacity = interpolate(frame, [1550, 1580], [0, 1], clamp) *
    interpolate(frame, [1630, 1650], [1, 0], clamp);

  // ── Cursor position ─────────────────────────────────────────────
  // Toolbar button positions (approximate)
  const xrayBtnX = 2060;
  const xrayBtnY = 44;
  const rebarBtnX = 2280;
  const normalBtnX = 1840;
  const closeBtnX = 3540;
  const closeBtnY = 110;
  const spacingFieldX = 3260;
  const spacingFieldY = 1160;

  let cursorX = 800;
  let cursorY = 600;
  let cursorOpacity = 0;
  let clicking = false;

  if (frame >= 120 && frame < 140) {
    // Move to X-Ray button
    cursorX = interpolate(frame, [120, 135], [800, xrayBtnX], clamp);
    cursorY = interpolate(frame, [120, 135], [600, xrayBtnY], clamp);
    cursorOpacity = interpolate(frame, [120, 125], [0, 1], clamp);
  } else if (frame >= 140 && frame < 280) {
    cursorX = xrayBtnX;
    cursorY = xrayBtnY;
    cursorOpacity = frame < 150 ? 1 : interpolate(frame, [150, 170], [1, 0], clamp);
    clicking = frame >= 140 && frame < 145;
  } else if (frame >= 280 && frame < 300) {
    // Move to Rebar button
    cursorX = interpolate(frame, [280, 288], [xrayBtnX, rebarBtnX], clamp);
    cursorY = xrayBtnY;
    cursorOpacity = interpolate(frame, [280, 283], [0, 1], clamp);
    clicking = frame >= 289 && frame < 293;
  } else if (frame >= 300 && frame < 350) {
    cursorOpacity = interpolate(frame, [300, 310], [1, 0], clamp);
    cursorX = rebarBtnX;
    cursorY = xrayBtnY;
  } else if (frame >= 350 && frame < 420) {
    // Move to Normal button
    cursorX = interpolate(frame, [350, 358], [rebarBtnX, normalBtnX], clamp);
    cursorY = xrayBtnY;
    cursorOpacity = interpolate(frame, [350, 353], [0, 1], clamp) *
      interpolate(frame, [360, 380], [1, 0], clamp);
    clicking = frame >= 350 && frame < 354;
  } else if (frame >= 420 && frame < 450) {
    // Double-click on beam
    cursorX = interpolate(frame, [420, 428], [normalBtnX, 1400], clamp);
    cursorY = interpolate(frame, [420, 428], [xrayBtnY, 900], clamp);
    cursorOpacity = 1;
    clicking = (frame >= 430 && frame < 433) || (frame >= 436 && frame < 439);
  } else if (frame >= 450 && frame < 460) {
    cursorOpacity = interpolate(frame, [450, 460], [1, 0], clamp);
    cursorX = 1400;
    cursorY = 900;
  } else if (frame >= 890 && frame < 960) {
    // Move to spacing field
    cursorX = interpolate(frame, [890, 905], [1400, spacingFieldX], clamp);
    cursorY = interpolate(frame, [890, 905], [900, spacingFieldY], clamp);
    cursorOpacity = interpolate(frame, [890, 895], [0, 1], clamp) *
      interpolate(frame, [945, 960], [1, 0], clamp);
    clicking = frame >= 920 && frame < 924;
  } else if (frame >= 1090 && frame < 1140) {
    // Move to close button
    cursorX = interpolate(frame, [1090, 1098], [spacingFieldX, closeBtnX], clamp);
    cursorY = interpolate(frame, [1090, 1098], [spacingFieldY, closeBtnY], clamp);
    cursorOpacity = interpolate(frame, [1090, 1093], [0, 1], clamp) *
      interpolate(frame, [1110, 1130], [1, 0], clamp);
    clicking = frame >= 1100 && frame < 1104;
  }

  // ── Active view mode button ─────────────────────────────────────
  const activeBtn = viewMode;

  // ── Sidebar element list ────────────────────────────────────────
  const sidebarOpacity = interpolate(frame, [30, 50], [0, 1], clamp);

  // ── Toolbar buttons ─────────────────────────────────────────────
  const ToolbarButton: React.FC<{
    label: string;
    active?: boolean;
    accent?: boolean;
    style?: React.CSSProperties;
  }> = ({ label, active, accent, style: btnStyle }) => (
    <div
      style={{
        padding: "8px 20px",
        borderRadius: 6,
        fontSize: 24,
        fontFamily: theme.fontUi,
        fontWeight: 600,
        color: active ? "#fff" : theme.textSecondary,
        background: active
          ? accent
            ? "#818cf8"
            : theme.accent
          : "transparent",
        cursor: "pointer",
        whiteSpace: "nowrap",
        ...btnStyle,
      }}
    >
      {label}
    </div>
  );

  // ── Canvas dimensions ───────────────────────────────────────────
  const canvasWidth = 3280;
  const canvasHeight = 2072;

  // ── Properties panel data ───────────────────────────────────────
  const spacingHighlighted = frame >= 920 && frame < 1020;

  return (
    <div
      style={{
        width: 3840,
        height: 2160,
        background: theme.bgVoid,
        position: "relative",
        overflow: "hidden",
        fontFamily: theme.fontUi,
      }}
    >
      {/* ── Editor UI ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: editorVisible,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            height: 88,
            background: theme.bgSurface,
            borderBottom: `1px solid ${theme.borderDefault}`,
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            gap: 20,
            zIndex: 10,
          }}
        >
          {/* Logo + title */}
          <Img
            src={staticFile("assets/logo.png")}
            style={{ width: 44, height: 44 }}
          />
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: theme.textPrimary,
              marginRight: 16,
            }}
          >
            Buildable
          </span>
          <div
            style={{
              width: 1,
              height: 40,
              background: theme.borderDefault,
              margin: "0 8px",
            }}
          />
          <span
            style={{
              fontSize: 26,
              color: theme.textSecondary,
              fontWeight: 500,
              marginRight: 40,
            }}
          >
            Building Editor
          </span>

          {/* Add Beam button */}
          <div
            style={{
              padding: "8px 22px",
              borderRadius: 6,
              fontSize: 23,
              fontFamily: theme.fontUi,
              fontWeight: 600,
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              marginRight: 30,
            }}
          >
            + Add Beam
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* View mode buttons */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: theme.bgElevated,
              borderRadius: 8,
              padding: 4,
              border: `1px solid ${theme.borderSubtle}`,
            }}
          >
            <ToolbarButton label="Normal" active={activeBtn === "normal"} />
            <ToolbarButton
              label="X-Ray"
              active={activeBtn === "xray"}
              accent
            />
            <ToolbarButton
              label="Rebar"
              active={activeBtn === "rebar"}
              accent
            />
          </div>

          <div
            style={{
              width: 1,
              height: 40,
              background: theme.borderDefault,
              margin: "0 16px",
            }}
          />

          {/* Fit button */}
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              fontSize: 23,
              fontFamily: theme.fontUi,
              fontWeight: 500,
              color: theme.textSecondary,
              border: `1px solid ${theme.borderSubtle}`,
            }}
          >
            Fit
          </div>
        </div>

        {/* Main area: Viewport + Sidebar */}
        <div style={{ display: "flex", flex: 1 }}>
          {/* 3D Viewport */}
          <div
            style={{
              flex: 1,
              position: "relative",
              background: theme.bgViewport,
            }}
          >
            <div style={{ opacity: beamOpacity, width: "100%", height: "100%" }}>
              <ThreeCanvas
                width={canvasWidth}
                height={canvasHeight}
                camera={{ fov: 50, position: [1.5, 0.8, 1.5] }}
              >
                <color attach="background" args={["#1a1a22"]} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 8, 5]} intensity={0.8} />
                <directionalLight
                  position={[-3, 4, -3]}
                  intensity={0.3}
                />
                <gridHelper args={[5, 40, 0x3a3a45, 0x2a2a30]} />
                <axesHelper args={[0.15]} />
                <BeamCameraRig frame={frame} />
                <BeamModel
                  viewMode={viewMode}
                  selected={isSelected}
                  xrayProgress={xrayProgress}
                />
              </ThreeCanvas>
            </div>
          </div>

          {/* Sidebar */}
          <div
            style={{
              width: 560,
              background: theme.bgSidebar,
              borderLeft: `1px solid ${theme.borderDefault}`,
              padding: "24px 28px",
              opacity: sidebarOpacity,
              overflowY: "auto",
            }}
          >
            {/* ELEMENTS section */}
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: theme.textTertiary,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 14,
              }}
            >
              Elements
            </div>

            {/* Beam card */}
            <FadeIn startFrame={40} duration={15} slideY={16}>
              <div
                style={{
                  background: isSelected ? theme.accentGlow : theme.bgElevated,
                  border: `1px solid ${isSelected ? theme.accent : theme.borderSubtle}`,
                  borderRadius: 10,
                  padding: "16px 20px",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: theme.textPrimary,
                    marginBottom: 4,
                  }}
                >
                  Beam B-01
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: theme.textSecondary,
                    fontFamily: theme.fontMono,
                  }}
                >
                  6000 x 600 x 300
                </div>
              </div>
            </FadeIn>

            {/* PROPERTIES section */}
            <FadeIn startFrame={55} duration={15} slideY={16}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: theme.textTertiary,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 10,
                  marginTop: 8,
                }}
              >
                Properties
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: theme.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Geometry
                </div>
                <PropRow label="Length" value="6000" mono />
                <PropRow label="Width" value="300" mono />
                <PropRow label="Depth" value="600" mono />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: theme.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Bottom Rebar
                </div>
                <PropRow label="Count" value="3" mono />
                <PropRow label="Dia" value="Ø20" mono />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: theme.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Stirrups
                </div>
                <PropRow label="Spacing" value="200" mono />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* ── Modal Overlay ──────────────────────────────────────── */}
      {modalOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0, 0, 0, ${0.7 * modalOpacity})`,
            backdropFilter: `blur(${12 * modalOpacity}px)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            opacity: modalOpacity,
          }}
        >
          <div
            style={{
              width: 3600,
              height: 2000,
              background: theme.bgApp,
              borderRadius: 20,
              border: `1px solid ${theme.borderDefault}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                height: 80,
                background: theme.bgSurface,
                borderBottom: `1px solid ${theme.borderDefault}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 36px",
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: theme.textPrimary,
                }}
              >
                Beam B-01 &mdash; Shop Drawing
              </span>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.bgElevated,
                  border: `1px solid ${theme.borderSubtle}`,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    color: theme.textSecondary,
                    lineHeight: 1,
                  }}
                >
                  x
                </span>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ display: "flex", flex: 1 }}>
              {/* SVG Drawing area */}
              <div
                style={{
                  flex: 1,
                  padding: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.bgViewport,
                }}
              >
                <ShopDrawingSVG
                  spacing={spacingValue}
                  frame={frame}
                  animStart={480}
                />
              </div>

              {/* Properties panel */}
              <div
                style={{
                  width: 560,
                  background: theme.bgSidebar,
                  borderLeft: `1px solid ${theme.borderDefault}`,
                  padding: "28px 32px",
                  overflowY: "auto",
                }}
              >
                <PropSection
                  title="Geometry"
                  startFrame={490}
                  frame={frame}
                >
                  <PropRow label="Length" value="6000" mono />
                  <PropRow label="Width" value="300" mono />
                  <PropRow label="Depth" value="600" mono />
                  <PropRow label="Cover" value="40" mono />
                  <PropRow label="Chamfer" value="25" mono />
                </PropSection>

                <PropSection
                  title="Bottom Rebar"
                  startFrame={510}
                  frame={frame}
                >
                  <PropRow label="Count" value="3" mono />
                  <PropRow label="Dia" value="20" mono />
                </PropSection>

                <PropSection
                  title="Top Rebar"
                  startFrame={525}
                  frame={frame}
                >
                  <PropRow label="Count" value="2" mono />
                  <PropRow label="Dia" value="16" mono />
                </PropSection>

                <PropSection
                  title="Stirrups"
                  startFrame={540}
                  frame={frame}
                >
                  <PropRow label="Dia" value="10" mono />
                  <PropRow
                    label="Spacing"
                    value={String(spacingValue)}
                    highlighted={spacingHighlighted}
                    mono
                  />
                  <PropRow label="End spc" value="100" mono />
                  <PropRow label="End zone" value="1200" mono />
                </PropSection>

                <PropSection
                  title="Materials"
                  startFrame={555}
                  frame={frame}
                >
                  <PropRow label="Concrete" value="C30/37" />
                  <PropRow label="Steel" value="B500B" />
                </PropSection>
              </div>
            </div>
          </div>

          {/* Toast notification */}
          {toastOpacity > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 160,
                left: "50%",
                transform: "translateX(-50%)",
                background: theme.greenDim,
                border: `1px solid ${theme.green}`,
                borderRadius: 10,
                padding: "14px 32px",
                opacity: toastOpacity,
                zIndex: 60,
              }}
            >
              <span
                style={{
                  color: theme.green,
                  fontSize: 24,
                  fontWeight: 600,
                  fontFamily: theme.fontUi,
                }}
              >
                Drawing updated
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Cursor ─────────────────────────────────────────────── */}
      <Cursor
        x={cursorX}
        y={cursorY}
        opacity={cursorOpacity}
        clicking={clicking}
      />

      {/* ── Stats Phase ────────────────────────────────────────── */}
      {showStats && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: statsOpacity,
            background: theme.bgVoid,
            zIndex: 70,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 120,
              marginBottom: 60,
            }}
          >
            <StatCounter
              value={96}
              label="panels detailed"
              color={theme.textPrimary}
              startFrame={1290}
              frame={frame}
            />
            <StatCounter
              value={34}
              label="required corrections"
              color={theme.amber}
              startFrame={1330}
              frame={frame}
            />
            <StatCounter
              value={62}
              label="approved as-generated"
              color={theme.green}
              startFrame={1370}
              frame={frame}
            />
          </div>

          {/* Time comparison */}
          <FadeIn startFrame={1420} duration={20} slideY={30}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 60,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 64,
                    fontWeight: 800,
                    fontFamily: theme.fontMono,
                    color: theme.green,
                  }}
                >
                  4 min
                </div>
                <div
                  style={{
                    fontSize: 26,
                    color: theme.textSecondary,
                    marginTop: 6,
                  }}
                >
                  Average time
                </div>
              </div>
              <div
                style={{
                  fontSize: 36,
                  color: theme.textTertiary,
                  fontWeight: 500,
                }}
              >
                vs
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 64,
                    fontWeight: 800,
                    fontFamily: theme.fontMono,
                    color: theme.textTertiary,
                    textDecoration: "line-through",
                    textDecorationColor: theme.error,
                    textDecorationThickness: 4,
                  }}
                >
                  45 min
                </div>
                <div
                  style={{
                    fontSize: 26,
                    color: theme.textTertiary,
                    marginTop: 6,
                  }}
                >
                  Manual
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      )}

      {/* ── End Card ───────────────────────────────────────────── */}
      {showEndCard && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: endCardOpacity,
            background: theme.bgVoid,
            zIndex: 80,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: theme.textPrimary,
              fontFamily: theme.fontUi,
              marginBottom: 60,
              textAlign: "center",
            }}
          >
            Every correction makes the AI smarter.
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: 1400,
              position: "relative",
            }}
          >
            {/* Track */}
            <div
              style={{
                width: "100%",
                height: 24,
                background: theme.bgElevated,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Fill */}
              <div
                style={{
                  height: "100%",
                  borderRadius: 12,
                  background: `linear-gradient(90deg, ${theme.accent}, ${theme.green})`,
                  width: `${interpolate(
                    frame,
                    [1560, 1580, 1600, 1620],
                    [65, 80, 80, 95],
                    clamp
                  )}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Labels */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              {[
                { label: "Today", pct: "65%" },
                { label: "Next month", pct: "80%" },
                { label: "Next year", pct: "95%" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontFamily: theme.fontMono,
                      color: theme.accent,
                      fontWeight: 700,
                    }}
                  >
                    {item.pct}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      color: theme.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
