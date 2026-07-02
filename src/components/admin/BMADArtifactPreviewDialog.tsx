import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BMADArtifact, downloadArtifact } from "@/hooks/useBMADArtifacts";
import { Brain, Users, Layers, Code, Download, Copy, Edit, X, Check, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BMADArtifactPreviewDialogProps {
  artifact: BMADArtifact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const getAgentIcon = (agentType: string) => {
  switch (agentType) {
    case "business_analyst":
      return <Brain className="w-4 h-4 text-primary" />;
    case "manager":
      return <Users className="w-4 h-4 text-primary" />;
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
      return "bg-primary";
    case "architecture":
      return "bg-primary";
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
  onSaved,
}: BMADArtifactPreviewDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(artifact?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    toast.success("In Zwischenablage kopiert");
  };

  const handleDownload = () => {
    downloadArtifact(artifact);
    toast.success("Artifact heruntergeladen");
  };

  const handleEdit = () => {
    if (isEditing) {
      setEditedContent(artifact.content);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editedContent === artifact.content) {
      toast.info("Keine Änderungen vorgenommen");
      return;
    }

    setIsSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      const { error } = await supabase
        .from("bmad_artifacts")
        .insert({
          session_id: artifact.session_id,
          agent_type: artifact.agent_type,
          artifact_type: artifact.artifact_type,
          title: artifact.title,
          content: editedContent,
          version: artifact.version + 1,
          parent_artifact_id: artifact.id,
          metadata: {
            ...artifact.metadata,
            edited_by: userId || "unknown",
            edited_at: new Date().toISOString(),
            edit_reason: "Manual edit",
          },
          is_approved: null,
        } as any);

      if (error) throw error;

      toast.success(`Neue Version v${artifact.version + 1} erstellt`);
      setIsEditing(false);
      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      console.error("Error saving artifact:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (isApproved: boolean) => {
    setIsApproving(true);
    try {
      const { error } = await supabase.functions.invoke('bmad-approve-artifact', {
        body: {
          artifact_id: artifact.id,
          is_approved: isApproved,
        }
      });

      if (error) throw error;

      toast.success(isApproved ? "Artifact genehmigt ✓" : "Artifact abgelehnt ✗");
      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      console.error("Error approving artifact:", error);
      toast.error("Fehler beim Genehmigen");
    } finally {
      setIsApproving(false);
    }
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
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Vorschau
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => handleApprove(true)}
              disabled={isApproving}
            >
              <Check className="w-4 h-4 mr-2" />
              {artifact.is_approved === true ? "✓ Genehmigt" : "Genehmigen"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleApprove(false)}
              disabled={isApproving}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {artifact.is_approved === false ? "✗ Abgelehnt" : "Ablehnen"}
            </Button>
          </div>

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
                <Button
                  size="sm"
                  variant={isEditing ? "destructive" : "default"}
                  onClick={handleEdit}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Abbrechen
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
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

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Content bearbeiten..."
                />
                <Button
                  onClick={handleSave}
                  disabled={isSaving || editedContent === artifact.content}
                  className="w-full"
                >
                  {isSaving ? "Speichert..." : "Änderungen speichern"}
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-muted max-h-[500px] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {artifact.content}
                </pre>
              </div>
            )}
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
