import createGlobe from "cobe";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
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

type ProjectedPoint = { x: number; y: number; visible: boolean };
type View = { phi: number; theta: number };

export function locationToAngles(latitude: number, longitude: number): [number, number] {
  return [-(longitude * Math.PI) / 180, (latitude * Math.PI) / 180];
}

function project([latitude, longitude]: GlobeLocation, view: View, radius: number): ProjectedPoint {
  const toRadians = Math.PI / 180;
  const latitudeRad = latitude * toRadians;
  const longitudeRad = longitude * toRadians + view.phi;
  const x = Math.cos(latitudeRad) * Math.sin(longitudeRad);
  const y = Math.cos(view.theta) * Math.sin(latitudeRad) - Math.sin(view.theta) * Math.cos(latitudeRad) * Math.cos(longitudeRad);
  const z = Math.sin(view.theta) * Math.sin(latitudeRad) + Math.cos(view.theta) * Math.cos(latitudeRad) * Math.cos(longitudeRad);
  return { x: 300 + x * radius, y: 300 - y * radius, visible: z >= 0 };
}

function interpolate(from: GlobeLocation, to: GlobeLocation, liftDegrees = 7, steps = 32) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps;
    const lift = Math.sin(progress * Math.PI) * liftDegrees;
    return [from[0] + (to[0] - from[0]) * progress + lift, from[1] + (to[1] - from[1]) * progress] as GlobeLocation;
  });
}

function pathFromPoints(points: ProjectedPoint[]) {
  let started = false;
  return points.reduce((path, point) => {
    if (!point.visible) {
      started = false;
      return path;
    }
    const command = started ? "L" : "M";
    started = true;
    return `${path}${command}${point.x.toFixed(1)},${point.y.toFixed(1)} `;
  }, "");
}

function hslTokenToRgb(token: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const [hueValue, saturationValue, lightnessValue] = raw.split(/\s+/);
  const hue = Number.parseFloat(hueValue ?? "0") / 360;
  const saturation = Number.parseFloat(saturationValue ?? "0") / 100;
  const lightness = Number.parseFloat(lightnessValue ?? "50") / 100;
  const channel = (offset: number) => {
    const wave = (offset + hue * 12) % 12;
    return lightness - saturation * Math.min(lightness, 1 - lightness) * Math.max(-1, Math.min(wave - 3, 9 - wave, 1));
  };
  return [channel(0), channel(8), channel(4)];
}

export function Globe({
  className,
  markers,
  arcs = [],
  scale = 1,
  mapSamples = 16000,
  mapBrightness = 6,
  markerSize = 0.025,
  arcHeight = 0.3,
  phi = 0,
  theta = 0,
  focus,
  dark = 0,
  speed = 0,
  opacity = 0.85,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>({ phi, theta });
  const dragStartRef = useRef<number | null>(null);
  const [view, setView] = useState<View>({ phi, theta });
  const radius = 250;
  const zoom = Math.max(1, scale);

  useEffect(() => {
    if (!focus) return;
    const [nextPhi, nextTheta] = locationToAngles(focus[0], focus[1]);
    viewRef.current = { phi: nextPhi, theta: nextTheta };
    setView(viewRef.current);
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let size = container.clientWidth;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const primary = hslTokenToRgb("--primary");
    const destructive = hslTokenToRgb("--destructive");
    const surface = hslTokenToRgb("--surface-elevated");
    const glow = hslTokenToRgb("--accent-soft");
    const observer = new ResizeObserver(([entry]) => {
      if (entry) size = entry.contentRect.width;
    });
    observer.observe(container);

    const globe = createGlobe(canvas, {
      devicePixelRatio: pixelRatio,
      width: size * pixelRatio,
      height: size * pixelRatio,
      phi: viewRef.current.phi,
      theta: viewRef.current.theta,
      dark,
      diffuse: 1.1,
      scale,
      mapSamples,
      mapBrightness,
      baseColor: surface,
      markerColor: primary,
      glowColor: glow,
      opacity,
      markers: markers.map((marker) => ({
        location: marker.location,
        size: markerSize,
        color: marker.color === "destructive" ? destructive : primary,
      })),
      onRender: (state) => {
        if (dragStartRef.current === null && speed !== 0) viewRef.current.phi += speed;
        state.phi = viewRef.current.phi;
        state.theta = viewRef.current.theta;
        state.width = size * pixelRatio;
        state.height = size * pixelRatio;
      },
    });

    return () => {
      observer.disconnect();
      globe.destroy();
    };
  }, [dark, mapBrightness, mapSamples, markerSize, markers, opacity, scale, speed]);

  const projectedMarkers = useMemo(
    () => markers.map((marker) => ({ ...marker, ...project(marker.location, view, radius) })),
    [markers, view],
  );

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    const delta = event.clientX - dragStartRef.current;
    viewRef.current = { ...viewRef.current, phi: viewRef.current.phi + (delta * 0.006) / zoom };
    dragStartRef.current = event.clientX;
    setView(viewRef.current);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-square w-full cursor-grab touch-none active:cursor-grabbing", className)}
      onPointerDown={(event) => {
        dragStartRef.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        dragStartRef.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { dragStartRef.current = null; }}
      role="img"
      aria-label="Interaktiver Globus mit Weltkarte, Hirzel und ausgewählten europäischen Zielorten"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <svg viewBox="0 0 600 600" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <clipPath id="globe-overlay-clip"><circle cx="300" cy="300" r={radius} /></clipPath>
        </defs>
        <g clipPath="url(#globe-overlay-clip)">
          <g transform={`translate(300 300) scale(${zoom}) translate(-300 -300)`}>
            {arcs.map((arc) => (
              <path
                key={arc.id}
                d={pathFromPoints(interpolate(arc.from, arc.to, arcHeight / zoom * 24).map((point) => project(point, view, radius)))}
                fill="none"
                className={arc.color === "destructive" ? "stroke-destructive" : "stroke-primary/65"}
                strokeWidth={(arc.color === "destructive" ? 3 : 1.5) / zoom}
                strokeLinecap="round"
              />
            ))}
            {projectedMarkers.filter((marker) => marker.visible).map((marker) => marker.label ? (
              <text
                key={marker.id}
                x={marker.x + 12 / zoom}
                y={marker.y - 12 / zoom}
                className="fill-foreground font-semibold"
                style={{ fontSize: `${16 / zoom}px` }}
              >
                {marker.label}
              </text>
            ) : null)}
          </g>
        </g>
      </svg>
    </div>
  );
}