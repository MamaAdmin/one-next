import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, type WhiteboardScene } from "./types";
import { rendererFor, themeFor, type VideoTheme } from "./theme";
import {
  DrawnUnderline,
  HandWriteText,
  SCENE_RENDERERS,
  SceneAudio,
} from "./renderers";

export const TITLE_SECONDS = 2.4;
export const TITLE_FRAMES = Math.round(TITLE_SECONDS * FPS);

export interface WhiteboardVideoProps {
  title: string;
  scenes: WhiteboardScene[];
  style?: string;
}

const Background: React.FC<{ theme: VideoTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 10;
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      {theme.overlay ? (
        <AbsoluteFill
          style={{
            backgroundImage: theme.overlay,
            backgroundSize: "64px 64px",
            transform: `translate(${drift}px, ${drift / 2}px)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{ title: string; theme: VideoTheme; handwritten: boolean }> = ({
  title,
  theme,
  handwritten,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 150px",
        fontFamily: theme.fontFamily,
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <div style={{ transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)` }}>
        <HandWriteText
          text={title}
          delay={2}
          fontSize={96}
          color={theme.ink}
          withHand={handwritten}
          maxWidth={1400}
        />
        <div style={{ marginTop: 18 }}>
          <DrawnUnderline width={760} delay={14} color={theme.accent} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const WhiteboardVideo: React.FC<WhiteboardVideoProps> = ({ title, scenes, style }) => {
  const theme = themeFor(style);
  const renderer = rendererFor(style);
  const SceneView = SCENE_RENDERERS[renderer];

  // Der Titel bekommt einen eigenen Zeitblock; die Abschnitte starten erst danach.
  let cursor = title ? TITLE_FRAMES : 0;

  return (
    <AbsoluteFill>
      <Background theme={theme} />
      {title ? (
        <Sequence durationInFrames={TITLE_FRAMES}>
          <TitleCard title={title} theme={theme} handwritten={renderer === "whiteboard"} />
        </Sequence>
      ) : null}
      {scenes.map((scene, index) => {
        const duration = Math.max(FPS, Math.round((scene.durationInSeconds || 6) * FPS));
        const from = cursor;
        cursor += duration;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration}>
            <SceneView scene={scene} index={index} theme={theme} />
            <SceneAudio url={scene.audioUrl} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
