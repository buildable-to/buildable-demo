import React, { useRef, useMemo, useEffect } from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FadeIn } from "../components/FadeIn";
import { theme } from "../theme";

// Classify mesh by name into concrete, rebar, or other
function classifyMesh(name: string): "concrete" | "rebar" | "other" {
  const lower = name.toLowerCase();
  if (lower.includes("rebar") || lower.includes("stirrup") || lower.includes("reinforc")) {
    return "rebar";
  }
  if (lower.includes("concrete") || lower.includes("beam") || lower.includes("slab") || lower.includes("column")) {
    return "concrete";
  }
  return "other";
}

// Pre-create materials once to avoid recreation per frame
const MATERIALS = {
  normal: {
    concrete: new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.7, metalness: 0.1 }),
    rebar: new THREE.MeshStandardMaterial({ color: 0xd44040, roughness: 0.5, metalness: 0.3 }),
    other: new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.6, metalness: 0.2 }),
  },
  xray: {
    concrete: new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.7, transparent: true, opacity: 0.15, depthWrite: false }),
    rebar: new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.4, metalness: 0.4, emissive: new THREE.Color(0x330000) }),
    other: new THREE.MeshStandardMaterial({ color: 0x606060, transparent: true, opacity: 0.3, depthWrite: false }),
  },
  rebar: {
    rebar: new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.4, metalness: 0.4, emissive: new THREE.Color(0x330000) }),
  },
};

// Camera controller — updates the ThreeCanvas camera each frame
const CameraRig: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
  const { camera } = useThree();

  const angle = interpolate(frame, [0, totalFrames], [0, Math.PI * 1.2], {
    extrapolateRight: "clamp",
  });
  const elevation = interpolate(
    frame,
    [0, totalFrames * 0.3, totalFrames * 0.6, totalFrames],
    [0.5, 0.2, 0.6, 0.3],
    { extrapolateRight: "clamp" }
  );
  const distance = interpolate(
    frame,
    [0, totalFrames * 0.35, totalFrames * 0.7, totalFrames],
    [2.8, 2.0, 1.6, 2.4],
    { extrapolateRight: "clamp" }
  );

  camera.position.set(
    Math.cos(angle) * distance,
    elevation * distance,
    Math.sin(angle) * distance
  );
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  return null;
};

// The actual 3D model
const BeamModel: React.FC<{
  viewMode: "normal" | "xray" | "rebar";
}> = ({ viewMode }) => {
  const glb = useGLTF(staticFile("assets/beam-3d.glb"));
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene once, store mesh classification
  const { clonedScene, scale, offset } = useMemo(() => {
    const cloned = glb.scene.clone(true);
    // Tag each mesh with its classification
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData._meshType = classifyMesh(child.name);
      }
    });
    // Compute centering
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 2 / maxDim;
    return {
      clonedScene: cloned,
      scale: s,
      offset: new THREE.Vector3(-center.x * s, -center.y * s, -center.z * s),
    };
  }, [glb.scene]);

  // Apply view mode by swapping materials (no cloning)
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const type = child.userData._meshType as "concrete" | "rebar" | "other";
        if (viewMode === "normal") {
          child.material = MATERIALS.normal[type] || MATERIALS.normal.other;
          child.visible = true;
        } else if (viewMode === "xray") {
          child.material = MATERIALS.xray[type] || MATERIALS.xray.other;
          child.visible = true;
        } else {
          // rebar only
          if (type === "rebar") {
            child.material = MATERIALS.rebar.rebar;
            child.visible = true;
          } else {
            child.visible = false;
          }
        }
      }
    });
  }, [clonedScene, viewMode]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} />
      <group
        ref={groupRef}
        scale={[scale, scale, scale]}
        position={[offset.x, offset.y, offset.z]}
      >
        <primitive object={clonedScene} />
      </group>
    </>
  );
};

export const RealModelingStudio: React.FC = () => {
  const frame = useCurrentFrame();
  // Total: 16s = 480 frames

  const uiOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // View mode transitions synced to voice:
  // "inspect from any angle" ~3s, "x-ray mode" ~7s(210f), "rebar-only" ~12s(360f)
  // 0-170: normal, 170-300: xray, 300-480: rebar only
  const viewMode: "normal" | "xray" | "rebar" =
    frame < 170 ? "normal" : frame < 300 ? "xray" : "rebar";

  // View mode label
  const viewLabel =
    viewMode === "normal" ? "NORMAL" : viewMode === "xray" ? "X-RAY" : "REBAR ONLY";

  // Fade out at end
  const fadeOut = interpolate(frame, [458, 480], [1, 0], {
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
          {(["Normal", "X-Ray", "Rebar"] as const).map((mode, i) => {
            const isActive =
              (i === 0 && viewMode === "normal") ||
              (i === 1 && viewMode === "xray") ||
              (i === 2 && viewMode === "rebar");
            return (
              <div
                key={mode}
                style={{
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 6,
                  color: isActive ? theme.textPrimary : theme.textTertiary,
                  background: isActive ? theme.bgActive : "transparent",
                }}
              >
                {mode}
              </div>
            );
          })}
        </div>
      </div>

      {/* Left sidebar — Model info */}
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
          Rectangular Beam
        </div>

        {/* Model details */}
        <FadeIn startFrame={60} slideY={5}>
          <div style={{ padding: "12px 14px", marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: theme.textTertiary, marginBottom: 8 }}>
              Details
            </div>
            {[
              { label: "Size", value: "300 × 500 mm" },
              { label: "Length", value: "6,000 mm" },
              { label: "Rebars", value: "5 longitudinal" },
              { label: "Stirrups", value: "42 @ 150mm" },
              { label: "Bearing", value: "Pads × 2" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 10, color: theme.textSecondary }}>
                <span style={{ color: theme.textTertiary }}>{item.label}</span>
                <span style={{ fontFamily: theme.fontMono, fontSize: 10 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Center — 3D Viewport with real GLB */}
      <div
        style={{
          flex: 1,
          marginTop: 44,
          background: viewMode === "xray"
            ? `linear-gradient(180deg, #0d1520, ${theme.bgViewport})`
            : theme.bgViewport,
          position: "relative",
        }}
      >
        {/* Three.js canvas */}
        <ThreeCanvas
          width={1320}
          height={1036}
          camera={{
            fov: 45,
            position: [3, 1.5, 3],
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <color attach="background" args={[theme.bgViewport]} />
          <CameraRig frame={frame} totalFrames={480} />
          <BeamModel viewMode={viewMode} />
          <gridHelper args={[10, 20, "#333", "#222"]} position={[0, -1, 0]} />
        </ThreeCanvas>

        {/* View mode label */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            fontSize: 11,
            fontFamily: theme.fontMono,
            color: viewMode === "normal" ? theme.textTertiary : theme.violet,
            background:
              viewMode === "normal"
                ? theme.bgElevated
                : "rgba(155, 122, 255, 0.1)",
            border: `1px solid ${viewMode === "normal" ? theme.borderDefault : "rgba(155, 122, 255, 0.3)"}`,
            padding: "4px 10px",
            borderRadius: 6,
          }}
        >
          {viewLabel}
        </div>
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
              Rectangular precast beam, 300x500mm, 6 meters, with rebar and stirrups
            </div>
          </div>

          {/* Agent response */}
          <FadeIn startFrame={10} slideY={6}>
            <div
              style={{
                borderLeft: "2px solid rgba(155, 122, 255, 0.4)",
                padding: "8px 12px",
              }}
            >
              <p style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 }}>
                Done. <strong style={{ color: theme.textPrimary }}>300×500mm beam</strong>, 6 meters,
                5 longitudinal rebars, 42 stirrups at 150mm spacing. Bearing pads at both ends.
              </p>
              <p style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6, marginTop: 8 }}>
                Toggle <strong style={{ color: theme.violet }}>X-Ray</strong> or{" "}
                <strong style={{ color: theme.violet }}>Rebar Only</strong> to inspect reinforcement.
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
