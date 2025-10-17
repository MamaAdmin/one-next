import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BMADArtifact, downloadArtifact } from "@/hooks/useBMADArtifacts";
import { Brain, Users, Layers, Code, Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface BMADArtifactPreviewDialogProps {
  artifact: BMADArtifact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getAgentIcon = (agentType: string) => {
  switch (agentType) {
    case "business_analyst":
      return <Brain className="w-4 h-4 text-purple-500" />;
    case "manager":
      return <Users className="w-4 h-4 text-blue-500" />;
    case "architect":
      return <Layers className="w-4 h-4 text-orange-500" />;
    case "developer":
      return <Code className="w-4 h-4 text-green-500" />;
    default:
      return null;
  }
};

const getArtifactTypeColor = (type: string) => {
  switch (type) {
    case "requirements":
      return "bg-purple-500";
    case "architecture":
      return "bg-blue-500";
    case "code":
      return "bg-green-500";
    case "deployment":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

export const BMADArtifactPreviewDialog = ({
  artifact,
  open,
  onOpenChange,
}: BMADArtifactPreviewDialogProps) => {
  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    toast.success("In Zwischenablage kopiert");
  };

  const handleDownload = () => {
    downloadArtifact(artifact);
    toast.success("Artifact heruntergeladen");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getAgentIcon(artifact.agent_type)}
            {artifact.title}
          </DialogTitle>
          <DialogDescription>Version {artifact.version}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getArtifactTypeColor(artifact.artifact_type)}>
              {artifact.artifact_type}
            </Badge>
            <Badge variant="outline">{artifact.agent_type}</Badge>
            {artifact.is_approved !== null && (
              <Badge variant={artifact.is_approved ? "default" : "secondary"}>
                {artifact.is_approved ? "✓ Approved" : "⏳ Pending"}
              </Badge>
            )}
          </div>

          {/* Additional Metadata */}
          {artifact.metadata && Object.keys(artifact.metadata).length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Metadata</h4>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(artifact.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Inhalt</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Kopieren
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download (JSON)
                </Button>
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-muted max-h-[500px] overflow-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {artifact.content}
              </pre>
            </div>
          </div>

          {/* Parent Artifact */}
          {artifact.parent_artifact_id && (
            <div className="text-sm text-muted-foreground">
              <strong>Parent Artifact:</strong> {artifact.parent_artifact_id}
            </div>
          )}

          {/* Review Info */}
          {artifact.reviewed_by && artifact.reviewed_at && (
            <div className="text-sm text-muted-foreground">
              <strong>Reviewed by:</strong> {artifact.reviewed_by} on{" "}
              {new Date(artifact.reviewed_at).toLocaleString("de-DE")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
