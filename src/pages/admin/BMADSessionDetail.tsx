import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Brain, Users, Layers, Code, Play, Check, X, ChevronRight } from "lucide-react";
import { useBMADSession } from "@/hooks/useBMADSessions";
import { useBMADArtifacts } from "@/hooks/useBMADArtifacts";
import { useBMADConversations } from "@/hooks/useBMADConversations";
import { BMADArtifactPreviewDialog } from "@/components/admin/BMADArtifactPreviewDialog";

const getAgentIcon = (phase: string) => {
  switch (phase) {
    case 'business_analyst': return <Brain className="h-4 w-4" />;
    case 'manager': return <Users className="h-4 w-4" />;
    case 'architect': return <Layers className="h-4 w-4" />;
    case 'developer': return <Code className="h-4 w-4" />;
    default: return <Brain className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'development': return 'bg-blue-500';
    case 'planning': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const PHASE_NAMES = {
  business_analyst: 'Business Analyst',
  manager: 'Manager',
  architect: 'Architect',
  developer: 'Developer'
};

export default function BMADSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading } = useBMADSession(sessionId!);
  const { artifacts, isLoading: artifactsLoading } = useBMADArtifacts(sessionId);
  const { conversations, totalTokens } = useBMADConversations(sessionId!);
  const [runningPhase, setRunningPhase] = useState(false);
  const [progressingPhase, setProgressingPhase] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);

  // Realtime subscription for session updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('bmad-session-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bmad_sessions',
        filter: `id=eq.${sessionId}`
      }, () => {
        // Refetch session data
        window.location.reload();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bmad_artifacts',
        filter: `session_id=eq.${sessionId}`
      }, () => {
        // Refetch artifacts
        window.location.reload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handleRunPhase = async () => {
    if (!session) return;

    setRunningPhase(true);
    try {
      const { data, error } = await supabase.functions.invoke('bmad-run-phase', {
        body: {
          session_id: sessionId,
          agent_type: session.current_phase
        }
      });

      if (error) throw error;

      toast.success(`${PHASE_NAMES[session.current_phase as keyof typeof PHASE_NAMES]} Phase abgeschlossen`);
      
      // Check if auto-progress is enabled
      if (session.settings?.auto_progress) {
        setTimeout(() => handleProgressPhase(), 2000);
      }
    } catch (error) {
      console.error("Error running phase:", error);
      toast.error("Fehler beim Ausführen der Phase");
    } finally {
      setRunningPhase(false);
    }
  };

  const handleProgressPhase = async () => {
    setProgressingPhase(true);
    try {
      const { data, error } = await supabase.functions.invoke('bmad-progress-phase', {
        body: { session_id: sessionId }
      });

      if (error) throw error;

      if (data.completed) {
        toast.success("BMAD Session abgeschlossen!");
      } else {
        toast.success(`Fortschritt zu Phase: ${PHASE_NAMES[data.next_phase as keyof typeof PHASE_NAMES]}`);
      }
    } catch (error) {
      console.error("Error progressing phase:", error);
      toast.error("Fehler beim Fortschreiten zur nächsten Phase");
    } finally {
      setProgressingPhase(false);
    }
  };

  const handleApprove = async (artifactId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('bmad-approve-artifact', {
        body: { artifact_id: artifactId, is_approved: isApproved }
      });

      if (error) throw error;

      toast.success(isApproved ? "Artifact genehmigt" : "Artifact abgelehnt");
    } catch (error) {
      console.error("Error approving artifact:", error);
      toast.error("Fehler beim Genehmigen des Artifacts");
    }
  };

  if (sessionLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <div className="flex items-center justify-center min-h-screen">Session not found</div>;
  }

  const currentPhaseArtifacts = artifacts.filter(a => a.agent_type === session.current_phase);
  const hasCurrentPhaseArtifact = currentPhaseArtifacts.length > 0;
  const canProgress = hasCurrentPhaseArtifact && 
    (!session.settings?.require_approval || currentPhaseArtifacts.some(a => a.is_approved));

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/admin/bmad/sessions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Sessions
        </Button>

        <div className="space-y-6">
          {/* Session Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{session.title}</CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getAgentIcon(session.current_phase)}
                    {PHASE_NAMES[session.current_phase as keyof typeof PHASE_NAMES]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Projekt-Kontext</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {session.project_context}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">AI Model:</span>
                  <p className="font-medium">{session.settings?.ai_model || 'google/gemini-2.5-flash'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Token Usage:</span>
                  <p className="font-medium">
                    {totalTokens.prompt + totalTokens.completion} total
                    <span className="text-xs text-muted-foreground ml-2">
                      ({totalTokens.prompt} prompt + {totalTokens.completion} completion)
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Auto Progress:</span>
                  <p className="font-medium">{session.settings?.auto_progress ? 'Ja' : 'Nein'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Approval erforderlich:</span>
                  <p className="font-medium">{session.settings?.require_approval ? 'Ja' : 'Nein'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase Controls */}
          {session.status !== 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Phase Control</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button 
                  onClick={handleRunPhase} 
                  disabled={runningPhase || hasCurrentPhaseArtifact}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {runningPhase ? 'Läuft...' : `${PHASE_NAMES[session.current_phase as keyof typeof PHASE_NAMES]} Phase ausführen`}
                </Button>

                {canProgress && (
                  <Button 
                    onClick={handleProgressPhase} 
                    disabled={progressingPhase}
                    variant="outline"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    {progressingPhase ? 'Fortschritt...' : 'Nächste Phase'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Artifacts */}
          <Card>
            <CardHeader>
              <CardTitle>Generierte Artifacts ({artifacts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {artifactsLoading ? (
                <p>Loading artifacts...</p>
              ) : artifacts.length === 0 ? (
                <p className="text-muted-foreground">Noch keine Artifacts generiert</p>
              ) : (
                <div className="space-y-4">
                  {artifacts.map((artifact) => (
                    <Card key={artifact.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getAgentIcon(artifact.agent_type)}
                            <div>
                              <CardTitle className="text-base">{artifact.title}</CardTitle>
                              <CardDescription>
                                Version {artifact.version} • {artifact.artifact_type}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {artifact.is_approved ? (
                              <Badge className="bg-green-500">
                                <Check className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            ) : session.settings?.require_approval ? (
                              <Badge variant="outline" className="bg-yellow-500/10">
                                Pending Approval
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedArtifact(artifact)}
                        >
                          Vorschau
                        </Button>
                        
                        {!artifact.is_approved && session.settings?.require_approval && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(artifact.id, true)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Genehmigen
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleApprove(artifact.id, false)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Ablehnen
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {selectedArtifact && (
        <BMADArtifactPreviewDialog
          artifact={selectedArtifact}
          open={!!selectedArtifact}
          onOpenChange={(open) => !open && setSelectedArtifact(null)}
        />
      )}
    </div>
  );
}
