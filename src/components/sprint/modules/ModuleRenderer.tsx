import { JourneyMap } from "@/components/sprint/JourneyMap";
import { Crazy8Grid } from "@/components/sprint/Crazy8Grid";
import { StoryboardEditor } from "@/components/sprint/StoryboardEditor";
import { HeatmapVoting } from "@/components/sprint/HeatmapVoting";
import { SmartSailboat } from "@/components/sprint/SmartSailboat";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import DOMPurify from "dompurify";

interface ModuleRendererProps {
  moduleType: string;
  moduleConfig?: any;
  data: any;
  onDataChange: (data: any) => void;
  externalTool?: string | null;
  externalToolConfig?: any;
}

export const ModuleRenderer = ({
  moduleType,
  moduleConfig,
  data,
  onDataChange,
  externalTool,
  externalToolConfig,
}: ModuleRendererProps) => {
  // If external tool is configured, show integration component
  if (externalTool) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Externe Tool-Integration: {externalTool}</h3>
          <p className="text-sm text-muted-foreground">
            Für diese Übung verwenden wir {externalTool}
          </p>
          {externalToolConfig?.url && (
            <a
              href={externalToolConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
            >
              In {externalTool} öffnen
            </a>
          )}
        </div>
      </Card>
    );
  }

  // Render built-in module types
  switch (moduleType) {
    case "journey_map":
      return (
        <JourneyMap
          touchpoints={data?.touchpoints || []}
          onChange={(touchpoints) => onDataChange({ touchpoints })}
        />
      );

    case "crazy8":
      return (
        <Crazy8Grid
          sketches={
            data?.sketches ||
            Array.from({ length: 8 }, (_, i) => ({ id: i + 1, content: "" }))
          }
          onChange={(id, content) => {
            const sketches = data?.sketches || Array.from({ length: 8 }, (_, i) => ({ id: i + 1, content: "" }));
            const updated = sketches.map((s: any) =>
              s.id === id ? { ...s, content } : s
            );
            onDataChange({ sketches: updated });
          }}
        />
      );

    case "storyboard":
      return (
        <StoryboardEditor
          panels={
            data?.panels ||
            Array.from({ length: 6 }, (_, i) => ({
              id: i + 1,
              title: "",
              description: "",
            }))
          }
          onChange={(panels) => onDataChange({ panels })}
        />
      );

    case "heatmap":
      return (
        <HeatmapVoting
          sketches={data?.sketches || []}
          userVotes={data?.userVotes || 0}
          maxVotes={moduleConfig?.maxVotes || 3}
          onVote={(sketchId) => {
            const newUserVotes = (data?.userVotes || 0) + 1;
            const updatedSketches = (data?.sketches || []).map((sketch: any) =>
              sketch.id === sketchId
                ? { ...sketch, votes: (sketch.votes || 0) + 1 }
                : sketch
            );
            onDataChange({
              ...data,
              sketches: updatedSketches,
              userVotes: newUserVotes,
            });
          }}
        />
      );

    case "sailboat":
      return (
        <SmartSailboat
          values={
            data || { drivers: "", obstacles: "", goal: "", risks: "" }
          }
          onChange={(field, value) => {
            onDataChange({ ...data, [field]: value });
          }}
        />
      );

    case "custom":
      return (
        <Card className="p-6">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(moduleConfig?.content || "<p>Benutzerdefinierte Übung</p>") }} />
          </div>
        </Card>
      );

    default:
      return (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            <p>Unbekannter Modul-Typ: {moduleType}</p>
          </div>
        </Card>
      );
  }
};
