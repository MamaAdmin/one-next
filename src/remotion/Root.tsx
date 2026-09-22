import { Composition } from "remotion";
import { WhiteboardVideo, compositionFrames } from "@/features/whiteboard/WhiteboardVideo";
import { FPS, type WhiteboardScene } from "@/features/whiteboard/types";

/**
 * Registrierung für Remotion Studio (nur lokale Entwicklung: `npm run studio`).
 * Die App selbst nutzt den Player bzw. den Browser-Renderer.
 */

const demoScenes: WhiteboardScene[] = [
  {
    id: "1",
    heading: "Problem verstehen",
    narration: "Bevor wir Lösungen suchen, klären wir das Problem.",
    bullets: ["Wer ist betroffen?", "Was kostet es heute?"],
    imagePrompt: "",
    durationInSeconds: 6,
  },
  {
    id: "2",
    heading: "Ziel festlegen",
    narration: "Ein klares Ziel macht den Fortschritt messbar.",
    bullets: ["Messbar", "Zeitlich begrenzt"],
    imagePrompt: "",
    durationInSeconds: 6,
  },
];

export const RemotionRoot: React.FC = () => (
  <Composition
    id="whiteboard"
    component={WhiteboardVideo as never}
    fps={FPS}
    width={1920}
    height={1080}
    durationInFrames={compositionFrames("Problem Framing", demoScenes)}
    defaultProps={
      {
        title: "Problem Framing",
        scenes: demoScenes,
        style: "whiteboard",
        subtitles: true,
      } as never
    }
    calculateMetadata={({ props }) => {
      const p = props as { title: string; scenes: WhiteboardScene[] };
      return { durationInFrames: compositionFrames(p.title, p.scenes ?? []) };
    }}
  />
);
