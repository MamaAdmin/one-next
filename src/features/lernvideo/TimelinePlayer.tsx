import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Pause, Play, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { overlayBox, type Overlay, type Timeline, type TimelineScene } from "./timeline";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const ease = (p: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);

/** Einblendung: 0.4 s rein, 0.3 s raus. */
function appear(local: number, duration: number): CSSProperties {
  const inP = ease(local / 0.4);
  const outP = ease((duration - local) / 0.3);
  const o = Math.min(inP, outP);
  return { opacity: o, transform: `translateY(${(1 - inP) * 12}px)` };
}

const OverlayView = ({ o, local, format }: { o: Overlay; local: number; format: Timeline["format"] }) => {
  const box = overlayBox(o.type, o.position, format);
  const p = local / Math.max(0.1, o.duration);
  const grow = ease(local / Math.min(1.2, o.duration * 0.6));
  const base: CSSProperties = {
    position: "absolute", left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%`,
    display: "flex", flexDirection: "column", justifyContent: "center", ...appear(local, o.duration),
  };
  const card = "rounded-md bg-card/90 border border-border shadow-sm text-foreground";
  switch (o.type) {
    case "title":
      return (
        <div style={base}>
          <div className={`${card} px-[3cqw] py-[1.5cqw] self-start`}>
            <div className="font-semibold text-primary leading-tight" style={{ fontSize: format === "16:9" ? "3.6cqw" : "6.4cqw" }}>{o.text}</div>
          </div>
        </div>
      );
    case "term":
      return (
        <div style={base}>
          <div className={`${card} px-[2.5cqw] py-[1.4cqw] self-start border-l-4 border-l-accent`}>
            <div className="font-semibold text-primary" style={{ fontSize: format === "16:9" ? "2.6cqw" : "5cqw" }}>{o.text}</div>
            {o.detail && <div className="text-muted-foreground mt-1" style={{ fontSize: format === "16:9" ? "1.7cqw" : "3.4cqw" }}>{o.detail}</div>}
          </div>
        </div>
      );
    case "number": {
      const v = (o.value ?? 0) * grow;
      const digits = Number.isInteger(o.value ?? 0) ? 0 : 1;
      return (
        <div style={base} className="items-center text-center">
          <div className="font-bold text-primary tabular-nums" style={{ fontSize: format === "16:9" ? "8cqw" : "16cqw" }}>
            {v.toLocaleString("de-CH", { minimumFractionDigits: digits, maximumFractionDigits: digits })}{o.suffix ?? ""}
          </div>
          <div className="text-foreground" style={{ fontSize: format === "16:9" ? "2cqw" : "4.2cqw" }}>{o.text}</div>
        </div>
      );
    }
    case "list": {
      const items = o.items ?? [];
      return (
        <div style={base}>
          <div className={`${card} px-[2.5cqw] py-[1.5cqw]`}>
            {o.text && <div className="font-semibold text-primary mb-2" style={{ fontSize: format === "16:9" ? "2.2cqw" : "4.6cqw" }}>{o.text}</div>}
            <ul className="space-y-1">
              {items.map((it, i) => (
                <li key={i} style={{ fontSize: format === "16:9" ? "1.8cqw" : "3.8cqw", opacity: ease((local - 0.3 - i * 0.5) / 0.4) }}
                  className="flex gap-2"><span className="text-accent">•</span>{it}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    case "bar": {
      const data = o.data ?? [];
      const max = Math.max(1, ...data.map((d) => d.value));
      return (
        <div style={base}>
          <div className={`${card} p-[2cqw] h-full flex flex-col`}>
            {o.text && <div className="font-semibold text-primary mb-2" style={{ fontSize: format === "16:9" ? "2cqw" : "4.2cqw" }}>{o.text}</div>}
            <div className="flex-1 flex items-end gap-[2%]">
              {data.map((d, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end items-center">
                  <span className="tabular-nums text-foreground" style={{ fontSize: format === "16:9" ? "1.4cqw" : "3cqw" }}>{Math.round(d.value * grow)}</span>
                  <div className="w-full rounded-t bg-primary" style={{ height: `${(d.value / max) * 75 * grow}%` }} />
                  <span className="text-muted-foreground mt-1 text-center" style={{ fontSize: format === "16:9" ? "1.2cqw" : "2.6cqw" }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case "pie": {
      const data = o.data ?? [];
      const total = data.reduce((a, d) => a + d.value, 0) || 1;
      const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(var(--border))"];
      let acc = 0;
      const stops = data.map((d, i) => {
        const from = acc; acc += (d.value / total) * 360 * grow;
        return `${colors[i % colors.length]} ${from}deg ${acc}deg`;
      });
      return (
        <div style={base}>
          <div className={`${card} p-[2cqw] h-full flex ${format === "16:9" ? "flex-row" : "flex-row"} items-center gap-[3cqw]`}>
            <div className="aspect-square h-full max-h-full rounded-full shrink-0"
              style={{ background: `conic-gradient(${stops.join(",")}, transparent ${acc}deg 360deg)` }} />
            <div className="space-y-1">
              {o.text && <div className="font-semibold text-primary" style={{ fontSize: format === "16:9" ? "2cqw" : "4cqw" }}>{o.text}</div>}
              {data.map((d, i) => (
                <div key={i} className="flex items-center gap-2" style={{ fontSize: format === "16:9" ? "1.5cqw" : "3.2cqw" }}>
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: colors[i % colors.length] }} />
                  {d.label} {Math.round((d.value / total) * 100)} %
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    default:
      return (
        <div style={base} className="items-center">
          <div className="rounded bg-foreground/80 text-background px-3 py-1 text-center" style={{ fontSize: format === "16:9" ? "2cqw" : "4cqw" }}>{o.text}</div>
        </div>
      );
  }
  void p;
};

const Visual = ({ scene, local, playing }: { scene: TimelineScene; local: number; playing: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { visual } = scene;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const target = Math.min(local, (visual.clipSeconds ?? v.duration ?? 0) - 0.05);
    if (Math.abs(v.currentTime - target) > 0.4 && Number.isFinite(target)) v.currentTime = Math.max(0, target);
    if (playing && local < (v.duration || Infinity)) void v.play().catch(() => {});
    else v.pause();
  }, [local, playing, visual.clipSeconds]);

  const img = visual.imageUrl;
  if (visual.kind === "video" && visual.videoUrl) {
    return (
      <>
        {img && <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <video ref={videoRef} src={visual.videoUrl} muted playsInline className="absolute inset-0 w-full h-full object-cover" />
      </>
    );
  }
  if (visual.kind === "whiteboard" && img) {
    const reveal = Math.min(1, local / Math.max(1, scene.duration * 0.7));
    return (
      <div className="absolute inset-0 bg-card">
        <img src={img} alt="" className="absolute inset-0 w-full h-full object-contain" style={{ clipPath: `inset(0 ${100 - reveal * 100}% 0 0)` }} />
      </div>
    );
  }
  if (visual.kind === "kinetic") {
    const words = scene.narration.split(/\s+/).filter(Boolean);
    const speak = scene.audio?.duration ?? scene.duration;
    const shown = Math.floor((local / speak) * words.length);
    const windowStart = Math.max(0, shown - 6);
    return (
      <div className="absolute inset-0 bg-background flex items-center justify-center p-[6cqw]">
        {img && <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
        <p className="relative text-center font-bold text-primary leading-tight" style={{ fontSize: "5.5cqw" }}>
          {words.slice(windowStart, shown + 1).map((w, i, arr) => (
            <span key={windowStart + i} className={i === arr.length - 1 ? "text-accent" : ""}>{w} </span>
          ))}
        </p>
      </div>
    );
  }
  if ((visual.kind === "fallback" || visual.kind === "image") && img) {
    const zoom = 1 + 0.08 * Math.min(1, local / Math.max(1, scene.duration));
    return (
      <>
        <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ transform: `scale(${zoom})` }} />
        {visual.kind === "fallback" && (
          <div className="absolute top-2 left-2 rounded bg-destructive text-destructive-foreground text-xs px-2 py-1 z-20">
            Ersatz: Standbild, Video fehlt
          </div>
        )}
      </>
    );
  }
  return (
    <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm">
      Szene {scene.index + 1}: noch kein Bild
    </div>
  );
};

export const TimelinePlayer = ({ timeline, showSubtitles = true }: { timeline: Timeline; showSubtitles?: boolean }) => {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const last = useRef<number | null>(null);
  const lastScene = useRef<string | null>(null);

  const scene = useMemo(
    () => timeline.scenes.find((s) => time >= s.start && time < s.start + s.duration) ?? timeline.scenes[timeline.scenes.length - 1],
    [timeline, time],
  );
  const local = scene ? time - scene.start : 0;
  const speaking = !!scene?.audio && local < scene.audio.duration;

  useEffect(() => {
    if (!playing) { last.current = null; return; }
    let raf = 0;
    const tick = (now: number) => {
      if (last.current != null) {
        setTime((t) => {
          const next = t + (now - last.current!) / 1000;
          if (next >= timeline.duration) { setPlaying(false); return timeline.duration; }
          return next;
        });
      }
      last.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, timeline.duration]);

  // Sprecherspur je Szene synchron halten
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !scene) return;
    if (lastScene.current !== scene.id) {
      lastScene.current = scene.id;
      if (scene.audio) { a.src = scene.audio.url; a.currentTime = local; } else a.removeAttribute("src");
    }
    if (!scene.audio || local >= scene.audio.duration) { a.pause(); return; }
    if (Math.abs(a.currentTime - local) > 0.3) a.currentTime = local;
    if (playing) void a.play().catch(() => {}); else a.pause();
  }, [scene, local, playing]);

  // Musik mit Absenkung während gesprochen wird
  useEffect(() => {
    const m = musicRef.current;
    if (!m || !timeline.music) return;
    const target = timeline.music.volume * (speaking ? timeline.music.duckFactor : 1);
    m.volume = Math.max(0, Math.min(1, m.volume + (target - m.volume) * 0.15));
    if (playing) void m.play().catch(() => {}); else m.pause();
    if (Math.abs(m.currentTime - time) > 1 && m.duration) m.currentTime = time % m.duration;
  }, [time, playing, speaking, timeline.music]);

  const seek = (t: number) => { setTime(t); lastScene.current = null; };
  const cues = showSubtitles ? timeline.subtitles.filter((c) => time >= c.start && time < c.end) : [];

  return (
    <div className="space-y-3">
      <div className={`relative mx-auto overflow-hidden rounded-md border border-border bg-background ${timeline.format === "16:9" ? "w-full aspect-video" : "aspect-[9/16] h-[70vh] max-h-[720px]"}`}
        style={{ containerType: "inline-size" }}>
        {scene && <Visual scene={scene} local={local} playing={playing} />}
        {scene?.overlays.filter((o) => local >= o.start && local < o.start + o.duration).map((o) => (
          <OverlayView key={o.id} o={o} local={local - o.start} format={timeline.format} />
        ))}
        {cues.map((c) => (
          <OverlayView key={c.start} format={timeline.format} local={time - c.start}
            o={{ id: "sub", type: "subtitle", text: c.text, position: "bottom", start: 0, duration: c.end - c.start }} />
        ))}
      </div>
      <audio ref={audioRef} />
      {timeline.music && <audio ref={musicRef} src={timeline.music.url} loop />}
      <div className="flex items-center gap-3">
        <Button size="icon" variant="outline" onClick={() => seek(0)} aria-label="Zum Anfang"><SkipBack className="w-4 h-4" /></Button>
        <Button size="icon" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Abspielen"}>
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Slider className="flex-1" min={0} max={Math.max(0.1, timeline.duration)} step={0.1} value={[time]} onValueChange={([v]) => seek(v)} />
        <span className="text-sm tabular-nums text-muted-foreground w-24 text-right">{fmt(time)} / {fmt(timeline.duration)}</span>
      </div>
      <div className="flex h-2 gap-px rounded overflow-hidden">
        {timeline.scenes.map((s) => (
          <button key={s.id} type="button" onClick={() => seek(s.start)} title={`Szene ${s.index + 1}`}
            className={`${s.visual.kind === "fallback" || s.visual.kind === "none" ? "bg-destructive/60" : s.id === scene?.id ? "bg-primary" : "bg-accent/40"}`}
            style={{ flex: s.duration }} />
        ))}
      </div>
    </div>
  );
};
