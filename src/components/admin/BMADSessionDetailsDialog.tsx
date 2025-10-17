import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BMADSession } from "@/hooks/useBMADSessions";
import { useBMADArtifacts } from "@/hooks/useBMADArtifacts";
import { Brain, Users, Layers, Code, Calendar, Settings } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface BMADSessionDetailsDialogProps {
  session: BMADSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getAgentIcon = (phase: string) => {
  switch (phase) {
    case "business_analyst":
      return <Brain className="w-4 h-4" />;
    case "manager":
      return <Users className="w-4 h-4" />;
    case "architect":
      return <Layers className="w-4 h-4" />;
    case "developer":
      return <Code className="w-4 h-4" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "development":
      return "bg-blue-500";
    case "planning":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

export const BMADSessionDetailsDialog = ({
  session,
  open,
  onOpenChange,
}: BMADSessionDetailsDialogProps) => {
  const { artifacts, isLoading: artifactsLoading } = useBMADArtifacts(session?.id);

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getAgentIcon(session.current_phase)}
            {session.title}
          </DialogTitle>
          <DialogDescription>Session ID: {session.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Phase */}
          <div className="flex gap-2">
            <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
            <Badge variant="outline">{session.current_phase}</Badge>
          </div>

          {/* Description */}
          {session.description && (
            <div>
              <h4 className="font-semibold mb-2">Beschreibung</h4>
              <p className="text-sm text-muted-foreground">{session.description}</p>
            </div>
          )}

          {/* Project Context */}
          {session.project_context && (
            <div>
              <h4 className="font-semibold mb-2">Projekt-Kontext</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {session.project_context}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Erstellt</div>
                <div className="font-medium">
                  {format(new Date(session.created_at), "PPp", { locale: de })}
                </div>
              </div>
            </div>

            {session.planning_completed_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Planung abgeschlossen</div>
                  <div className="font-medium">
                    {format(new Date(session.planning_completed_at), "PPp", { locale: de })}
                  </div>
                </div>
              </div>
            )}

            {session.development_started_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Entwicklung gestartet</div>
                  <div className="font-medium">
                    {format(new Date(session.development_started_at), "PPp", { locale: de })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          {session.settings && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Einstellungen
              </h4>
              <div className="space-y-1 text-sm">
                {session.settings.ai_model && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Model:</span>
                    <span className="font-medium">{session.settings.ai_model}</span>
                  </div>
                )}
                {session.settings.auto_progress !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto Progress:</span>
                    <span className="font-medium">
                      {session.settings.auto_progress ? "Ja" : "Nein"}
                    </span>
                  </div>
                )}
                {session.settings.require_approval !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Require Approval:</span>
                    <span className="font-medium">
                      {session.settings.require_approval ? "Ja" : "Nein"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Artifacts */}
          <div>
            <h4 className="font-semibold mb-3">
              Generierte Artifacts ({artifacts.length})
            </h4>
            {artifactsLoading ? (
              <div className="text-sm text-muted-foreground">Lade Artifacts...</div>
            ) : artifacts.length === 0 ? (
              <div className="text-sm text-muted-foreground">Keine Artifacts vorhanden</div>
            ) : (
              <div className="space-y-2">
                {artifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getAgentIcon(artifact.agent_type)}
                      <div>
                        <div className="font-medium text-sm">{artifact.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Version {artifact.version} · {artifact.artifact_type}
                        </div>
                      </div>
                    </div>
                    {artifact.is_approved !== null && (
                      <Badge variant={artifact.is_approved ? "default" : "secondary"}>
                        {artifact.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
