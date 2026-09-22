import { useMemo, useState } from "react";
import { Globe, locationToAngles, type Marker, type Arc } from "@/components/ui/CobeGlobe";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HIRZEL: [number, number] = [47.2167, 8.6036];

type Ziel = { id: string; name: string; land: string; loc: [number, number] };

const ZIELE: Ziel[] = [
  { id: "milano", name: "Milano", land: "IT", loc: [45.4642, 9.19] },
  { id: "genf", name: "Genève", land: "CH", loc: [46.2044, 6.1432] },
  { id: "innsbruck", name: "Innsbruck", land: "AT", loc: [47.2692, 11.4041] },
  { id: "muenchen", name: "München", land: "DE", loc: [48.1351, 11.582] },
  { id: "torino", name: "Torino", land: "IT", loc: [45.0703, 7.6869] },
  { id: "lyon", name: "Lyon", land: "FR", loc: [45.764, 4.8357] },
  { id: "nizza", name: "Nice", land: "FR", loc: [43.7102, 7.262] },
  { id: "ljubljana", name: "Ljubljana", land: "SI", loc: [46.0569, 14.5058] },
  { id: "wien", name: "Wien", land: "AT", loc: [48.2082, 16.3738] },
];

type Stufe = "alpenraum" | "welt";
const ZOOM: Record<Stufe, { scale: number; mapSamples: number; markerSize: number; bright: number }> = {
  alpenraum: { scale: 8, mapSamples: 42000, markerSize: 0.02, bright: 3.2 },
  welt: { scale: 1, mapSamples: 16000, markerSize: 0.025, bright: 8 },
};

function distanzKm([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r;
  const dLon = (lon2 - lon1) * r;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function peilungGrad([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const r = Math.PI / 180;
  const dLon = (lon2 - lon1) * r;
  const y = Math.sin(dLon) * Math.cos(lat2 * r);
  const x = Math.cos(lat1 * r) * Math.sin(lat2 * r) - Math.sin(lat1 * r) * Math.cos(lat2 * r) * Math.cos(dLon);
  return (Math.atan2(y, x) / r + 360) % 360;
}

const RICHTUNG = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
const kompass = (grad: number) => RICHTUNG[Math.round(grad / 45) % 8];

export function HirzelGlobe() {
  const [stufe, setStufe] = useState<Stufe>("alpenraum");
  const [aktiv, setAktiv] = useState<string | null>(null);
  const globeSettings = ZOOM[stufe];

  const markers: Marker[] = useMemo(
    () => [
      { id: "hirzel", location: HIRZEL, label: "Hirzel", color: "destructive" },
      ...ZIELE.map((ziel) => ({
        id: ziel.id,
        location: ziel.loc,
        label: aktiv === ziel.id ? ziel.name : "",
        color: aktiv === ziel.id ? ("destructive" as const) : ("primary" as const),
      })),
    ],
    [aktiv],
  );

  const arcs: Arc[] = useMemo(
    () =>
      ZIELE.map((ziel) => ({
        id: ziel.id,
        from: HIRZEL,
        to: ziel.loc,
        color: aktiv === ziel.id ? ("destructive" as const) : ("primary" as const),
      })),
    [aktiv],
  );

  const zielAktiv = ZIELE.find((ziel) => ziel.id === aktiv) ?? null;
  const phiStart = useMemo(() => locationToAngles(HIRZEL[0], HIRZEL[1])[0], []);
  const daten = useMemo(
    () => ZIELE.map((ziel) => ({ ...ziel, km: distanzKm(HIRZEL, ziel.loc), grad: peilungGrad(HIRZEL, ziel.loc) })),
    [],
  );

  return (
    <section className="border-t border-border py-14 md:py-20" aria-labelledby="hirzel-globe-title">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-sm font-semibold uppercase text-primary">Unser Ausgangspunkt</p>
        <h2 id="hirzel-globe-title" className="text-3xl font-bold text-foreground md:text-4xl">Von Hirzel aus vernetzt</h2>
        <p className="mt-3 text-muted-foreground">Wählen Sie einen Zielort oder drehen Sie den Globus direkt.</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="min-w-0">
          <div className="mb-3 flex gap-2" role="group" aria-label="Ansicht wählen">
            {(["alpenraum", "welt"] as Stufe[]).map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={stufe === option ? "default" : "outline"}
                onClick={() => setStufe(option)}
                aria-pressed={stufe === option}
                className="capitalize"
              >
                {option === "alpenraum" ? "Alpenraum" : "Welt"}
              </Button>
            ))}
          </div>
          <Globe
            key={stufe}
            className="mx-auto max-w-[38rem]"
            markers={markers}
            arcs={arcs}
            scale={globeSettings.scale}
            mapSamples={globeSettings.mapSamples}
            mapBrightness={globeSettings.bright}
            markerSize={globeSettings.markerSize}
            phi={phiStart}
            theta={(HIRZEL[0] * Math.PI) / 180}
            focus={zielAktiv?.loc ?? null}
          />
        </div>

        <ul className="divide-y divide-border border-y border-border text-sm">
          {daten.map((ziel) => (
            <li key={ziel.id}>
              <button
                type="button"
                onClick={() => setAktiv(aktiv === ziel.id ? null : ziel.id)}
                aria-pressed={aktiv === ziel.id}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 border-l-[3px] px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  aktiv === ziel.id ? "border-l-destructive bg-accent-soft" : "border-l-transparent hover:bg-muted",
                )}
              >
                <span className="font-medium text-foreground">
                  {ziel.name}
                  <span className="ml-2 text-xs text-muted-foreground">{ziel.land}</span>
                </span>
                <span className="text-right tabular-nums text-foreground">{ziel.km.toFixed(0)} km</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {ziel.loc[0].toFixed(4)}° N, {ziel.loc[1].toFixed(4)}° E
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">
                  {ziel.grad.toFixed(0)}° {kompass(ziel.grad)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}