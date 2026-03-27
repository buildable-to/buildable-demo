import { useCurrentFrame } from "remotion";
import { theme } from "../theme";

export const TypeWriter: React.FC<{
  text: string;
  startFrame: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
  cursorColor?: string;
}> = ({ text, startFrame, charsPerFrame = 0.8, style, cursorColor }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
  const done = chars >= text.length;
  const showCursor = elapsed > 0 && (!done || (frame % 30 < 15));

  return (
    <span style={{ fontFamily: theme.fontMono, ...style }}>
      {text.slice(0, chars)}
      {showCursor && (
        <span
          style={{
            borderRight: `2px solid ${cursorColor || theme.accent}`,
            marginLeft: 1,
            animation: "none",
          }}
        >
          &thinsp;
        </span>
      )}
    </span>
  );
};
