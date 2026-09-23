import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface CanvasSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CanvasSection({ title, children, defaultOpen }: CanvasSectionProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-md border bg-muted/30 px-3 py-2 transition-colors group-open:border-primary/40 open:border-primary/40 hover:bg-muted/60"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary transition-all duration-200 group-open:rotate-90 group-hover:bg-primary/20">
            <ChevronRight className="h-4 w-4" />
          </span>
          <span>{title}</span>
        </span>
        <span className="text-xs font-medium text-primary group-open:hidden">
          öffnen
        </span>
        <span className="hidden text-xs font-medium text-primary group-open:inline">
          schließen
        </span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export default CanvasSection;
