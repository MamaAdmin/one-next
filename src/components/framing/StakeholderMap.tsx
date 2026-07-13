import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, Plus, Sparkles, Target, X } from "lucide-react";


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
  onAddStakeholder?: (name: string) => void;
  onRemoveStakeholder?: (name: string, isKi: boolean) => void;
}

function spiralPosition(index: number): StakeholderPosition {
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
  onAddStakeholder,
  onRemoveStakeholder,
}: StakeholderMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ name: string; offsetX: number; offsetY: number; moved: boolean } | null>(null);
  const [addValue, setAddValue] = useState("");

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
        moved: false,
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
      drag.moved = true;
      onPositionsChange({ ...positions, [drag.name]: clamped });
    },
    [onPositionsChange, positions],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    dragRef.current = null;
  }, []);

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

  const submitAdd = () => {
    const v = addValue.trim();
    if (!v || !onAddStakeholder) return;
    onAddStakeholder(v);
    setAddValue("");
  };

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-background p-6 lg:p-10 flex flex-col gap-3"
          : "hidden lg:flex flex-col gap-2"
      }
    >
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span className="font-semibold text-base text-foreground">Stakeholder-Map</span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Chips ziehen zum Positionieren</span>
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
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

      {fullscreen && onAddStakeholder ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitAdd();
              }
            }}
            placeholder="Neuen Stakeholder hinzufügen …"
            className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={submitAdd}
            disabled={!addValue.trim()}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" /> Hinzufügen
          </button>
        </div>
      ) : null}

      <div className={fullscreen ? "relative flex-1 min-h-0 pl-8 pr-2" : "relative pl-6"}>
        {/* Y-axis label */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          Einfluss: niedrig → hoch
        </div>
        <div
          ref={containerRef}
          className={
            fullscreen
              ? "relative w-full h-full rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-muted/40 via-background to-muted/30 overflow-hidden select-none shadow-inner"
              : "relative w-full aspect-[4/3] min-h-[460px] rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-muted/40 via-background to-muted/30 overflow-hidden select-none shadow-inner"
          }
        >
          {/* Quadrant tints */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="bg-primary/[0.04]" />
            <div className="bg-accent/[0.05]" />
            <div className="bg-muted/20" />
            <div className="bg-accent/[0.03]" />
          </div>

          {/* Quadrant labels */}
          <div className="absolute top-2 left-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 pointer-events-none">
            Informieren
          </div>
          <div className="absolute top-2 right-3 text-[10px] font-semibold uppercase tracking-wider text-primary/70 pointer-events-none">
            Eng einbinden
          </div>
          <div className="absolute bottom-6 left-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 pointer-events-none">
            Minimal beobachten
          </div>
          <div className="absolute bottom-6 right-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 pointer-events-none">
            Zufriedenstellen
          </div>

          {/* Guides */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />

          {/* Zielgruppen-Zentrum */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: "50%", top: "50%" }}
          >
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20">
              <Target className="w-7 h-7" />
            </div>
            {primaryKey ? (
              <span className="mt-2 text-sm font-semibold text-primary bg-background/90 px-2.5 py-1 rounded-md shadow-sm border border-primary/30">
                {primaryKey}
              </span>
            ) : (
              <span className="mt-2 text-xs text-muted-foreground bg-background/90 px-2 py-0.5 rounded">
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
                className={`group absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full text-sm font-medium shadow-md cursor-grab active:cursor-grabbing touch-none transition-all hover:shadow-lg hover:scale-105 ${
                  isKi
                    ? "border-2 border-accent/70 bg-accent-soft text-accent-foreground"
                    : "border-2 border-primary/40 bg-background text-foreground"
                }`}
                style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
                title={name}
              >
                {isKi ? (
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <span className={`w-2 h-2 rounded-full shrink-0 bg-primary`} />
                )}
                <span className="max-w-[180px] truncate">{name}</span>
                {onRemoveStakeholder ? (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveStakeholder(name, isKi);
                    }}
                    className="ml-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                    title="Entfernen"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
        {/* X-axis label */}
        <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>wenig betroffen</span>
          <span className="text-foreground">Betroffenheit →</span>
          <span>stark betroffen</span>
        </div>
      </div>
    </div>
  );
}


export default StakeholderMap;
