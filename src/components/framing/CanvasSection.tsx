import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface CanvasSectionProps {
  title: string;
  children: ReactNode;
}

export function CanvasSection({ title, children }: CanvasSectionProps) {
  return (
    <details className="group rounded-md border bg-muted/30 px-3 py-2 transition-colors group-open:border-primary/40 open:border-primary/40 hover:bg-muted/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-primary transition-transform duration-200 group-open:rotate-90" />
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
