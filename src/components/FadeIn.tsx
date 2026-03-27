import { useCurrentFrame, interpolate } from "remotion";

export const FadeIn: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  duration?: number;
  slideY?: number;
  style?: React.CSSProperties;
}> = ({ children, startFrame, duration = 15, slideY = 40, style }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [slideY, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)`, ...style }}>
      {children}
    </div>
  );
};
