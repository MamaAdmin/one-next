import type { ReactNode } from "react";

interface CanvasSectionProps {
  title: string;
  children: ReactNode;
}

export function CanvasSection({ title, children }: CanvasSectionProps) {
  return (
    <details className="rounded-md border bg-muted/30 px-3 py-2 group">
      <summary className="cursor-pointer text-sm font-medium text-muted-foreground list-none flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs opacity-60 group-open:hidden">öffnen</span>
        <span className="text-xs opacity-60 hidden group-open:inline">schließen</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export default CanvasSection;
