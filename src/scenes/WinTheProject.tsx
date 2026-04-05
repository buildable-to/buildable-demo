import React, { useMemo } from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FadeIn } from "../components/FadeIn";
import { TypeWriter } from "../components/TypeWriter";
import { theme } from "../theme";

// ---------------------------------------------------------------------------
// Pre-create materials (module-level, never re-created per frame)
// ---------------------------------------------------------------------------
const BUILDING_MATERIALS = {
  wallPanel: new THREE.MeshStandardMaterial({ color: 0xc8c8c8, roughness: 0.8, metalness: 0.05 }),
  slab: new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 0.85 }),
  column: new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.7, metalness: 0.15 }),
  stairCore: new THREE.MeshStandardMaterial({ color: 0xff8c42, roughness: 0.7, metalness: 0.1 }),
  beam: new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.7, metalness: 0.1 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.95, metalness: 0 }),
};

// ---------------------------------------------------------------------------
// BuildingCameraRig
// ---------------------------------------------------------------------------
const BuildingCameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();

  const angle = interpolate(
    frame,
    [450, 750, 1140, 1500],
    [Math.PI * 0.25, Math.PI * 0.7, Math.PI * 1.5, Math.PI * 1.8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const elevation = interpolate(
    frame,
    [450, 600, 900, 1140, 1500],
    [0.6, 0.35, 0.25, 0.35, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const distance = interpolate(
    frame,
    [450, 600, 900, 1140, 1260, 1500],
    [5.0, 3.5, 2.8, 3.0, 3.0, 3.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  camera.position.set(
    Math.cos(angle) * distance,
    elevation * distance,
    Math.sin(angle) * distance,
  );
  camera.lookAt(0, 0.3, 0);
  camera.updateProjectionMatrix();

  return null;
};

// ---------------------------------------------------------------------------
// ProceduralBuilding
// ---------------------------------------------------------------------------
const ProceduralBuilding: React.FC<{ upperFloorH: number }> = ({ upperFloorH }) => {
  const footprintX = 18;
  const footprintZ = 30;
  const groundFloorH = 4;
  const wallThickness = 0.2;
  const slabThickness = 0.265;
  const columnSize = 0.4;

  const meshes = useMemo(() => {
    const items: {
      key: string;
      geo: [number, number, number];
      pos: [number, number, number];
      mat: THREE.MeshStandardMaterial;
    }[] = [];

    const totalHeight = groundFloorH + 4 * upperFloorH;
    const ox = -footprintX / 2;
    const oz = -footprintZ / 2;
    const scale = 2.5 / 30;

    // Ground slab
    items.push({
      key: "ground-slab",
      geo: [footprintX, slabThickness, footprintZ],
      pos: [(ox + footprintX / 2) * scale, 0, (oz + footprintZ / 2) * scale],
      mat: BUILDING_MATERIALS.slab,
    });

    // Floor slabs (4 upper floors + roof = 5)
    for (let i = 1; i <= 5; i++) {
      const y = groundFloorH + (i - 1) * upperFloorH;
      items.push({
        key: `floor-slab-${i}`,
        geo: [footprintX, slabThickness, footprintZ],
        pos: [(ox + footprintX / 2) * scale, y * scale, (oz + footprintZ / 2) * scale],
        mat: BUILDING_MATERIALS.slab,
      });
    }

    // Wall panels per floor
    const floorHeights = [groundFloorH, upperFloorH, upperFloorH, upperFloorH, upperFloorH];
    let yBase = 0;
    for (let f = 0; f < 5; f++) {
      const fh = floorHeights[f];
      const yCenter = yBase + fh / 2;

      // Front wall (z=0)
      items.push({
        key: `wall-front-${f}`,
        geo: [footprintX, fh, wallThickness],
        pos: [(ox + footprintX / 2) * scale, yCenter * scale, (oz + 0) * scale],
        mat: BUILDING_MATERIALS.wallPanel,
      });
      // Back wall (z=footprintZ)
      items.push({
        key: `wall-back-${f}`,
        geo: [footprintX, fh, wallThickness],
        pos: [(ox + footprintX / 2) * scale, yCenter * scale, (oz + footprintZ) * scale],
        mat: BUILDING_MATERIALS.wallPanel,
      });
      // Left wall (x=0)
      items.push({
        key: `wall-left-${f}`,
        geo: [wallThickness, fh, footprintZ],
        pos: [(ox + 0) * scale, yCenter * scale, (oz + footprintZ / 2) * scale],
        mat: BUILDING_MATERIALS.wallPanel,
      });
      // Right wall (x=footprintX)
      items.push({
        key: `wall-right-${f}`,
        geo: [wallThickness, fh, footprintZ],
        pos: [(ox + footprintX) * scale, yCenter * scale, (oz + footprintZ / 2) * scale],
        mat: BUILDING_MATERIALS.wallPanel,
      });
      yBase += fh;
    }

    // Columns at ground floor (4m height) — grid at 6m spacing
    const colXPositions = [3, 6, 9, 12, 15];
    const colZPositions = [5, 10, 15, 20, 25];
    for (const cx of colXPositions) {
      for (const cz of colZPositions) {
        items.push({
          key: `col-${cx}-${cz}`,
          geo: [columnSize, groundFloorH, columnSize],
          pos: [(ox + cx) * scale, (groundFloorH / 2) * scale, (oz + cz) * scale],
          mat: BUILDING_MATERIALS.column,
        });
      }
    }

    // Stair cores — 2 tall boxes
    items.push({
      key: "stair-core-1",
      geo: [3, totalHeight, 4],
      pos: [(ox + 3) * scale, (totalHeight / 2) * scale, (oz + 7) * scale],
      mat: BUILDING_MATERIALS.stairCore,
    });
    items.push({
      key: "stair-core-2",
      geo: [3, totalHeight, 4],
      pos: [(ox + 15) * scale, (totalHeight / 2) * scale, (oz + 23) * scale],
      mat: BUILDING_MATERIALS.stairCore,
    });

    // Ground plane
    items.push({
      key: "ground-plane",
      geo: [60, 0.1, 60],
      pos: [0, -0.05 * scale, 0],
      mat: BUILDING_MATERIALS.ground,
    });

    return { items, scale };
  }, [upperFloorH]);

  return (
    <group>
      {meshes.items.map((m) => (
        <mesh
          key={m.key}
          position={m.pos}
          material={m.mat}
          scale={[meshes.scale, meshes.scale, meshes.scale]}
        >
          <boxGeometry args={m.geo} />
        </mesh>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Main scene
// ---------------------------------------------------------------------------
const SPEC_TEXT =
  "5-story residential building, 18\u00D730m footprint, precast sandwich wall panels 200mm, hollow core slabs 265mm, C30/37 concrete, 3m floor height, 2 stairwells, ground floor with 4m commercial space height";

const STRUCTURAL_ROWS = [
  { name: "Wall Panels", count: "96 pcs", volume: "412 m\u00B3 concrete" },
  { name: "Hollow Core", count: "180 pcs", volume: "286 m\u00B3 concrete" },
  { name: "Columns", count: "24 pcs", volume: "38 m\u00B3 concrete" },
  { name: "Beams", count: "60 pcs", volume: "54 m\u00B3 concrete" },
  { name: "Stairs", count: "4 flights", volume: "12 m\u00B3 concrete" },
];

export const WinTheProject: React.FC = () => {
  const frame = useCurrentFrame();

  // ---------------------------------------------------------------------------
  // upperFloorH — drives the quick-edit demo
  // ---------------------------------------------------------------------------
  const upperFloorH = interpolate(frame, [1310, 1380], [3.0, 3.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animated cost values (change during quick edit)
  const concreteTotalAnimated = interpolate(frame, [1350, 1440], [802, 835], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rebarTotalAnimated = interpolate(frame, [1350, 1440], [64160, 66800], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------------------------------------------------------------------------
  // Phase helpers
  // ---------------------------------------------------------------------------
  // Phase 1-2: Input screen overall opacity
  const inputScreenOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Phase 3: Input fade-out
  const inputFadeOut = interpolate(frame, [285, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Phase 3: Loading state
  const loadingOpacity =
    interpolate(frame, [300, 310], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [420, 450], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Phase 4: 3D viewport
  const viewportOpacity = interpolate(frame, [450, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buildingScale = interpolate(frame, [450, 480], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 5: Cost panel
  const costPanelX = interpolate(frame, [750, 790], [900, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 7: Everything fades out, closing text
  const allFadeOut = interpolate(frame, [1500, 1520], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const closingOpacity =
    interpolate(frame, [1530, 1545], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [1628, 1650], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Generate button
  const generateBtnOpacity = interpolate(frame, [240, 255], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const generateBtnScale =
    frame >= 270 && frame < 278
      ? 0.95
      : 1.0;
  const generateBtnText = frame >= 270 ? "Generating..." : "Generate";

  // Loading status messages
  const getStatusMessage = () => {
    if (frame < 340) return "Analyzing structure...";
    if (frame < 380) return "Generating 3D model...";
    return "Calculating costs...";
  };

  // Pulsing dots for loading
  const dotOpacity = (offset: number) =>
    0.3 + 0.7 * Math.abs(Math.sin((frame - 300) * 0.12 + offset));

  // Logo pulsing ring during loading
  const logoRingScale = 1 + 0.08 * Math.sin(frame * 0.15);

  // Phase 6: Quick edit overlay
  const editOverlayOpacity = interpolate(frame, [1260, 1280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const highlightOpacity = interpolate(frame, [1280, 1295], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const oldValueOpacity = interpolate(frame, [1295, 1310], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const newValueOpacity = interpolate(frame, [1295, 1310], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cost value change flash (green border)
  const costChangeFlash = interpolate(frame, [1350, 1370, 1440, 1460], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Show input phase (phases 1-3 input)
  const showInput = frame < 300;
  // Show loading (phase 3)
  const showLoading = frame >= 300 && frame < 450;
  // Show viewport (phase 4-6)
  const showViewport = frame >= 450 && frame < 1520;
  // Show closing (phase 7)
  const showClosing = frame >= 1520;

  return (
    <div
      style={{
        width: 3840,
        height: 2160,
        background: theme.bgVoid,
        fontFamily: theme.fontUi,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ================================================================== */}
      {/* PHASE 1-2: Clean Input Screen                                      */}
      {/* ================================================================== */}
      {showInput && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: inputScreenOpacity * inputFadeOut,
          }}
        >
          {/* Logo */}
          <FadeIn startFrame={10} duration={20} slideY={20}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Img
                src={staticFile("assets/logo.png")}
                style={{
                  width: 80,
                  height: 80,
                  filter: "drop-shadow(0 0 24px rgba(79,143,247,0.3))",
                }}
              />
              <span
                style={{
                  color: theme.textPrimary,
                  fontSize: 36,
                  fontWeight: 600,
                  marginTop: 16,
                }}
              >
                Buildable
              </span>
            </div>
          </FadeIn>

          {/* Textarea container */}
          <FadeIn startFrame={20} duration={20} slideY={30}>
            <div
              style={{
                width: 1600,
                minHeight: 300,
                marginTop: 48,
                background: theme.bgElevated,
                border: `2px solid ${theme.borderDefault}`,
                borderRadius: 24,
                padding: 32,
                position: "relative",
              }}
            >
              {/* Placeholder / typed text */}
              {frame < 60 ? (
                <span style={{ fontSize: 32, color: theme.textGhost, fontFamily: theme.fontMono }}>
                  Describe your building...
                </span>
              ) : (
                <TypeWriter
                  text={SPEC_TEXT}
                  startFrame={60}
                  charsPerFrame={1.0}
                  style={{
                    fontSize: 32,
                    color: theme.textPrimary,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                />
              )}
            </div>
          </FadeIn>

          {/* Generate button */}
          {frame >= 240 && (
            <div
              style={{
                marginTop: 32,
                opacity: generateBtnOpacity * inputFadeOut,
                transform: `scale(${generateBtnScale})`,
                transition: "transform 0.1s",
              }}
            >
              <div
                style={{
                  background: theme.accent,
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 600,
                  padding: "16px 48px",
                  borderRadius: 16,
                  cursor: "pointer",
                }}
              >
                {generateBtnText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* PHASE 3: Loading State                                             */}
      {/* ================================================================== */}
      {showLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: loadingOpacity,
          }}
        >
          {/* Pulsing logo with ring */}
          <div style={{ position: "relative", marginBottom: 48 }}>
            <Img
              src={staticFile("assets/logo.png")}
              style={{ width: 120, height: 120 }}
            />
            <div
              style={{
                position: "absolute",
                top: -16,
                left: -16,
                width: 152,
                height: 152,
                borderRadius: "50%",
                border: `3px solid ${theme.accent}`,
                opacity: 0.4 + 0.3 * Math.sin(frame * 0.15),
                transform: `scale(${logoRingScale})`,
              }}
            />
          </div>

          {/* Status message */}
          <div style={{ fontSize: 32, color: theme.textSecondary, marginBottom: 24 }}>
            {getStatusMessage()}
          </div>

          {/* Pulsing dots */}
          <div style={{ display: "flex", gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={`dot-${i}`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: theme.accent,
                  opacity: dotOpacity(i * 1.2),
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PHASE 4-6: 3D Viewport + Overlays                                 */}
      {/* ================================================================== */}
      {showViewport && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: viewportOpacity * allFadeOut,
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
            <span
              style={{
                color: theme.textPrimary,
                fontWeight: 600,
                fontSize: 28,
                marginRight: 24,
              }}
            >
              Buildable
            </span>
            <span style={{ color: theme.borderStrong, margin: "0 16px" }}>|</span>
            <span style={{ color: theme.textSecondary, fontSize: 26 }}>Project Studio</span>
          </div>

          {/* ThreeCanvas viewport */}
          <div
            style={{
              position: "absolute",
              top: 88,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <ThreeCanvas
              width={3840}
              height={2160 - 88}
              camera={{ fov: 40, position: [4, 2, 4] }}
              style={{ width: "100%", height: "100%" }}
            >
              <color attach="background" args={["#1a2030"]} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 15, 8]} intensity={1.0} />
              <directionalLight position={[-5, 8, -5]} intensity={0.3} />
              <hemisphereLight args={["#b1e1ff", "#b97a20", 0.25]} />
              <BuildingCameraRig frame={frame} />
              <group scale={[buildingScale, buildingScale, buildingScale]}>
                <ProceduralBuilding upperFloorH={upperFloorH} />
              </group>
            </ThreeCanvas>
          </div>

          {/* ============================================================== */}
          {/* PHASE 5: Cost Panel                                            */}
          {/* ============================================================== */}
          {frame >= 750 && (
            <div
              style={{
                position: "absolute",
                top: 88,
                right: 0,
                width: 900,
                bottom: 0,
                background: "rgba(15,16,20,0.95)",
                borderLeft: `2px solid ${theme.borderDefault}`,
                transform: `translateX(${costPanelX}px)`,
                padding: 48,
                display: "flex",
                flexDirection: "column",
                zIndex: 5,
                overflow: "hidden",
              }}
            >
              {/* Title */}
              <div
                style={{
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  fontSize: 22,
                  color: theme.textTertiary,
                  marginBottom: 32,
                }}
              >
                Project Summary
              </div>

              {/* Structural Elements */}
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: theme.textTertiary,
                  marginBottom: 16,
                  opacity: interpolate(frame, [800, 812], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                Structural Elements
              </div>

              {STRUCTURAL_ROWS.map((row, i) => {
                const lineStart = 800 + i * 20;
                const lineOp = interpolate(frame, [lineStart, lineStart + 12], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={row.name}
                    style={{
                      opacity: lineOp,
                      transform: `translateY(${(1 - lineOp) * 8}px)`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      fontSize: 24,
                      color: theme.textSecondary,
                    }}
                  >
                    <div style={{ display: "flex", gap: 16 }}>
                      <span>{row.name}</span>
                      <span
                        style={{
                          fontFamily: theme.fontMono,
                          color: theme.textTertiary,
                        }}
                      >
                        {row.count}
                      </span>
                    </div>
                    <span style={{ fontFamily: theme.fontMono, color: theme.textTertiary }}>
                      {row.volume}
                    </span>
                  </div>
                );
              })}

              {/* Materials section */}
              {frame >= 960 && (
                <div style={{ marginTop: 32 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      color: theme.textTertiary,
                      marginBottom: 16,
                      opacity: interpolate(frame, [960, 972], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    Materials
                  </div>

                  {/* Total Concrete */}
                  {(() => {
                    const lineOp = interpolate(frame, [960, 972], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                    const val = Math.floor(
                      interpolate(frame, [960, 1000], [0, concreteTotalAnimated], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    );
                    return (
                      <div
                        style={{
                          opacity: lineOp,
                          transform: `translateY(${(1 - lineOp) * 8}px)`,
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          fontSize: 24,
                          color: theme.textSecondary,
                          borderLeft: costChangeFlash > 0.5 && frame >= 1350 ? `3px solid ${theme.green}` : "3px solid transparent",
                          paddingLeft: 12,
                        }}
                      >
                        <span>Total Concrete</span>
                        <span style={{ fontFamily: theme.fontMono, color: theme.green, fontWeight: 600 }}>
                          {val.toLocaleString()} m\u00B3
                        </span>
                      </div>
                    );
                  })()}

                  {/* Total Rebar */}
                  {(() => {
                    const lineOp = interpolate(frame, [980, 992], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                    const val = Math.floor(
                      interpolate(frame, [980, 1020], [0, rebarTotalAnimated], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    );
                    return (
                      <div
                        style={{
                          opacity: lineOp,
                          transform: `translateY(${(1 - lineOp) * 8}px)`,
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          fontSize: 24,
                          color: theme.textSecondary,
                          borderLeft: costChangeFlash > 0.5 && frame >= 1350 ? `3px solid ${theme.green}` : "3px solid transparent",
                          paddingLeft: 12,
                        }}
                      >
                        <span>Total Rebar</span>
                        <span style={{ fontFamily: theme.fontMono, color: theme.textPrimary }}>
                          {val.toLocaleString()} kg
                        </span>
                      </div>
                    );
                  })()}

                  {/* Insulation */}
                  {(() => {
                    const lineOp = interpolate(frame, [1000, 1012], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                    const val = Math.floor(
                      interpolate(frame, [1000, 1040], [0, 1440], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    );
                    return (
                      <div
                        style={{
                          opacity: lineOp,
                          transform: `translateY(${(1 - lineOp) * 8}px)`,
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          fontSize: 24,
                          color: theme.textSecondary,
                        }}
                      >
                        <span>Insulation</span>
                        <span style={{ fontFamily: theme.fontMono, color: theme.textPrimary }}>
                          {val.toLocaleString()} m\u00B2
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Divider */}
              <div
                style={{
                  height: 2,
                  background: theme.borderDefault,
                  margin: "24px 0",
                  opacity: interpolate(frame, [1020, 1035], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              />

              {/* Cost Estimate total */}
              {frame >= 1020 && (() => {
                const totalOp = interpolate(frame, [1020, 1040], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                // Animate cost estimate — changes during quick edit
                const baseCost = interpolate(frame, [1350, 1440], [1_245_000, 1_298_000], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const costVal = Math.floor(
                  interpolate(frame, [1040, 1080], [0, baseCost], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                );
                const perSqm = Math.floor(costVal / 2700);
                return (
                  <div style={{ opacity: totalOp }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                      }}
                    >
                      <span style={{ fontSize: 28, fontWeight: 600, color: theme.textPrimary }}>
                        Cost Estimate
                      </span>
                      <span
                        style={{
                          fontFamily: theme.fontMono,
                          fontSize: 36,
                          fontWeight: 700,
                          color: theme.green,
                        }}
                      >
                        \u20AC{costVal.toLocaleString()}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 0",
                        fontSize: 24,
                        color: theme.textTertiary,
                      }}
                    >
                      <span>Per m\u00B2 (2,700 m\u00B2)</span>
                      <span style={{ fontFamily: theme.fontMono }}>
                        \u20AC{perSqm}/m\u00B2
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ============================================================== */}
          {/* PHASE 6: Quick Edit Overlay                                    */}
          {/* ============================================================== */}
          {frame >= 1260 && frame < 1500 && (
            <div
              style={{
                position: "absolute",
                top: 120,
                left: 32,
                opacity: editOverlayOpacity * allFadeOut,
                zIndex: 8,
              }}
            >
              <div
                style={{
                  background: theme.bgSidebar,
                  border: `2px solid ${theme.borderDefault}`,
                  borderRadius: 16,
                  padding: 20,
                  fontSize: 22,
                  fontFamily: theme.fontMono,
                  color: theme.textSecondary,
                  lineHeight: 1.8,
                  maxWidth: 800,
                  whiteSpace: "pre-wrap",
                }}
              >
                5-story residential building{"\n"}
                18\u00D730m footprint{"\n"}
                precast sandwich wall panels 200mm{"\n"}
                hollow core slabs 265mm{"\n"}
                C30/37 concrete{"\n"}
                <span style={{ position: "relative", display: "inline" }}>
                  <span
                    style={{
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <span style={{ opacity: oldValueOpacity }}>3m</span>
                    <span
                      style={{
                        opacity: newValueOpacity,
                        position: oldValueOpacity > 0.5 ? "absolute" : "relative",
                        left: 0,
                        color: theme.accent,
                        fontWeight: 700,
                      }}
                    >
                      3.2m
                    </span>
                  </span>
                  {/* Highlight box */}
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      left: -8,
                      right: -8,
                      bottom: -4,
                      background: theme.accentGlow,
                      border: `2px solid ${theme.accent}`,
                      borderRadius: 6,
                      opacity: highlightOpacity,
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />
                </span>
                {" "}floor height{"\n"}
                2 stairwells{"\n"}
                ground floor 4m commercial height
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* PHASE 7: Closing                                                   */}
      {/* ================================================================== */}
      {showClosing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: closingOpacity,
          }}
        >
          <FadeIn startFrame={1530} duration={30} slideY={30}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: theme.textPrimary,
                textAlign: "center",
              }}
            >
              You won the project.
            </div>
          </FadeIn>
          <FadeIn startFrame={1560} duration={30} slideY={20}>
            <div
              style={{
                fontSize: 52,
                fontWeight: 300,
                color: theme.textSecondary,
                textAlign: "center",
                marginTop: 24,
              }}
            >
              Now let's engineer it.
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
};
