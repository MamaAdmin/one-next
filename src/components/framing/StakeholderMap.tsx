import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, Sparkles, Target } from "lucide-react";


export interface StakeholderPosition {
  x: number; // 0..1
  y: number; // 0..1
}

interface StakeholderMapProps {
  stakeholder: string[];
  kiStakeholder: string[];
  primary?: string;
  positions: Record<string, StakeholderPosition>;
  onPositionsChange: (next: Record<string, StakeholderPosition>) => void;
}

function spiralPosition(index: number): StakeholderPosition {
  // Golden-angle spiral around center, keeps chips from overlapping.
  const golden = Math.PI * (3 - Math.sqrt(5));
  const radius = 0.08 + index * 0.045;
  const angle = index * golden;
  const x = Math.min(0.92, Math.max(0.08, 0.5 + radius * Math.cos(angle)));
  const y = Math.min(0.92, Math.max(0.08, 0.5 + radius * Math.sin(angle)));
  return { x, y };
}

export function StakeholderMap({
  stakeholder,
  kiStakeholder,
  primary,
  positions,
  onPositionsChange,
}: StakeholderMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ name: string; offsetX: number; offsetY: number } | null>(null);

  const allNames = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ name: string; isKi: boolean }> = [];
    stakeholder.forEach((n) => {
      const key = n.trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push({ name: key, isKi: false });
    });
    kiStakeholder.forEach((n) => {
      const key = n.trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push({ name: key, isKi: true });
    });
    return list;
  }, [stakeholder, kiStakeholder]);

  // Auto-assign positions for new stakeholders and purge stale ones.
  useEffect(() => {
    const nameSet = new Set(allNames.map((n) => n.name));
    let changed = false;
    const next: Record<string, StakeholderPosition> = {};
    Object.entries(positions).forEach(([k, v]) => {
      if (nameSet.has(k)) next[k] = v;
      else changed = true;
    });
    allNames.forEach((entry, idx) => {
      if (!next[entry.name]) {
        next[entry.name] = spiralPosition(idx);
        changed = true;
      }
    });
    if (changed) onPositionsChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNames]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, name: string) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = positions[name] ?? { x: 0.5, y: 0.5 };
      dragRef.current = {
        name,
        offsetX: e.clientX - (rect.left + pos.x * rect.width),
        offsetY: e.clientY - (rect.top + pos.y * rect.height),
      };
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    },
    [positions],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - drag.offsetX - rect.left) / rect.width;
      const y = (e.clientY - drag.offsetY - rect.top) / rect.height;
      const clamped: StakeholderPosition = {
        x: Math.min(0.97, Math.max(0.03, x)),
        y: Math.min(0.97, Math.max(0.03, y)),
      };
      onPositionsChange({ ...positions, [drag.name]: clamped });
    },
    [onPositionsChange, positions],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragRef.current) {
        try {
          (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      }
      dragRef.current = null;
    },
    [],
  );

  const primaryKey = primary?.trim() ?? "";
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-background p-6 lg:p-10 flex flex-col gap-3"
          : "hidden lg:flex flex-col gap-2"
      }
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Stakeholder-Map</span>
        <div className="flex items-center gap-3">
          <span>Ziehen zum Positionieren</span>
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            title={fullscreen ? "Vollbild verlassen" : "Vollbild"}
          >
            {fullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" /> Schließen
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" /> Vollbild
              </>
            )}
          </button>
        </div>
      </div>
      <div className={fullscreen ? "relative flex-1 min-h-0" : "relative"}>
        {/* Y-axis label */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          Einfluss: niedrig → hoch
        </div>
        <div
          ref={containerRef}
          className={
            fullscreen
              ? "relative w-full h-full rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden select-none"
              : "relative w-full aspect-[4/3] min-h-[420px] rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden select-none"
          }
        >
          {/* Guides */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-border/60" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-border/60" />

          {/* Zielgruppen-Zentrum */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: "50%", top: "50%" }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md">
              <Target className="w-5 h-5" />
            </div>
            {primaryKey ? (
              <span className="mt-1 text-xs font-medium text-primary bg-background/80 px-1.5 py-0.5 rounded">
                {primaryKey}
              </span>
            ) : (
              <span className="mt-1 text-[10px] text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
                Zielgruppe wählen
              </span>
            )}
          </div>

          {/* Chips */}
          {allNames.map(({ name, isKi }) => {
            if (name === primaryKey) return null;
            const pos = positions[name];
            if (!pos) return null;
            return (
              <div
                key={name}
                onPointerDown={(e) => handlePointerDown(e, name)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm cursor-grab active:cursor-grabbing touch-none transition-shadow hover:shadow-md ${
                  isKi
                    ? "border border-accent/60 bg-accent-soft text-accent-foreground"
                    : "border border-border bg-background text-foreground"
                }`}
                style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
                title={name}
              >
                {isKi ? <Sparkles className="w-3 h-3" /> : null}
                <span className="max-w-[140px] truncate">{name}</span>
              </div>
            );
          })}
        </div>
        {/* X-axis label */}
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>wenig betroffen</span>
          <span>Betroffenheit</span>
          <span>stark betroffen</span>
        </div>
      </div>
    </div>
  );
}


export default StakeholderMap;
