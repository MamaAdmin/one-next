export interface WhiteboardStyleOption {
  value: string;
  label: string;
}

export const WHITEBOARD_STYLES: WhiteboardStyleOption[] = [
  { value: "strichzeichnung", label: "Strichzeichnung schwarz-weiss" },
  { value: "bunte_marker", label: "Bunte Marker" },
  { value: "bleistift", label: "Bleistift-Skizze" },
  { value: "kreide", label: "Kreide auf Tafel" },
  { value: "comic", label: "Comic / Cartoon" },
  { value: "business_flat", label: "Flache Business-Illustration" },
];

export const styleLabel = (value: string): string =>
  WHITEBOARD_STYLES.find((s) => s.value === value)?.label ?? WHITEBOARD_STYLES[0].label;
