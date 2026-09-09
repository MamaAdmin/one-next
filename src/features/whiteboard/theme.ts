import type { RendererKey } from "./styles";
import { styleOption } from "./styles";

export interface VideoTheme {
  background: string;
  overlay?: string;
  ink: string;
  muted: string;
  accent: string;
  surface: string;
  fontFamily: string;
}

const PAPER: VideoTheme = {
  background: "#FBF7F0",
  overlay:
    "linear-gradient(rgba(38,48,59,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(38,48,59,0.045) 1px, transparent 1px)",
  ink: "#26303B",
  muted: "#6B7684",
  accent: "#C1663F",
  surface: "rgba(255,255,255,0.85)",
  fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
};

const LIGHT: VideoTheme = {
  background: "#F4F1EC",
  ink: "#1F2933",
  muted: "#5B6774",
  accent: "#C1663F",
  surface: "#FFFFFF",
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const DARK: VideoTheme = {
  background: "#101820",
  overlay:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  ink: "#F5F3EF",
  muted: "#A7B2BE",
  accent: "#E08A5B",
  surface: "rgba(255,255,255,0.08)",
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const DEEP: VideoTheme = {
  background: "linear-gradient(140deg, #14202B 0%, #24333F 100%)",
  ink: "#F2F5F7",
  muted: "#9FB0BD",
  accent: "#7FB6C4",
  surface: "rgba(255,255,255,0.1)",
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const THEMES: Record<RendererKey, VideoTheme> = {
  whiteboard: PAPER,
  flat: LIGHT,
  motion: DARK,
  screencast: LIGHT,
  isometric: DEEP,
  typography: DARK,
  avatar: LIGHT,
};

export const rendererFor = (style?: string | null): RendererKey => styleOption(style).renderer;

export const themeFor = (style?: string | null): VideoTheme => THEMES[rendererFor(style)];
