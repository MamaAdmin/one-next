import { useMemo, useRef, useState, type PointerEvent } from "react";
import worldLand from "@/assets/maps/world-land.json";
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
type Ring = number[][];
type Polygon = Ring[];

export function locationToAngles(latitude: number, longitude: number): [number, number] {
  return [-(longitude * Math.PI) / 180, (latitude * Math.PI) / 180];
}

function project([latitude, longitude]: GlobeLocation, centerLongitude: number, centerLatitude: number, radius: number): ProjectedPoint {
  const toRadians = Math.PI / 180;
  const latitudeRad = latitude * toRadians;
  const longitudeRad = (longitude - centerLongitude) * toRadians;
  const centerLatitudeRad = centerLatitude * toRadians;
  const x = Math.cos(latitudeRad) * Math.sin(longitudeRad);
  const y = Math.cos(centerLatitudeRad) * Math.sin(latitudeRad) - Math.sin(centerLatitudeRad) * Math.cos(latitudeRad) * Math.cos(longitudeRad);
  const z = Math.sin(centerLatitudeRad) * Math.sin(latitudeRad) + Math.cos(centerLatitudeRad) * Math.cos(latitudeRad) * Math.cos(longitudeRad);
  return { x: 300 + x * radius, y: 300 - y * radius, visible: z >= 0 };
}

function interpolate(from: GlobeLocation, to: GlobeLocation, liftDegrees = 7, steps = 32) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps;
    const lift = Math.sin(progress * Math.PI) * liftDegrees;
    return [from[0] + (to[0] - from[0]) * progress + lift, from[1] + (to[1] - from[1]) * progress] as GlobeLocation;
  });
}

function pathFromPoints(points: ProjectedPoint[], close = false) {
  let started = false;
  const path = points.reduce((result, point) => {
    if (!point.visible) {
      started = false;
      return result;
    }
    const command = started ? "L" : "M";
    started = true;
    return `${result}${command}${point.x.toFixed(1)},${point.y.toFixed(1)} `;
  }, "");
  return close && points.every((point) => point.visible) ? `${path}Z` : path;
}

export function Globe({ className, markers, arcs = [], scale = 1, markerSize = 0.025, arcHeight = 0.3, phi = 0, theta = 0, focus }: GlobeProps) {
  const initialCenter: GlobeLocation = focus ?? markers[0]?.location ?? [theta * 180 / Math.PI, -phi * 180 / Math.PI];
  const [center, setCenter] = useState<GlobeLocation>(initialCenter);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const radius = 250;
  const zoom = Math.max(1, scale);
  const centerLongitude = focus?.[1] ?? center[1];
  const centerLatitude = focus?.[0] ?? center[0];

  const landPaths = useMemo(
    () => (worldLand as Polygon[]).flatMap((polygon) => polygon.map((ring) => {
      const points = ring.map(([longitude, latitude]) => project([latitude, longitude], centerLongitude, centerLatitude, radius));
      return pathFromPoints(points, true);
    })).filter(Boolean),
    [centerLatitude, centerLongitude],
  );

  const graticules = useMemo(() => {
    const lines: GlobeLocation[][] = [];
    for (let latitude = -60; latitude <= 60; latitude += 30) lines.push(Array.from({ length: 73 }, (_, index) => [latitude, -180 + index * 5]));
    for (let longitude = -180; longitude < 180; longitude += 30) lines.push(Array.from({ length: 37 }, (_, index) => [-90 + index * 5, longitude]));
    return lines;
  }, []);

  const projectedMarkers = markers.map((marker) => ({ ...marker, ...project(marker.location, centerLongitude, centerLatitude, radius) }));

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragStart.current || focus) return;
    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    setCenter(([latitude, longitude]) => [Math.max(-75, Math.min(75, latitude + deltaY * 0.18 / zoom)), longitude - deltaX * 0.35 / zoom]);
    dragStart.current = { x: event.clientX, y: event.clientY };
  };

  return (
    <svg
      viewBox="0 0 600 600"
      className={cn("aspect-square w-full cursor-grab touch-none text-primary active:cursor-grabbing", className)}
      onPointerDown={(event) => {
        dragStart.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        dragStart.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { dragStart.current = null; }}
      role="img"
      aria-label="Interaktiver Globus mit Weltkarte, Hirzel und ausgewählten europäischen Zielorten"
    >
      <defs>
        <clipPath id="globe-map-clip"><circle cx="300" cy="300" r={radius} /></clipPath>
        <radialGradient id="globe-surface" cx="35%" cy="30%" r="70%">
          <stop offset="0%" className="text-surface-elevated" stopColor="currentColor" />
          <stop offset="100%" className="text-accent-soft" stopColor="currentColor" />
        </radialGradient>
      </defs>

      <circle cx="300" cy="300" r={radius + 12} className="fill-accent-soft/50" />
      <circle cx="300" cy="300" r={radius} fill="url(#globe-surface)" className="stroke-border-strong" strokeWidth="2" />
      <g clipPath="url(#globe-map-clip)">
        <g transform={`translate(300 300) scale(${zoom}) translate(-300 -300)`}>
          {landPaths.map((path, index) => (
            <path key={`land-${index}`} d={path} className="fill-primary/10 stroke-primary/45" strokeWidth={1.2 / zoom} strokeLinejoin="round" />
          ))}
          {graticules.map((line, index) => (
            <path key={`grid-${index}`} d={pathFromPoints(line.map((point) => project(point, centerLongitude, centerLatitude, radius)))} fill="none" className="stroke-primary/10" strokeWidth={0.8 / zoom} />
          ))}
          {arcs.map((arc) => (
            <path key={arc.id} d={pathFromPoints(interpolate(arc.from, arc.to, arcHeight * 24 / zoom).map((point) => project(point, centerLongitude, centerLatitude, radius)))} fill="none" className={arc.color === "destructive" ? "stroke-destructive" : "stroke-primary/65"} strokeWidth={(arc.color === "destructive" ? 3 : 1.5) / zoom} strokeLinecap="round" />
          ))}
          {projectedMarkers.filter((marker) => marker.visible).map((marker) => (
            <g key={marker.id}>
              <circle cx={marker.x} cy={marker.y} r={Math.max(4, markerSize * 260) / zoom} className={marker.color === "destructive" ? "fill-destructive" : "fill-primary"} />
              <circle cx={marker.x} cy={marker.y} r={Math.max(8, markerSize * 420) / zoom} fill="none" className={marker.color === "destructive" ? "stroke-destructive/40" : "stroke-primary/25"} strokeWidth={2 / zoom} />
              {marker.label ? <text x={marker.x + 12 / zoom} y={marker.y - 12 / zoom} className="fill-foreground font-semibold" style={{ fontSize: `${16 / zoom}px` }}>{marker.label}</text> : null}
            </g>
          ))}
        </g>
      </g>
      <ellipse cx="300" cy={300 + radius + 16} rx={radius * 0.7} ry="12" className="fill-foreground/10" />
    </svg>
  );
}