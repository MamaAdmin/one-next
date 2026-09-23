import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Pin, PinOff, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type SidebarState = {
  /** Sidebar visible as a docked column (desktop) */
  open: boolean;
  setOpen: (v: boolean) => void;
  /** Docked in the grid (true) or floating overlay (false) */
  pinned: boolean;
  setPinned: (v: boolean) => void;
  /** Mobile accordion */
  navOpen: boolean;
  setNavOpen: (v: boolean | ((o: boolean) => boolean)) => void;
};

export function useWorkspaceSidebar(storageKey: string): SidebarState {
  const [open, setOpenState] = useState(true);
  const [pinned, setPinnedState] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { open?: boolean; pinned?: boolean };
      if (typeof parsed.open === "boolean") setOpenState(parsed.open);
      if (typeof parsed.pinned === "boolean") setPinnedState(parsed.pinned);
    } catch {
      /* ignore broken storage values */
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: { open: boolean; pinned: boolean }) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage may be unavailable */
      }
    },
    [storageKey],
  );

  const setOpen = useCallback(
    (v: boolean) => {
      setOpenState(v);
      persist({ open: v, pinned });
    },
    [persist, pinned],
  );

  const setPinned = useCallback(
    (v: boolean) => {
      setPinnedState(v);
      persist({ open: v ? true : open, pinned: v });
      if (v) setOpenState(true);
    },
    [persist, open],
  );

  return { open, setOpen, pinned, setPinned, navOpen, setNavOpen };
}

/** Grid template for the workspace: docked column only when open and pinned. */
export function workspaceGridClass(state: SidebarState) {
  const docked = state.open && state.pinned;
  return docked
    ? "grid md:grid-cols-[220px_1fr] lg:grid-cols-[250px_1fr] gap-6 lg:gap-8"
    : "grid grid-cols-1 gap-6";
}

type Props = {
  state: SidebarState;
  /** Label shown in the mobile accordion toggle */
  mobileLabel: ReactNode;
  /** Always-visible block above the navigation (e.g. title) */
  header?: ReactNode;
  children: ReactNode;
};

export function WorkspaceSidebar({ state, mobileLabel, header, children }: Props) {
  const { open, setOpen, pinned, setPinned, navOpen, setNavOpen } = state;
  const floating = !pinned && open;

  return (
    <>
      {/* Reopen handle when the sidebar is hidden (desktop) */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden lg:flex fixed left-3 top-1/2 -translate-y-1/2 z-40 items-center gap-2 rounded-md border border-primary/30 bg-background/95 px-2.5 py-2 text-xs text-muted-foreground shadow-sm hover:text-foreground"
          title="Navigation einblenden"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      ) : null}

      {/* Backdrop for floating mode */}
      {floating ? (
        <div
          className="hidden lg:block fixed inset-0 z-30 bg-foreground/10"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={
          floating
            ? "lg:fixed lg:left-4 lg:top-28 lg:bottom-6 lg:z-40 lg:w-[280px] lg:overflow-y-auto lg:rounded-lg lg:border lg:bg-background lg:p-4 lg:shadow-xl space-y-3"
            : open
              ? "md:sticky md:top-24 md:self-start space-y-3"
              : "lg:hidden space-y-3"
        }
      >
        {header ? <div className={open ? "" : "lg:hidden"}>{header}</div> : null}

        {/* Mobile accordion toggle */}
        <button
          type="button"
          onClick={() => setNavOpen((o) => !o)}
          className="lg:hidden w-full flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm"
          aria-expanded={navOpen}
        >
          <span className="truncate">{mobileLabel}</span>
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${navOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Desktop controls */}
        {open ? (
          <div className="hidden lg:flex items-center justify-end gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setPinned(!pinned)}
              title={pinned ? "Seitenleiste lösen" : "Seitenleiste anpinnen"}
              aria-label={pinned ? "Seitenleiste lösen" : "Seitenleiste anpinnen"}
            >
              {pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setOpen(false)}
              title="Seitenleiste einklappen"
              aria-label="Seitenleiste einklappen"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : null}

        <nav className={`space-y-1 ${navOpen ? "block" : "hidden"} lg:block`}>{children}</nav>
      </aside>
    </>
  );
}
