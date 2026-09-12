import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { FPS, type WhiteboardScene } from "./types";
import { rendererFor, themeFor, type VideoTheme } from "./theme";
import {
  DrawnUnderline,
  HandWriteText,
  NarrationSubtitles,
  SCENE_RENDERERS,
  SceneAudio,
  SceneCaptions,
} from "./renderers";

export const TITLE_SECONDS = 2.4;
export const TITLE_FRAMES = Math.round(TITLE_SECONDS * FPS);
/** Überblendung zwischen zwei Einstellungen; verkürzt die Gesamtlänge. */
export const TRANSITION_FRAMES = 12;

export interface WhiteboardVideoProps {
  title: string;
  scenes: WhiteboardScene[];
  style?: string;
  /** Hintergrundmusik, wird unter der Sprecherstimme leise gehalten. */
  musicUrl?: string | null;
  musicVolume?: number;
  /** Sprechtext wortweise als Untertitel einblenden. */
  subtitles?: boolean;
}

const sceneFrames = (scene: WhiteboardScene) =>
  Math.max(FPS, Math.round((scene.durationInSeconds || 6) * FPS));

/** Gesamtlänge inklusive Titel und abzüglich der Überblendungen. */
export const compositionFrames = (title: string, scenes: WhiteboardScene[]): number => {
  const blocks = (title ? [TITLE_FRAMES] : []).concat(scenes.map(sceneFrames));
  if (blocks.length === 0) return FPS;
  const total = blocks.reduce((a, b) => a + b, 0);
  const overlaps = Math.max(0, blocks.length - 1) * TRANSITION_FRAMES;
  return Math.max(FPS, total - overlaps);
};

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

/** Durchgehende Ebene: Fortschritt, Kapitel und Titel – sorgt für Serienlook. */
const Overlay: React.FC<{ title: string; sceneCount: number; theme: VideoTheme }> = ({
  title,
  sceneCount,
  theme,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chapter = Math.min(sceneCount, Math.max(1, Math.ceil(progress * sceneCount)));
  return (
    <AbsoluteFill style={{ fontFamily: theme.fontFamily, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 56,
          right: 56,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: theme.muted,
          fontWeight: 600,
        }}
      >
        <span>{title}</span>
        {sceneCount > 0 ? (
          <span>
            {String(chapter).padStart(2, "0")} / {String(sceneCount).padStart(2, "0")}
          </span>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 8,
          background: `${theme.muted}33`,
        }}
      >
        <div style={{ width: `${progress * 100}%`, height: "100%", background: theme.accent }} />
      </div>
    </AbsoluteFill>
  );
};

export const WhiteboardVideo: React.FC<WhiteboardVideoProps> = ({
  title,
  scenes,
  style,
  musicUrl,
  musicVolume = 0.18,
  subtitles = true,
}) => {
  const theme = themeFor(style);
  const renderer = rendererFor(style);
  const SceneView = SCENE_RENDERERS[renderer];
  const timing = springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_FRAMES });

  return (
    <AbsoluteFill>
      <Background theme={theme} />
      {musicUrl ? <Audio src={musicUrl} volume={musicVolume} loop /> : null}
      <TransitionSeries>
        {title ? (
          <TransitionSeries.Sequence durationInFrames={TITLE_FRAMES}>
            <TitleCard title={title} theme={theme} handwritten={renderer === "whiteboard"} />
          </TransitionSeries.Sequence>
        ) : null}
        {title && scenes.length > 0 ? (
          <TransitionSeries.Transition presentation={fade()} timing={timing} />
        ) : null}
        {scenes.flatMap((scene, index) => {
          const duration = sceneFrames(scene);
          const nodes = [
            <TransitionSeries.Sequence key={scene.id} durationInFrames={duration}>
              <SceneView scene={scene} index={index} theme={theme} />
              <SceneCaptions captions={scene.captions} theme={theme} />
              {subtitles ? (
                <NarrationSubtitles
                  narration={scene.narration}
                  durationInSeconds={duration / FPS}
                  theme={theme}
                />
              ) : null}
              <SceneAudio url={scene.audioUrl} />
            </TransitionSeries.Sequence>,
          ];
          if (index < scenes.length - 1) {
            nodes.push(
              <TransitionSeries.Transition
                key={`${scene.id}-t`}
                presentation={
                  index % 2 === 0 ? slide({ direction: "from-right" }) : slide({ direction: "from-bottom" })
                }
                timing={timing}
              />,
            );
          }
          return nodes;
        })}
      </TransitionSeries>
      <Sequence>
        <Overlay title={title} sceneCount={scenes.length} theme={theme} />
      </Sequence>
    </AbsoluteFill>
  );
};
