import React, { useMemo, useEffect } from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

// Pre-create materials
const WAREHOUSE_MATERIALS: Record<string, THREE.MeshStandardMaterial> = {
  concrete: new THREE.MeshStandardMaterial({ color: 0xc8c8c8, roughness: 0.8, metalness: 0.05 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.85, metalness: 0.02, side: THREE.DoubleSide }),
  steel: new THREE.MeshStandardMaterial({ color: 0x707080, roughness: 0.3, metalness: 0.7 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x5a6e4a, roughness: 0.95, metalness: 0 }),
  tree_trunk: new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9, metalness: 0 }),
  tree_canopy: new THREE.MeshStandardMaterial({ color: 0x2d7a3a, roughness: 0.85, metalness: 0 }),
  foundation: new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.9, metalness: 0 }),
  roof: new THREE.MeshStandardMaterial({ color: 0xb8c0c8, roughness: 0.7, metalness: 0.1 }),
  grid: new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.4 }),
  default: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.7, metalness: 0.1 }),
};

function classifyWarehouseMesh(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("soil") || lower.includes("ground")) return "ground";
  if (lower.includes("treetrunk")) return "tree_trunk";
  if (lower.includes("treecanopy")) return "tree_canopy";
  if (lower.includes("foundation") || lower.includes("pad")) return "foundation";
  if (lower.includes("wall")) return "wall";
  if (lower.includes("steel") || lower.includes("plate")) return "steel";
  if (lower.includes("hollowcore") || lower.includes("roof") || lower.includes("ridge")) return "roof";
  if (lower.includes("grid")) return "grid";
  if (lower.includes("column") || lower.includes("beam") || lower.includes("corbel") || lower.includes("purlin")) return "concrete";
  return "default";
}

// Camera controller — wide cinematic orbit for the warehouse
const CameraRig: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const { camera } = useThree();

  // Wide orbit showing the full warehouse from different angles
  const angle = interpolate(frame, [0, totalFrames], [0.3, Math.PI * 0.9], {
    extrapolateRight: "clamp",
  });
  // Start high, come down to eye level, then slightly up again
  const elevation = interpolate(
    frame,
    [0, totalFrames * 0.25, totalFrames * 0.55, totalFrames],
    [0.6, 0.35, 0.25, 0.45],
    { extrapolateRight: "clamp" }
  );
  // Zoom: start far, slowly zoom in, pull back
  const distance = interpolate(
    frame,
    [0, totalFrames * 0.3, totalFrames * 0.65, totalFrames],
    [4.0, 3.0, 2.5, 3.2],
    { extrapolateRight: "clamp" }
  );

  camera.position.set(
    Math.cos(angle) * distance,
    elevation * distance,
    Math.sin(angle) * distance
  );
  camera.lookAt(0, 0.2, 0);
  camera.updateProjectionMatrix();

  return null;
};

const WarehouseModel: React.FC = () => {
  const glb = useGLTF(staticFile("assets/warehouse-3d.glb"));

  const { clonedScene, scale, offset } = useMemo(() => {
    const cloned = glb.scene.clone(true);
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData._meshType = classifyWarehouseMesh(child.name);
      }
    });
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 2.5 / maxDim;
    return {
      clonedScene: cloned,
      scale: s,
      offset: new THREE.Vector3(-center.x * s, -center.y * s, -center.z * s),
    };
  }, [glb.scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const type = child.userData._meshType as string;
        child.material = WAREHOUSE_MATERIALS[type] || WAREHOUSE_MATERIALS.default;
        child.visible = true;
      }
    });
  }, [clonedScene]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 6, -4]} intensity={0.3} />
      <hemisphereLight args={["#b1e1ff", "#b97a20", 0.3]} />
      <group
        scale={[scale, scale, scale]}
        position={[offset.x, offset.y, offset.z]}
      >
        <primitive object={clonedScene} />
      </group>
    </>
  );
};

export const WarehouseScene: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 25s = 750 frames

  const uiOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [725, 750], [1, 0], {
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
        <span style={{ color: theme.textSecondary, fontSize: 13 }}>3D Modeling Studio</span>
      </div>

      {/* Left sidebar — context */}
      <div
        style={{
          width: 220,
          marginTop: 44,
          background: theme.bgSidebar,
          borderRight: `1px solid ${theme.borderDefault}`,
          padding: "16px 0",
        }}
      >
        <div
          style={{
            padding: "0 14px 10px",
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: theme.textTertiary,
          }}
        >
          Models
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 14px",
            fontSize: 12,
            color: theme.textPrimary,
            background: theme.bgActive,
            borderLeft: `2px solid ${theme.violet}`,
          }}
        >
          <span style={{ marginRight: 8, fontSize: 14 }}>🏭</span>
          Precast Warehouse
        </div>

        {/* Element breakdown with costs */}
        <div style={{ padding: "16px 14px 0" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: theme.textTertiary,
              marginBottom: 10,
            }}
          >
            Cost Estimate
          </div>
          {[
            { name: "Columns", count: 22, unit: 1850, color: "#c8c8c8" },
            { name: "T-Beams", count: 11, unit: 4200, color: "#c8c8c8" },
            { name: "Purlins", count: 70, unit: 380, color: "#c8c8c8" },
            { name: "Corbels", count: 22, unit: 420, color: "#c8c8c8" },
            { name: "Roof Panels", count: 10, unit: 2800, color: "#b8c0c8" },
            { name: "Wall Panels", count: 4, unit: 6500, color: "#d0d0d0" },
            { name: "Foundations", count: 22, unit: 1200, color: "#999999" },
          ].map((el, i) => {
            const lineStart = 40 + i * 20;
            const lineOp = interpolate(frame, [lineStart, lineStart + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const lineTotal = el.count * el.unit;
            return (
              <div
                key={el.name}
                style={{
                  opacity: lineOp,
                  transform: `translateY(${(1 - lineOp) * 4}px)`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "3px 0",
                  fontSize: 10,
                  color: theme.textSecondary,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: 1, background: el.color }} />
                  <span>{el.name}</span>
                  <span style={{ color: theme.textGhost, fontFamily: theme.fontMono, fontSize: 9 }}>
                    ×{el.count}
                  </span>
                </div>
                <span style={{ fontFamily: theme.fontMono, fontSize: 10, color: theme.textTertiary }}>
                  ${lineTotal.toLocaleString()}
                </span>
              </div>
            );
          })}

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: theme.borderDefault,
              margin: "8px 0",
              opacity: interpolate(frame, [185, 200], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />

          {/* Total — animated counter */}
          {(() => {
            const totalStart = 200;
            const totalOp = interpolate(frame, [totalStart, totalStart + 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const totalTarget = 165_760; // sum of all line items
            const countUp = Math.floor(
              interpolate(frame, [totalStart, totalStart + 40], [0, totalTarget], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            );
            return (
              <div
                style={{
                  opacity: totalOp,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "2px 0",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: theme.textPrimary }}>
                  Estimated Total
                </span>
                <span
                  style={{
                    fontFamily: theme.fontMono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: theme.green,
                  }}
                >
                  ${countUp.toLocaleString()}
                </span>
              </div>
            );
          })()}

          {/* Per-sqm cost */}
          <FadeIn startFrame={260} slideY={3}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "2px 0",
                marginTop: 2,
              }}
            >
              <span style={{ fontSize: 10, color: theme.textTertiary }}>
                Per m² (1,210 m²)
              </span>
              <span
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: 10,
                  color: theme.textTertiary,
                }}
              >
                $137/m²
              </span>
            </div>
          </FadeIn>

          {/* Delivery estimate */}
          <FadeIn startFrame={300} slideY={3}>
            <div
              style={{
                marginTop: 12,
                padding: "8px 10px",
                background: theme.bgVoid,
                borderRadius: 6,
                border: `1px solid ${theme.borderSubtle}`,
              }}
            >
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: theme.textTertiary, marginBottom: 4 }}>
                Production Estimate
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: theme.textSecondary }}>
                <span>Fabrication</span>
                <span style={{ fontFamily: theme.fontMono, color: theme.amber }}>~4 weeks</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: theme.textSecondary, marginTop: 2 }}>
                <span>Erection</span>
                <span style={{ fontFamily: theme.fontMono, color: theme.amber }}>~2 weeks</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Center — 3D Viewport */}
      <div
        style={{
          flex: 1,
          marginTop: 44,
          background: `linear-gradient(180deg, #1a2030, ${theme.bgViewport})`,
          position: "relative",
        }}
      >
        <ThreeCanvas
          width={1300}
          height={1036}
          camera={{ fov: 40, position: [4, 2, 4] }}
          style={{ width: "100%", height: "100%" }}
        >
          <color attach="background" args={["#1a2030"]} />
          <CameraRig frame={frame} totalFrames={750} />
          <WarehouseModel />
        </ThreeCanvas>

        {/* "Estimation Model" badge */}
        <FadeIn startFrame={30} slideY={0}>
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              fontSize: 11,
              fontFamily: theme.fontMono,
              color: theme.green,
              background: "rgba(52, 211, 153, 0.1)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              padding: "4px 10px",
              borderRadius: 6,
            }}
          >
            ESTIMATION MODEL
          </div>
        </FadeIn>
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
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
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
              Precast warehouse, 55x22m, double-pitch roof, 11 bays at 5m spacing, hollow-core panels, pad foundations
            </div>
          </div>

          {/* Response */}
          <FadeIn startFrame={20} slideY={6}>
            <div
              style={{
                borderLeft: "2px solid rgba(155, 122, 255, 0.4)",
                padding: "8px 12px",
              }}
            >
              <p style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 }}>
                Done. <strong style={{ color: theme.textPrimary }}>55×22m precast warehouse</strong> with
                22 columns, 11 T-beam frames, 70 purlins, hollow-core roof panels,
                wall panels, and pad foundations. Ready for cost estimation.
              </p>
              <p style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6, marginTop: 8 }}>
                Total: <strong style={{ color: theme.green }}>161 precast elements</strong> —
                share this model with your client in minutes, not weeks.
              </p>
            </div>
          </FadeIn>
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
            <span>Describe a 3D model...</span>
            <span style={{ color: theme.violet, fontSize: 16 }}>↑</span>
          </div>
        </div>
      </div>
    </div>
  );
};
