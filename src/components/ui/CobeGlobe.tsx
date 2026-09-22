import { useEffect, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { cn } from "@/lib/utils";

export type GlobeLocation = [number, number];

export type Marker = {
  id: string;
  location: GlobeLocation;
  label?: string;
  color?: "primary" | "destructive";
};

export type Arc = {
  id: string;
  from: GlobeLocation;
  to: GlobeLocation;
  color?: "primary" | "destructive";
};

type GlobeProps = {
  className?: string;
  markers: Marker[];
  arcs?: Arc[];
  scale?: number;
  mapSamples?: number;
  mapBrightness?: number;
  markerSize?: number;
  arcHeight?: number;
  arcWidth?: number;
  markerElevation?: number;
  phi?: number;
  theta?: number;
  focus?: GlobeLocation | null;
  baseColor?: [number, number, number];
  glowColor?: [number, number, number];
  dark?: number;
  speed?: number;
  opacity?: number;
};

export function locationToAngles(latitude: number, longitude: number): [number, number] {
  return [-(longitude * Math.PI) / 180, (latitude * Math.PI) / 180];
}

function readTokenColor(token: string, fallback: [number, number, number]) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const match = value.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!match) return fallback;

  const hue = Number(match[1]) / 360;
  const saturation = Number(match[2]) / 100;
  const lightness = Number(match[3]) / 100;
  const channel = (offset: number) => {
    const k = (offset + hue * 12) % 12;
    const a = saturation * Math.min(lightness, 1 - lightness);
    return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4)] as [number, number, number];
}

function interpolateArc(from: GlobeLocation, to: GlobeLocation, steps: number) {
  return Array.from({ length: steps }, (_, index) => {
    const progress = (index + 1) / (steps + 1);
    return [
      from[0] + (to[0] - from[0]) * progress,
      from[1] + (to[1] - from[1]) * progress,
    ] as GlobeLocation;
  });
}

export function Globe({
  className,
  markers,
  arcs = [],
  scale = 1,
  mapSamples = 16000,
  mapBrightness = 6,
  markerSize = 0.025,
  arcWidth = 0.8,
  phi = 0,
  theta = 0,
  focus,
  baseColor = [0.78, 0.8, 0.82],
  glowColor = [0.93, 0.92, 0.88],
  dark = 0,
  speed = 0.0015,
  opacity = 0.9,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<number | null>(null);
  const dragStartRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const rotationRef = useRef(phi);
  const tiltRef = useRef(theta);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const primary = readTokenColor("--primary", [0.2, 0.3, 0.4]);
    const destructive = readTokenColor("--destructive", [0.65, 0.2, 0.15]);
    const markerData: COBEOptions["markers"] = [
      ...markers.map((marker) => ({
        location: marker.location,
        size: markerSize,
        color: marker.color === "destructive" ? destructive : primary,
      })),
      ...arcs.flatMap((arc) =>
        interpolateArc(arc.from, arc.to, 5).map((location) => ({
          location,
          size: Math.max(0.0025, markerSize * 0.16 * arcWidth),
          color: arc.color === "destructive" ? destructive : primary,
        })),
      ),
    ];
    const target = focus ? locationToAngles(focus[0], focus[1]) : null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
    let width = canvas.clientWidth;

    const globe = createGlobe(canvas, {
      devicePixelRatio,
      width: width * devicePixelRatio,
      height: width * devicePixelRatio,
      phi: rotationRef.current,
      theta,
      dark,
      diffuse: 1.2,
      scale,
      mapSamples,
      mapBrightness,
      baseColor,
      markerColor: primary,
      glowColor,
      opacity,
      markers: markerData,
      context: { preserveDrawingBuffer: true },
      onRender: (state) => {
        if (pointerRef.current === null && !reducedMotion) rotationRef.current += speed;
        if (target && pointerRef.current === null) {
          const delta = target[0] - rotationRef.current;
          rotationRef.current += delta * 0.035;
          tiltRef.current += (target[1] - tiltRef.current) * 0.035;
        }
        state.phi = rotationRef.current + dragOffsetRef.current;
        state.theta = tiltRef.current;
        state.width = width * devicePixelRatio;
        state.height = width * devicePixelRatio;
      },
    });

    const observer = new ResizeObserver(() => {
      width = canvas.clientWidth;
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      globe.destroy();
    };
  }, [arcs, arcWidth, baseColor, dark, focus, glowColor, mapBrightness, mapSamples, markerSize, markers, opacity, phi, scale, speed, theta]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("aspect-square w-full cursor-grab touch-none active:cursor-grabbing", className)}
      onPointerDown={(event) => {
        pointerRef.current = event.clientX;
        dragStartRef.current = event.clientX - dragOffsetRef.current * 200;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (pointerRef.current !== null) dragOffsetRef.current = (event.clientX - dragStartRef.current) / 200;
      }}
      onPointerUp={(event) => {
        rotationRef.current += dragOffsetRef.current;
        dragOffsetRef.current = 0;
        pointerRef.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      aria-label="Interaktiver Globus mit Hirzel und ausgewählten europäischen Zielorten"
    />
  );
}