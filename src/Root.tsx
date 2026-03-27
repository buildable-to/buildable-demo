import "./index.css";
import { Audio, Composition, Sequence, staticFile } from "remotion";
import { Intro } from "./scenes/Intro";
import { Problem } from "./scenes/Problem";
import { DesignStudio } from "./scenes/DesignStudio";
import { ModelingStudio } from "./scenes/ModelingStudio";
import { Outro } from "./scenes/Outro";

const FPS = 30;

// Scene durations matched to voice audio (rounded up to next second)
const INTRO_S = 7;
const PROBLEM_S = 16;
const DESIGN_S = 18;
const MODELING_S = 16;
const OUTRO_S = 8;

const TOTAL_S = INTRO_S + PROBLEM_S + DESIGN_S + MODELING_S + OUTRO_S;

const voiceFiles = [
  { file: "voice/intro.mp3", scene: "intro" },
  { file: "voice/problem.mp3", scene: "problem" },
  { file: "voice/design-studio.mp3", scene: "design-studio" },
  { file: "voice/modeling-studio.mp3", scene: "modeling-studio" },
  { file: "voice/outro.mp3", scene: "outro" },
];

const BuildableDemo: React.FC = () => {
  const sceneDurations = [INTRO_S, PROBLEM_S, DESIGN_S, MODELING_S, OUTRO_S];
  const scenes = [Intro, Problem, DesignStudio, ModelingStudio, Outro];

  let offset = 0;
  const sceneEntries = scenes.map((Component, i) => {
    const from = offset;
    offset += sceneDurations[i] * FPS;
    return { Component, from, duration: sceneDurations[i] };
  });

  return (
    <div style={{ width: "100%", height: "100%", background: "#0A0A0C" }}>
      {sceneEntries.map(({ Component, from, duration }, i) => (
        <Sequence key={i} from={from} durationInFrames={duration * FPS}>
          <Component />
          <Audio src={staticFile(voiceFiles[i].file)} volume={1} />
        </Sequence>
      ))}
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Full demo — all scenes with voice */}
      <Composition
        id="BuildableDemo"
        component={BuildableDemo}
        durationInFrames={TOTAL_S * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />

      {/* Individual scenes for preview */}
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={INTRO_S * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Problem"
        component={Problem}
        durationInFrames={PROBLEM_S * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="DesignStudio"
        component={DesignStudio}
        durationInFrames={DESIGN_S * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ModelingStudio"
        component={ModelingStudio}
        durationInFrames={MODELING_S * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Outro"
        component={Outro}
        durationInFrames={OUTRO_S * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
