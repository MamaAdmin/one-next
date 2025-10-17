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
import { ArrowLeft, Play, Check, X, ChevronRight, Zap, Circle, CheckCircle2, XCircle, Loader2, Home } from "lucide-react";
import { useBMADSession } from "@/hooks/useBMADSessions";
import { useBMADArtifacts } from "@/hooks/useBMADArtifacts";
import { useBMADConversations } from "@/hooks/useBMADConversations";
import { BMADArtifactPreviewDialog } from "@/components/admin/BMADArtifactPreviewDialog";
import { BMADBreadcrumb } from "@/components/admin/BMADBreadcrumb";
import { 
  AnalystIcon,
  ManagerIcon,
  UXIcon,
  OwnerIcon,
  ArchitectIcon,
  ScrumIcon,
  DeveloperIcon,
  QAIcon,
  OrchestratorIcon,
  BMADSessionIcon
} from "@/components/ui/custom-icons";

const PHASE_CONFIG = {
  business_analyst: { icon: AnalystIcon, label: 'Business Analyst', color: 'text-blue-500' },
  product_manager: { icon: ManagerIcon, label: 'Product Manager', color: 'text-purple-500' },
  ux_expert: { icon: UXIcon, label: 'UX Expert', color: 'text-pink-500' },
  product_owner: { icon: OwnerIcon, label: 'Product Owner', color: 'text-indigo-500' },
  architect: { icon: ArchitectIcon, label: 'Architect', color: 'text-orange-500' },
  scrum_master: { icon: ScrumIcon, label: 'Scrum Master', color: 'text-teal-500' },
  developer: { icon: DeveloperIcon, label: 'Developer', color: 'text-green-500' },
  qa_tester: { icon: QAIcon, label: 'QA Tester', color: 'text-red-500' },
  orchestrator: { icon: OrchestratorIcon, label: 'Orchestrator', color: 'text-yellow-500' }
};

const getAgentIcon = (phase: string) => {
  const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.business_analyst;
  const IconComponent = config.icon;
  return <IconComponent className="h-5 w-5" />;
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
  product_manager: 'Product Manager',
  ux_expert: 'UX Expert',
  product_owner: 'Product Owner',
  architect: 'Architect',
  scrum_master: 'Scrum Master',
  developer: 'Developer',
  qa_tester: 'QA Tester',
  orchestrator: 'Orchestrator'
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
  const [runningAllPhases, setRunningAllPhases] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState<Record<string, string>>({
    business_analyst: 'pending',
    product_manager: 'pending',
    ux_expert: 'pending',
    product_owner: 'pending',
    architect: 'pending',
    scrum_master: 'pending',
    developer: 'pending',
    qa_tester: 'pending',
    orchestrator: 'pending'
  });

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
      }, (payload) => {
        // Update phase progress from metadata
        const metadata = (payload.new as any)?.metadata;
        if (metadata?.phase_progress) {
          setPhaseProgress(metadata.phase_progress);
        }
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

  // Initialize phase progress from session metadata
  useEffect(() => {
    if (session?.settings?.phase_progress) {
      setPhaseProgress(session.settings.phase_progress);
    }
  }, [session]);

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

  const handleRunAllPhases = async () => {
    if (!sessionId) return;
    
    setRunningAllPhases(true);
    setPhaseProgress({
      business_analyst: 'pending',
      product_manager: 'pending',
      ux_expert: 'pending',
      product_owner: 'pending',
      architect: 'pending',
      scrum_master: 'pending',
      developer: 'pending',
      qa_tester: 'pending',
      orchestrator: 'pending'
    });

    try {
      const { error } = await supabase.functions.invoke("bmad-run-all-phases", {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      toast.success("Alle Phasen erfolgreich abgeschlossen!");
    } catch (error) {
      console.error("Error running all phases:", error);
      toast.error("Fehler beim Durchlaufen aller Phasen");
    } finally {
      setRunningAllPhases(false);
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
      <BMADBreadcrumb
        items={[
          { label: "Admin", href: "/admin?tab=bmad", icon: <Home className="w-5 h-5" /> },
          { label: "BMAD Sessions", href: "/admin/bmad/sessions", icon: <BMADSessionIcon className="w-5 h-5" /> },
          { label: session.title, active: true }
        ]}
      />
      
      <main className="flex-1 container mx-auto px-4 pt-32 py-8">
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
                <CardTitle className="flex items-center gap-2">
                  <OrchestratorIcon className="h-6 w-6" />
                  Phase Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Current Phase</p>
                    <p className="text-2xl font-bold">{PHASE_NAMES[session.current_phase as keyof typeof PHASE_NAMES]}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    {(() => {
                      const config = PHASE_CONFIG[session.current_phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.business_analyst;
                      const PhaseIcon = config.icon;
                      return <PhaseIcon className="h-8 w-8" />;
                    })()}
                  </div>
                </div>

                <Button
                  onClick={handleRunAllPhases}
                  disabled={runningAllPhases || (session.status as string) === 'completed'}
                  size="lg"
                  className="w-full"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  {runningAllPhases ? 'Läuft alle Phasen durch...' : 'Alle Phasen End-to-End durchlaufen'}
                </Button>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleRunPhase} 
                    disabled={runningPhase || hasCurrentPhaseArtifact || runningAllPhases}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {runningPhase ? 'Läuft...' : 'Phase ausführen'}
                  </Button>

                  {canProgress && (
                    <Button 
                      onClick={handleProgressPhase} 
                      disabled={progressingPhase || runningAllPhases}
                      variant="outline"
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
                      {progressingPhase ? 'Fortschritt...' : 'Nächste Phase'}
                    </Button>
                  )}
                </div>

                {session.settings?.require_approval && (
                  <div className="text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                    Approval erforderlich vor Fortschritt zur nächsten Phase
                  </div>
                )}

                {Object.keys(phaseProgress).length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Phase Progress</p>
                    {Object.entries(phaseProgress).map(([phase, status]) => (
                      <div key={phase} className="flex items-center gap-3">
                        {status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : status === 'running' ? (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        ) : status === 'error' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm">{PHASE_NAMES[phase as keyof typeof PHASE_NAMES]}</span>
                      </div>
                    ))}
                  </div>
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
          onSaved={() => window.location.reload()}
        />
      )}
    </div>
  );
}
