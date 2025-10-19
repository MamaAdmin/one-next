import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowComments } from "./WorkflowComments";
import { Send, CheckCircle, XCircle } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

interface WorkflowPanelProps {
  contentType: string;
  contentId: string;
  currentStatus: string;
  onStatusChange?: () => void;
}

const statusConfig = {
  draft: { label: "Entwurf", color: "secondary" },
  in_review: { label: "In Prüfung", color: "default" },
  approved: { label: "Genehmigt", color: "default" },
  published: { label: "Veröffentlicht", color: "default" },
  archived: { label: "Archiviert", color: "destructive" },
} as const;

export const WorkflowPanel = ({
  contentType,
  contentId,
  currentStatus,
  onStatusChange,
}: WorkflowPanelProps) => {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const updateData: any = { workflow_status: newStatus };
      
      if (newStatus === "approved" || newStatus === "published") {
        updateData.reviewed_by = (await supabase.auth.getUser()).data.user?.id;
        updateData.reviewed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from(contentType as any)
        .update(updateData)
        .eq("id", contentId);

      if (error) throw error;

      setStatus(newStatus);
      toast({
        title: "Erfolg",
        description: "Status erfolgreich aktualisiert",
      });
      
      onStatusChange?.();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const canSubmitForReview = status === "draft";
  const canApprove = isAdmin && status === "in_review";
  const canPublish = isAdmin && status === "approved";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Aktueller Status:</div>
          <Badge variant={statusConfig[status as keyof typeof statusConfig]?.color as any}>
            {statusConfig[status as keyof typeof statusConfig]?.label || status}
          </Badge>
        </div>

        {isAdmin && (
          <div>
            <div className="text-sm font-medium mb-2">Status ändern:</div>
            <Select value={status} onValueChange={updateStatus} disabled={updating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!isAdmin && (
          <div className="space-y-2">
            {canSubmitForReview && (
              <Button
                className="w-full"
                onClick={() => updateStatus("in_review")}
                disabled={updating}
              >
                <Send className="h-4 w-4 mr-2" />
                Zur Prüfung einreichen
              </Button>
            )}
          </div>
        )}

        {isAdmin && (
          <div className="space-y-2">
            {canApprove && (
              <>
                <Button
                  className="w-full"
                  onClick={() => updateStatus("approved")}
                  disabled={updating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Genehmigen
                </Button>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => updateStatus("draft")}
                  disabled={updating}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Ablehnen
                </Button>
              </>
            )}
            
            {canPublish && (
              <Button
                className="w-full"
                onClick={() => updateStatus("published")}
                disabled={updating}
              >
                Veröffentlichen
              </Button>
            )}
          </div>
        )}

        <WorkflowComments contentType={contentType} contentId={contentId} />
      </CardContent>
    </Card>
  );
};
