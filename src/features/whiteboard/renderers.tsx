import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Video,
  getRemotionEnvironment,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SceneCaption } from "./types";
import handImage from "@/assets/whiteboard-hand.png";
import type { WhiteboardScene } from "./types";
import { groupLines, kenBurnsFor, timeWords } from "./motion";
import type { RendererKey } from "./styles";
import type { VideoTheme } from "./theme";

export interface SceneProps {
  scene: WhiteboardScene;
  index: number;
  theme: VideoTheme;
}

/** Zeichnende Hand, die der aktuellen Zeichenposition folgt. */
export const DrawingHand: React.FC<{
  x: number | string;
  y: number | string;
  visible: boolean;
  size?: number;
}> = ({ x, y, visible, size = 300 }) => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame / 3) * 4;
  if (!visible) return null;
  const offsetX = size * 0.28;
  const offsetY = size * 0.27 - wobble;
  return (
    <Img
      src={handImage}
      style={{
        position: "absolute",
        left: typeof x === "number" ? x - offsetX : `calc(${x} - ${offsetX}px)`,
        top: typeof y === "number" ? y - offsetY : `calc(${y} - ${offsetY}px)`,
        width: size,
        height: size,
        pointerEvents: "none",
        filter: "drop-shadow(0 12px 24px rgba(38,48,59,0.18))",
        zIndex: 20,
      }}
    />
  );
};

export const DrawnUnderline: React.FC<{ width: number; delay: number; color: string }> = ({
  width,
  delay,
  color,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const length = 1200;
  return (
    <svg width={width} height={26} viewBox="0 0 1200 26" fill="none">
      <path
        d="M6 18 C 220 4, 420 26, 640 12 S 1020 6, 1194 16"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
      />
    </svg>
  );
};

export const HandWriteText: React.FC<{
  text: string;
  delay: number;
  fontSize: number;
  color: string;
  weight?: number;
  withHand?: boolean;
  maxWidth?: number | string;
}> = ({ text, delay, fontSize, color, weight = 700, withHand = true, maxWidth = "100%" }) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const reveal = interpolate(local, [0, 30], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const writing = withHand && local >= 0 && local <= 30;
  const estWidth = text.length * fontSize * 0.52;
  return (
    <div style={{ position: "relative", maxWidth }}>
      <div
        style={{
          fontSize,
          fontWeight: weight,
          color,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          overflowWrap: "break-word",
          clipPath: `inset(0 ${100 - reveal}% 0 0)`,
        }}
      >
        {text}
      </div>
      <DrawingHand
        x={(reveal / 100) * estWidth}
        y={fontSize * 0.85}
        visible={writing}
        size={220}
      />
    </div>
  );
};

const FadeText: React.FC<{
  text: string;
  delay: number;
  fontSize: number;
  color: string;
  weight?: number;
}> = ({ text, delay, fontSize, color, weight = 700 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        fontSize,
        fontWeight: weight,
        color,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        overflowWrap: "break-word",
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
      }}
    >
      {text}
    </div>
  );
};

const BulletRow: React.FC<{
  text: string;
  delay: number;
  theme: VideoTheme;
  variant?: "circle" | "tile" | "dash";
}> = ({ text, delay, theme, variant = "circle" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 160 } });
  const x = interpolate(s, [0, 1], [-60, 0]);

  if (variant === "tile") {
    return (
      <div
        style={{
          opacity: s,
          transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
          background: theme.surface,
          borderLeft: `8px solid ${theme.accent}`,
          borderRadius: 16,
          padding: "22px 28px",
          fontSize: 38,
          color: theme.ink,
          fontWeight: 500,
        }}
      >
        {text}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
        opacity: s,
        transform: `translateX(${x}px)`,
      }}
    >
      {variant === "dash" ? (
        <div
          style={{
            width: 34,
            height: 6,
            borderRadius: 3,
            background: theme.accent,
            marginTop: 22,
            flexShrink: 0,
          }}
        />
      ) : (
        <svg width={30} height={30} viewBox="0 0 30 30" style={{ marginTop: 12, flexShrink: 0 }}>
          <circle cx={15} cy={15} r={9} fill="none" stroke={theme.accent} strokeWidth={4} />
        </svg>
      )}
      <div style={{ fontSize: 40, color: theme.muted, lineHeight: 1.35, fontWeight: 500 }}>
        {text}
      </div>
    </div>
  );
};

const Placeholder: React.FC<{ theme: VideoTheme }> = ({ theme }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      border: `6px dashed ${theme.muted}55`,
      borderRadius: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.muted,
      fontSize: 30,
      fontWeight: 500,
      textAlign: "center",
      padding: 40,
    }}
  >
    Zeichnung noch nicht erzeugt
  </div>
);

const DRAW_FRAMES = 60;

/**
 * Bewegtbild im Abschnitt: eigene Bildschirmaufnahme oder KI-Clip.
 * Beim Export wird OffthreadVideo genutzt, in der Vorschau das normale Video-Element.
 */
export const ClipStage: React.FC<{ scene: WhiteboardScene; theme: VideoTheme; radius?: number }> = ({
  scene,
  theme,
  radius = 20,
}) => {
  const isAi = scene.mediaType === "ai_clip";
  const url = isAi ? scene.aiClipUrl : scene.clipUrl;
  if (!url) return <Placeholder theme={theme} />;

  const start = isAi ? 0 : Math.max(0, scene.clipStartInSeconds ?? 0);
  const end = isAi ? undefined : scene.clipEndInSeconds;
  const startFrom = Math.round(start * 30);
  const endAt = end && end > start ? Math.round(end * 30) : undefined;
  const rendering = getRemotionEnvironment().isRendering;
  const VideoTag = rendering ? OffthreadVideo : Video;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: radius,
        overflow: "hidden",
        background: theme.ink,
      }}
    >
      <VideoTag
        src={url}
        muted
        startFrom={startFrom}
        endAt={endAt}
        // Ist die Aufnahme kürzer als der Abschnitt, bleibt das letzte Bild stehen.
        pauseWhenBuffering
        style={{ width: "100%", height: "100%", objectFit: isAi ? "cover" : "contain" }}
      />
    </div>
  );
};

const hasMovingMedia = (scene?: WhiteboardScene): boolean =>
  scene?.mediaType === "clip" || scene?.mediaType === "ai_clip";

/** Ruhige Kamerafahrt über ein Standbild, damit nie ein Bild still steht. */
const KenBurns: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const move = kenBurnsFor(index);
  const p = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(p, [0, 1], [move.scaleFrom, move.scaleTo]);
  const x = interpolate(p, [0, 1], [move.xFrom, move.xTo]);
  const y = interpolate(p, [0, 1], [move.yFrom, move.yTo]);
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Sprechtext wortweise als Untertitel, passend zur Abschnittsdauer. */
export const NarrationSubtitles: React.FC<{
  narration: string;
  durationInSeconds: number;
  theme: VideoTheme;
}> = ({ narration, durationInSeconds, theme }) => {
  const frame = useCurrentFrame();
  const words = timeWords(narration ?? "", durationInSeconds);
  if (words.length === 0) return null;
  const lines = groupLines(words);
  const active = lines.find((line) => frame < line[line.length - 1].toFrame) ?? lines[lines.length - 1];
  return (
    <AbsoluteFill style={{ fontFamily: theme.fontFamily, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 64,
          display: "flex",
          justifyContent: "center",
          padding: "0 160px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "6px 14px",
            background: `${theme.ink}E6`,
            borderRadius: 18,
            padding: "14px 26px",
            maxWidth: 1400,
          }}
        >
          {active.map((word, i) => {
            const spoken = frame >= word.fromFrame;
            return (
              <span
                key={`${word.text}-${i}`}
                style={{
                  fontSize: 40,
                  fontWeight: 600,
                  color: spoken ? theme.accent : theme.background,
                  opacity: spoken ? 1 : 0.55,
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Einblendungen als weiche Textkarten unten links. */
export const SceneCaptions: React.FC<{ captions?: SceneCaption[]; theme: VideoTheme }> = ({
  captions,
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!captions?.length) return null;
  return (
    <AbsoluteFill style={{ fontFamily: theme.fontFamily, pointerEvents: "none" }}>
      {captions.slice(0, 3).map((caption, i) => {
        const from = Math.round((caption.atSecond || 0) * fps);
        const length = Math.round(Math.max(1, caption.durationInSeconds || 3) * fps);
        const local = frame - from;
        if (local < -1 || local > length) return null;
        const opacity =
          interpolate(local, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
          interpolate(local, [length - 12, length], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        const lift = interpolate(local, [0, 12], [24, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={`${caption.text}-${i}`}
            style={{
              position: "absolute",
              left: 110,
              bottom: 110,
              maxWidth: 900,
              opacity,
              transform: `translateY(${lift}px)`,
              background: theme.background,
              border: `4px solid ${theme.accent}`,
              borderRadius: 24,
              padding: "24px 32px",
              fontSize: 46,
              fontWeight: 700,
              color: theme.ink,
              boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
            }}
          >
            {caption.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Whiteboard: Bild wird von links nach rechts von einer Hand gezeichnet. */
const DrawnIllustration: React.FC<{
  url?: string | null;
  delay: number;
  theme: VideoTheme;
  scene?: WhiteboardScene;
  index?: number;
}> = ({
  url,
  delay,
  theme,
  scene,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  const progress = interpolate(local, [0, DRAW_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drawing = local >= 0 && local <= DRAW_FRAMES;
  const float = Math.sin((local - DRAW_FRAMES) / 40) * 6;
  const handY = 30 + Math.sin(local / 6) * 18;

  if (hasMovingMedia(scene) && scene) return <ClipStage scene={scene} theme={theme} />;
  if (!url) return <Placeholder theme={theme} />;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        transform: drawing ? undefined : `translateY(${float}px)`,
      }}
    >
      <KenBurns index={index}>
        <div
          style={{ width: "100%", height: "100%", clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }}
        >
          <Img src={url} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      </KenBurns>
      <DrawingHand x={`${progress * 100}%`} y={`${handY}%`} visible={drawing} size={330} />
    </div>
  );
};

const FadeIllustration: React.FC<{
  url?: string | null;
  delay: number;
  theme: VideoTheme;
  radius?: number;
  zoom?: boolean;
  scene?: WhiteboardScene;
  index?: number;
}> = ({ url, delay, theme, radius = 28, zoom = true, scene, index = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  if (hasMovingMedia(scene) && scene) return <ClipStage scene={scene} theme={theme} radius={radius} />;
  if (!url) return <Placeholder theme={theme} />;
  const scale = zoom ? interpolate(s, [0, 1], [0.92, 1]) : 1;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        opacity: s,
        transform: `scale(${scale})`,
        borderRadius: radius,
        overflow: "hidden",
      }}
    >
      <KenBurns index={index}>
        <Img src={url} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </KenBurns>
    </div>
  );
};

const SceneNumber: React.FC<{ index: number; theme: VideoTheme }> = ({ index, theme }) => (
  <div style={{ fontSize: 28, letterSpacing: "0.22em", color: theme.accent, fontWeight: 700 }}>
    {String(index + 1).padStart(2, "0")}
  </div>
);

const Frame: React.FC<{ children: React.ReactNode; theme: VideoTheme; flip?: boolean }> = ({
  children,
  theme,
  flip,
}) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: exit, fontFamily: theme.fontFamily }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: flip ? "row-reverse" : "row",
          alignItems: "center",
          gap: 90,
          padding: "110px 130px",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const WhiteboardSceneView: React.FC<SceneProps> = ({ scene, index, theme }) => (
  <Frame theme={theme} flip={index % 2 === 1}>
    <div style={{ flex: 1.05, display: "flex", flexDirection: "column", gap: 28 }}>
      <SceneNumber index={index} theme={theme} />
      <HandWriteText text={scene.heading} delay={4} fontSize={78} color={theme.ink} />
      <DrawnUnderline width={520} delay={16} color={theme.accent} />
      <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 12 }}>
        {scene.bullets.slice(0, 4).map((b, i) => (
          <BulletRow key={i} text={b} delay={30 + i * 9} theme={theme} />
        ))}
      </div>
    </div>
    <div style={{ flex: 0.95, height: "72%" }}>
      <DrawnIllustration url={scene.imageUrl} scene={scene} index={index} delay={12} theme={theme} />
    </div>
  </Frame>
);

const FlatSceneView: React.FC<SceneProps> = ({ scene, index, theme }) => (
  <Frame theme={theme} flip={index % 2 === 1}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 26 }}>
      <SceneNumber index={index} theme={theme} />
      <FadeText text={scene.heading} delay={4} fontSize={76} color={theme.ink} />
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
        {scene.bullets.slice(0, 4).map((b, i) => (
          <BulletRow key={i} text={b} delay={20 + i * 10} theme={theme} variant="dash" />
        ))}
      </div>
    </div>
    <div style={{ flex: 1, height: "74%" }}>
      <FadeIllustration url={scene.imageUrl} scene={scene} index={index} delay={10} theme={theme} />
    </div>
  </Frame>
);

const MotionSceneView: React.FC<SceneProps> = ({ scene, index, theme }) => (
  <Frame theme={theme}>
    <div style={{ flex: 1.1, display: "flex", flexDirection: "column", gap: 24 }}>
      <SceneNumber index={index} theme={theme} />
      <FadeText text={scene.heading} delay={2} fontSize={80} color={theme.ink} weight={800} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 10 }}>
        {scene.bullets.slice(0, 4).map((b, i) => (
          <BulletRow key={i} text={b} delay={16 + i * 8} theme={theme} variant="tile" />
        ))}
      </div>
    </div>
    <div style={{ flex: 0.9, height: "70%" }}>
      <FadeIllustration url={scene.imageUrl} scene={scene} index={index} delay={8} theme={theme} radius={24} />
    </div>
  </Frame>
);

const ScreencastSceneView: React.FC<SceneProps> = ({ scene, index, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  const zoom = interpolate(frame, [0, 120], [1, 1.05], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ fontFamily: theme.fontFamily, padding: 90 }}>
      <div
        style={{
          position: "absolute",
          inset: 90,
          borderRadius: 24,
          overflow: "hidden",
          background: theme.surface,
          boxShadow: "0 40px 80px rgba(0,0,0,0.18)",
          opacity: s,
          transform: `scale(${zoom})`,
        }}
      >
        <div
          style={{
            height: 54,
            background: theme.ink,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 22px",
          }}
        >
          {["#E5675A", "#E7B44B", "#5FB27A"].map((c) => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
          ))}
        </div>
        <div style={{ position: "absolute", inset: "54px 0 0 0" }}>
          <FadeIllustration url={scene.imageUrl} scene={scene} index={index} delay={6} theme={theme} radius={0} zoom={false} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 140,
          bottom: 140,
          maxWidth: 780,
          background: theme.background,
          border: `4px solid ${theme.accent}`,
          borderRadius: 28,
          padding: "32px 38px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 24px 48px rgba(0,0,0,0.16)",
        }}
      >
        <SceneNumber index={index} theme={theme} />
        <FadeText text={scene.heading} delay={6} fontSize={56} color={theme.ink} />
        {scene.bullets.slice(0, 3).map((b, i) => (
          <BulletRow key={i} text={b} delay={22 + i * 9} theme={theme} variant="dash" />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const IsometricSceneView: React.FC<SceneProps> = ({ scene, index, theme }) => {
  const frame = useCurrentFrame();
  const parallax = interpolate(frame, [0, 200], [-24, 24], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 200], [1.02, 1.1], { extrapolateRight: "clamp" });
  return (
    <Frame theme={theme} flip={index % 2 === 1}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 26 }}>
        <SceneNumber index={index} theme={theme} />
        <FadeText text={scene.heading} delay={4} fontSize={74} color={theme.ink} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}>
          {scene.bullets.slice(0, 4).map((b, i) => (
            <BulletRow key={i} text={b} delay={20 + i * 10} theme={theme} variant="dash" />
          ))}
        </div>
      </div>
      <div style={{ flex: 1.05, height: "76%", overflow: "hidden" }}>
        <div style={{ width: "100%", height: "100%", transform: `translateX(${parallax}px) scale(${scale})` }}>
          <FadeIllustration url={scene.imageUrl} scene={scene} index={index} delay={8} theme={theme} />
        </div>
      </div>
    </Frame>
  );
};

const TypographySceneView: React.FC<SceneProps> = ({ scene, index, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = `${scene.heading}. ${scene.bullets.join(". ")}`.split(/\s+/).filter(Boolean);
  return (
    <AbsoluteFill
      style={{
        fontFamily: theme.fontFamily,
        padding: "120px 140px",
        justifyContent: "center",
        gap: 40,
      }}
    >
      <SceneNumber index={index} theme={theme} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "18px 24px", alignItems: "baseline" }}>
        {words.slice(0, 26).map((word, i) => {
          const s = spring({ frame: frame - i * 5, fps, config: { damping: 14, stiffness: 200 } });
          const emphasis = i % 5 === 0;
          return (
            <span
              key={`${word}-${i}`}
              style={{
                fontSize: emphasis ? 96 : 68,
                fontWeight: emphasis ? 800 : 600,
                color: emphasis ? theme.accent : theme.ink,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) scale(${interpolate(
                  s,
                  [0, 1],
                  [0.8, 1],
                )})`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const AvatarSceneView: React.FC<SceneProps> = ({ scene, index, theme }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame / 28) * 6;
  return (
    <Frame theme={theme}>
      <div style={{ flex: 0.8, height: "80%", transform: `translateY(${breathe}px)` }}>
        <FadeIllustration url={scene.imageUrl} scene={scene} index={index} delay={0} theme={theme} zoom={false} />
      </div>
      <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: 24 }}>
        <SceneNumber index={index} theme={theme} />
        <FadeText text={scene.heading} delay={4} fontSize={72} color={theme.ink} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {scene.bullets.slice(0, 4).map((b, i) => (
            <BulletRow key={i} text={b} delay={18 + i * 10} theme={theme} variant="tile" />
          ))}
        </div>
      </div>
    </Frame>
  );
};

export const SCENE_RENDERERS: Record<RendererKey, React.FC<SceneProps>> = {
  whiteboard: WhiteboardSceneView,
  flat: FlatSceneView,
  motion: MotionSceneView,
  screencast: ScreencastSceneView,
  isometric: IsometricSceneView,
  typography: TypographySceneView,
  avatar: AvatarSceneView,
};

export const SceneAudio: React.FC<{ url?: string | null }> = ({ url }) =>
  url ? <Audio src={url} /> : null;
