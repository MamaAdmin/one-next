import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import handImage from "@/assets/whiteboard-hand.png";
import { FPS, type WhiteboardScene } from "./types";

const PAPER = "#FBF7F0";
const INK = "#26303B";
const MUTED = "#6B7684";
const ACCENT = "#C1663F";

/** Zeichnende Hand, die der aktuellen Zeichenposition folgt. */
const DrawingHand: React.FC<{
  x: number;
  y: number;
  visible: boolean;
  size?: number;
}> = ({ x, y, visible, size = 300 }) => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame / 3) * 4;
  if (!visible) return null;
  return (
    <Img
      src={handImage}
      style={{
        position: "absolute",
        left: x - size * 0.28,
        top: y - size * 0.27 + wobble,
        width: size,
        height: size,
        pointerEvents: "none",
        filter: "drop-shadow(0 12px 24px rgba(38,48,59,0.18))",
        zIndex: 20,
      }}
    />
  );
};

export interface WhiteboardVideoProps {
  title: string;
  scenes: WhiteboardScene[];
}


const PaperBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 10;
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(38,48,59,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(38,48,59,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          transform: `translate(${drift}px, ${drift / 2}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 25% 15%, rgba(255,255,255,0.95), rgba(38,48,59,0.05) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Hand-drawn underline that draws itself from left to right. */
const DrawnUnderline: React.FC<{ width: number; delay: number }> = ({ width, delay }) => {
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
        stroke={ACCENT}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
      />
    </svg>
  );
};

const HandWriteText: React.FC<{
  text: string;
  delay: number;
  fontSize: number;
  color?: string;
  weight?: number;
}> = ({ text, delay, fontSize, color = INK, weight = 700 }) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame - delay, [0, 30], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontSize,
        fontWeight: weight,
        color,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        clipPath: `inset(0 ${100 - reveal}% 0 0)`,
      }}
    >
      {text}
    </div>
  );
};

const Bullet: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 160 } });
  const x = interpolate(s, [0, 1], [-60, 0]);
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
      <svg width={30} height={30} viewBox="0 0 30 30" style={{ marginTop: 12, flexShrink: 0 }}>
        <circle cx={15} cy={15} r={9} fill="none" stroke={ACCENT} strokeWidth={4} />
      </svg>
      <div style={{ fontSize: 40, color: MUTED, lineHeight: 1.35, fontWeight: 500 }}>{text}</div>
    </div>
  );
};

const SceneIllustration: React.FC<{ url?: string | null; delay: number }> = ({ url, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const float = Math.sin((frame - delay) / 40) * 8;

  if (!url) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          border: `6px dashed rgba(38,48,59,0.18)`,
          borderRadius: 32,
          opacity: s,
          transform: `translateY(${float}px)`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        opacity: s,
        transform: `translateY(${float}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        clipPath: `inset(${interpolate(s, [0, 1], [100, 0])}% 0 0 0)`,
      }}
    >
      <Img
        src={url}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
};

const SceneView: React.FC<{ scene: WhiteboardScene; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const flip = index % 2 === 1;

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: flip ? "row-reverse" : "row",
          alignItems: "center",
          gap: 90,
          padding: "110px 130px",
        }}
      >
        <div style={{ flex: 1.05, display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 28, letterSpacing: "0.22em", color: ACCENT, fontWeight: 700 }}>
            {String(index + 1).padStart(2, "0")}
          </div>
          <HandWriteText text={scene.heading} delay={4} fontSize={78} />
          <DrawnUnderline width={520} delay={16} />
          <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 12 }}>
            {scene.bullets.slice(0, 4).map((bullet, i) => (
              <Bullet key={i} text={bullet} delay={30 + i * 9} />
            ))}
          </div>
        </div>
        <div style={{ flex: 0.95, height: "72%" }}>
          <SceneIllustration url={scene.imageUrl} delay={12} />
        </div>
      </AbsoluteFill>
      {scene.audioUrl ? <Audio src={scene.audioUrl} /> : null}
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 150px",
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <div style={{ transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)` }}>
        <HandWriteText text={title} delay={2} fontSize={104} />
        <div style={{ marginTop: 18 }}>
          <DrawnUnderline width={760} delay={14} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const WhiteboardVideo: React.FC<WhiteboardVideoProps> = ({ title, scenes }) => {
  let cursor = 0;
  return (
    <AbsoluteFill>
      <PaperBackground />
      {title ? (
        <Sequence durationInFrames={Math.round(1.8 * FPS)}>
          <TitleCard title={title} />
        </Sequence>
      ) : null}
      {scenes.map((scene, index) => {
        const duration = Math.max(FPS, Math.round((scene.durationInSeconds || 6) * FPS));
        const from = cursor;
        cursor += duration;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration}>
            <SceneView scene={scene} index={index} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
