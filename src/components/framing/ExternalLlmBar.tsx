import { ExternalLink, Search } from "lucide-react";
import { useExternalLlms } from "@/features/framing/externalLlms";

export function ExternalLlmBar() {
  const { selectedDefs } = useExternalLlms();

  if (selectedDefs.length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
        <Search className="w-3.5 h-3.5" />
        <span>
          Externe KI-Hilfe: keine Tools ausgewählt. Wähle im Intro-Schritt deine
          bevorzugten KI-Tools.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
        <Search className="w-3.5 h-3.5" /> Externe KI-Hilfe:
      </span>
      {selectedDefs.map((llm) => (
        <a
          key={llm.id}
          href={llm.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 hover:bg-accent-soft hover:text-foreground transition-colors"
          title={`${llm.label} in neuem Tab öffnen`}
        >
          <span>{llm.label}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      ))}
    </div>
  );
}
