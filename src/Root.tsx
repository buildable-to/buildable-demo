import "./index.css";
import { Audio, Composition, Sequence, staticFile } from "remotion";
import { WinTheProject } from "./scenes/WinTheProject";
import { EngineerTheProject } from "./scenes/EngineerTheProject";
import { RunTheBusiness } from "./scenes/RunTheBusiness";
import { FinalCard } from "./scenes/FinalCard";

const FPS = 30;

// Scene durations in seconds
const WIN_S = 55;
const ENGINEER_S = 55;
const BUSINESS_S = 50;
const FINAL_S = 8;

const TOTAL_S = WIN_S + ENGINEER_S + BUSINESS_S + FINAL_S;

const voiceFiles = [
  "voice/win-the-project.mp3",
  "voice/engineer-the-project.mp3",
  "voice/run-the-business.mp3",
  "voice/final-card.mp3",
];

const BuildableDemo: React.FC = () => {
  const sceneDurations = [WIN_S, ENGINEER_S, BUSINESS_S, FINAL_S];
  const scenes = [WinTheProject, EngineerTheProject, RunTheBusiness, FinalCard];

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
      <Composition id="BuildableDemo" component={BuildableDemo} durationInFrames={TOTAL_S * FPS} fps={FPS} width={3840} height={2160} />
      <Composition id="WinTheProject" component={WinTheProject} durationInFrames={WIN_S * FPS} fps={FPS} width={3840} height={2160} />
      <Composition id="EngineerTheProject" component={EngineerTheProject} durationInFrames={ENGINEER_S * FPS} fps={FPS} width={3840} height={2160} />
      <Composition id="RunTheBusiness" component={RunTheBusiness} durationInFrames={BUSINESS_S * FPS} fps={FPS} width={3840} height={2160} />
      <Composition id="FinalCard" component={FinalCard} durationInFrames={FINAL_S * FPS} fps={FPS} width={3840} height={2160} />
    </>
  );
};
