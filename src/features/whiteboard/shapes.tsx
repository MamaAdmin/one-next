import { Circle, Ellipse, Pie, Rect, Star, Triangle } from "@remotion/shapes";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoTheme } from "./theme";

/**
 * Grafische Formen-Ebene auf Basis von @remotion/shapes.
 * Rein visuell: keine Daten, keine Kosten, deterministisch über Index/Seed.
 */

/** Einfacher, deterministischer Zufallswert – gleicher Seed, gleiches Bild. */
const rand = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

type ShapeKind = "circle" | "triangle" | "star" | "rect" | "ellipse";

const KINDS: ShapeKind[] = ["circle", "triangle", "star", "rect", "ellipse"];

const ShapeGlyph: React.FC<{
  kind: ShapeKind;
  size: number;
  fill: string;
}> = ({ kind, size, fill }) => {
  switch (kind) {
    case "triangle":
      return <Triangle length={size} direction="up" fill={fill} />;
    case "star":
      return <Star innerRadius={size * 0.36} outerRadius={size * 0.8} points={6} fill={fill} />;
    case "rect":
      return <Rect width={size} height={size * 0.72} cornerRadius={size * 0.18} fill={fill} />;
    case "ellipse":
      return <Ellipse rx={size * 0.72} ry={size * 0.45} fill={fill} />;
    case "circle":
    default:
      return <Circle radius={size * 0.5} fill={fill} />;
  }
};

/** Langsam driftende Grossformen im Hintergrund – nie eine leere Fläche. */
export const ShapeBackdrop: React.FC<{ theme: VideoTheme; seed?: number; count?: number }> = ({
  theme,
  seed = 1,
  count = 5,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const s = seed * 7 + i * 13;
        const kind = KINDS[Math.floor(rand(s) * KINDS.length)];
        const size = 260 + rand(s + 1) * 460;
        const left = rand(s + 2) * (width - size * 0.4) - size * 0.2;
        const top = rand(s + 3) * (height - size * 0.4) - size * 0.2;
        const speed = 0.12 + rand(s + 4) * 0.22;
        const drift = Math.sin((frame * speed) / 12 + i) * 26;
        const lift = Math.cos((frame * speed) / 16 + i) * 18;
        const spin = (frame * speed) / 6 + i * 30;
        const fill = i % 2 === 0 ? theme.accent : theme.muted;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top,
              opacity: 0.07 + rand(s + 5) * 0.05,
              transform: `translate(${drift}px, ${lift}px) rotate(${spin}deg)`,
            }}
          >
            <ShapeGlyph kind={kind} size={size} fill={fill} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Weicher Ring, der hinter einer Überschrift aufzieht. */
export const AccentRing: React.FC<{
  theme: VideoTheme;
  delay?: number;
  size?: number;
  left?: number | string;
  top?: number | string;
}> = ({ theme, delay = 0, size = 520, left = 120, top = 120 }) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame - delay, [0, 34], [0.6, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame - delay, [0, 18], [0, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        opacity,
        transform: `scale(${grow})`,
        pointerEvents: "none",
      }}
    >
      <Circle radius={size / 2} fill="transparent" stroke={theme.accent} strokeWidth={14} />
    </div>
  );
};

/** Fortschritt als Kreissegment statt reinem Balken. */
export const ProgressArc: React.FC<{ progress: number; theme: VideoTheme; size?: number }> = ({
  progress,
  theme,
  size = 74,
}) => (
  <div style={{ position: "relative", width: size, height: size, pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
      <Circle radius={size / 2} fill="transparent" stroke={theme.muted} strokeWidth={6} />
    </div>
    <div style={{ position: "absolute", inset: 0 }}>
      <Pie
        radius={size / 2}
        progress={Math.max(0.001, Math.min(1, progress))}
        fill="transparent"
        stroke={theme.accent}
        strokeWidth={6}
        closePath={false}
      />
    </div>
  </div>
);

/**
 * Wanderndes Motiv: eine Form zieht über die gesamte Videolänge durchs Bild
 * und verbindet damit alle Abschnitte zu einer Serie.
 */
export const TravellingShape: React.FC<{ theme: VideoTheme; seed?: number }> = ({
  theme,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const p = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kind = KINDS[Math.floor(rand(seed * 3) * KINDS.length)];
  const size = 180;
  const x = interpolate(p, [0, 1], [-size, width + size]);
  const y = height * (0.18 + rand(seed + 9) * 0.6) + Math.sin(p * Math.PI * 2) * 90;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: 0.16,
        transform: `rotate(${p * 220}deg)`,
        pointerEvents: "none",
      }}
    >
      <ShapeGlyph kind={kind} size={size} fill={theme.accent} />
    </div>
  );
};
