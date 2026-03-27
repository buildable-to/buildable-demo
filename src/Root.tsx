import "./index.css";
import { Audio, Composition, Sequence, staticFile } from "remotion";
import { Intro } from "./scenes/Intro";
import { Problem } from "./scenes/Problem";
import { RealDesignStudio } from "./scenes/RealDesignStudio";
import { RealModelingStudio } from "./scenes/RealModelingStudio";
import { WarehouseScene } from "./scenes/WarehouseScene";
import { Outro } from "./scenes/Outro";

const FPS = 30;

// Tight durations — voice + 0.5s
const INTRO_S = 8;
const PROBLEM_S = 27;
const DESIGN_S = 36;
const MODELING_S = 16;
const WAREHOUSE_S = 22;
const OUTRO_S = 15;

const TOTAL_S = INTRO_S + PROBLEM_S + DESIGN_S + MODELING_S + WAREHOUSE_S + OUTRO_S;

const voiceFiles = [
  "voice/intro.mp3",
  "voice/problem.mp3",
  "voice/design-studio.mp3",
  "voice/modeling-studio.mp3",
  "voice/warehouse.mp3",
  "voice/outro.mp3",
];

const BuildableDemo: React.FC = () => {
  const sceneDurations = [INTRO_S, PROBLEM_S, DESIGN_S, MODELING_S, WAREHOUSE_S, OUTRO_S];
  const scenes = [Intro, Problem, RealDesignStudio, RealModelingStudio, WarehouseScene, Outro];

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
          <Audio src={staticFile(voiceFiles[i])} volume={1} />
        </Sequence>
      ))}
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="BuildableDemo" component={BuildableDemo} durationInFrames={TOTAL_S * FPS} fps={FPS} width={1920} height={1080} />
      <Composition id="Intro" component={Intro} durationInFrames={INTRO_S * FPS} fps={FPS} width={1920} height={1080} />
      <Composition id="Problem" component={Problem} durationInFrames={PROBLEM_S * FPS} fps={FPS} width={1920} height={1080} />
      <Composition id="RealDesignStudio" component={RealDesignStudio} durationInFrames={DESIGN_S * FPS} fps={FPS} width={1920} height={1080} />
      <Composition id="RealModelingStudio" component={RealModelingStudio} durationInFrames={MODELING_S * FPS} fps={FPS} width={1920} height={1080} />
      <Composition id="WarehouseScene" component={WarehouseScene} durationInFrames={WAREHOUSE_S * FPS} fps={FPS} width={1920} height={1080} />
      <Composition id="Outro" component={Outro} durationInFrames={OUTRO_S * FPS} fps={FPS} width={1920} height={1080} />
    </>
  );
};
