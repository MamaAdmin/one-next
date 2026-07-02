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
import { ArrowLeft, Play, Check, ChevronRight, Zap, Circle, CheckCircle2, XCircle, Loader2, Home, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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
  business_analyst: { 
    icon: AnalystIcon, 
    label: 'Business Analyst', 
    color: 'text-primary',
    description: "Requirements-Analyse, Stakeholder-Interviews",
    output: "Requirements-Dokument"
  },
  product_manager: { 
    icon: ManagerIcon, 
    label: 'Product Manager', 
    color: 'text-primary',
    description: "Product Vision, Roadmap & KPIs",
    output: "Product Vision Document"
  },
  ux_expert: { 
    icon: UXIcon, 
    label: 'UX Expert', 
    color: 'text-primary',
    description: "User Journey, Wireframes, Design System",
    output: "UX Artifacts"
  },
  product_owner: { 
    icon: OwnerIcon, 
    label: 'Product Owner', 
    color: 'text-primary',
    description: "User Stories, Backlog, Acceptance Criteria",
    output: "User Stories & Epics"
  },
  architect: { 
    icon: ArchitectIcon, 
    label: 'Architect', 
    color: 'text-orange-500',
    description: "System-Design, Tech-Stack, Security",
    output: "Architektur-Dokument"
  },
  scrum_master: { 
    icon: ScrumIcon, 
    label: 'Scrum Master', 
    color: 'text-primary',
    description: "Sprint Planning, Story Refinement",
    output: "Sprint Plan"
  },
  developer: { 
    icon: DeveloperIcon, 
    label: 'Developer', 
    color: 'text-green-500',
    description: "Implementierung, Code-Struktur",
    output: "Lauffähiger Code"
  },
  qa_tester: { 
    icon: QAIcon, 
    label: 'QA Tester', 
    color: 'text-red-500',
    description: "Test Strategy, E2E Tests, Quality Assurance",
    output: "Test Plans & Cases"
  },
  orchestrator: { 
    icon: OrchestratorIcon, 
    label: 'Orchestrator', 
    color: 'text-yellow-500',
    description: "Cross-Phase Coordination, Risk Management",
    output: "Orchestration Report"
  }
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
  const queryClient = useQueryClient();
  const { session, isLoading: sessionLoading } = useBMADSession(sessionId!);
  const { artifacts, isLoading: artifactsLoading } = useBMADArtifacts(sessionId);
  const { totalTokens } = useBMADConversations(sessionId!);
  const [runningPhase, setRunningPhase] = useState(false);
  const [progressingPhase, setProgressingPhase] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [runningAllPhases, setRunningAllPhases] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingContext, setIsEditingContext] = useState(false);
  const [editedContext, setEditedContext] = useState("");
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editedSettings, setEditedSettings] = useState<{
    ai_model: string;
    auto_progress: boolean;
    require_approval: boolean;
  }>({
    ai_model: 'google/gemini-2.5-flash',
    auto_progress: false,
    require_approval: false
  });
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
        queryClient.invalidateQueries({ queryKey: ["bmad-session", sessionId] });
        const metadata = (payload.new as any)?.metadata;
        if (metadata?.phase_progress) {
          setPhaseProgress(metadata.phase_progress);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bmad_artifacts',
        filter: `session_id=eq.${sessionId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["bmad-artifacts", sessionId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

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
      const { error } = await supabase.functions.invoke('bmad-run-phase', {
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

  const handleSelectPhase = async (selectedPhase: string) => {
    try {
      const { error } = await supabase
        .from('bmad_sessions')
        .update({ current_phase: selectedPhase })
        .eq('id', sessionId ?? '');

      if (error) throw error;

      toast.success(`Phase gewechselt zu: ${PHASE_NAMES[selectedPhase as keyof typeof PHASE_NAMES]}`);
      queryClient.invalidateQueries({ queryKey: ["bmad-session", sessionId] });
    } catch (error) {
      console.error("Error selecting phase:", error);
      toast.error("Fehler beim Wechseln der Phase");
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

  const { mutate: updateSessionDetails } = useMutation({
    mutationFn: async (updates: { 
      title?: string; 
      description?: string;
      project_context?: string;
      settings?: any;
    }) => {
      const { error } = await supabase
        .from("bmad_sessions")
        .update(updates)
        .eq("id", sessionId ?? "");
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bmad-session", sessionId] });
      toast.success("Session aktualisiert");
      setIsEditingTitle(false);
      setIsEditingDescription(false);
      setIsEditingContext(false);
      setIsEditingSettings(false);
    },
    onError: (error) => {
      toast.error("Fehler beim Aktualisieren");
      console.error(error);
    },
  });

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
      
      <main className="flex-1 container mx-auto px-4 pt-[140px] py-8">
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
                <div className="space-y-1 flex-1">
                  {!isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl">{session.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditedTitle(session.title);
                          setIsEditingTitle(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => updateSessionDetails({ title: editedTitle })}
                      >
                        Speichern
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingTitle(false)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  )}
                  
                  {!isEditingDescription ? (
                    <div className="flex items-center gap-2">
                      <CardDescription>{session.description}</CardDescription>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditedDescription(session.description || "");
                          setIsEditingDescription(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => updateSessionDetails({ description: editedDescription })}
                      >
                        Speichern
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingDescription(false)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  )}
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
                {!isEditingContext ? (
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1">
                      {session.project_context}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditedContext(session.project_context || "");
                        setIsEditingContext(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={editedContext}
                      onChange={(e) => setEditedContext(e.target.value)}
                      className="min-h-[120px]"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateSessionDetails({ project_context: editedContext })}
                      >
                        Speichern
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingContext(false)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Einstellungen</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditedSettings({
                        ai_model: session.settings?.ai_model || 'google/gemini-2.5-flash',
                        auto_progress: session.settings?.auto_progress || false,
                        require_approval: session.settings?.require_approval || false
                      });
                      setIsEditingSettings(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {!isEditingSettings ? (
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
                ) : (
                  <div className="space-y-4">
                    {/* AI Model Select */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">AI Model</label>
                      <Select
                        value={editedSettings.ai_model}
                        onValueChange={(value) => setEditedSettings({ ...editedSettings, ai_model: value })}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                          <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                          <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                          <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                          <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
                          <SelectItem value="openai/gpt-5-nano">GPT-5 Nano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Auto Progress Switch */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Auto Progress</label>
                        <p className="text-xs text-muted-foreground">Automatisch zur nächsten Phase</p>
                      </div>
                      <Switch
                        checked={editedSettings.auto_progress}
                        onCheckedChange={(checked) => setEditedSettings({ ...editedSettings, auto_progress: checked })}
                      />
                    </div>

                    {/* Require Approval Switch */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Approval erforderlich</label>
                        <p className="text-xs text-muted-foreground">Artifacts müssen genehmigt werden</p>
                      </div>
                      <Switch
                        checked={editedSettings.require_approval}
                        onCheckedChange={(checked) => setEditedSettings({ ...editedSettings, require_approval: checked })}
                      />
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          updateSessionDetails({
                            settings: {
                              ...session.settings,
                              ...editedSettings
                            }
                          });
                        }}
                      >
                        Speichern
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingSettings(false)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                )}
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
                <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
                  <div className="flex gap-4 items-start flex-1">
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const config = PHASE_CONFIG[session.current_phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.business_analyst;
                        const PhaseIcon = config.icon;
                        return <PhaseIcon className="h-8 w-8" />;
                      })()}
                    </div>
                    
                    {/* Phase Details */}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Current Phase</p>
                      <p className="text-2xl font-bold mb-2">
                        {(() => {
                          const phaseNum = Object.keys(PHASE_CONFIG).indexOf(session.current_phase) + 1;
                          return `${phaseNum}. ${PHASE_NAMES[session.current_phase as keyof typeof PHASE_NAMES]}`;
                        })()}
                      </p>
                      
                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-2">
                        {(() => {
                          const config = PHASE_CONFIG[session.current_phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.business_analyst;
                          return config.description;
                        })()}
                      </p>
                      
                      {/* Output */}
                      <p className="text-xs text-muted-foreground">
                        <strong>Output:</strong> {(() => {
                          const config = PHASE_CONFIG[session.current_phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.business_analyst;
                          return config.output;
                        })()}
                      </p>
                    </div>
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
                    disabled={runningPhase || runningAllPhases}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {runningPhase ? 'Läuft...' : hasCurrentPhaseArtifact ? 'Phase erneut ausführen' : 'Phase ausführen'}
                  </Button>

                  <Button 
                    onClick={handleProgressPhase} 
                    disabled={progressingPhase || runningAllPhases || session.current_phase === 'orchestrator'}
                    variant="outline"
                    className="flex-1"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    {progressingPhase ? 'Fortschritt...' : 'Nächste Phase'}
                  </Button>
                </div>

                {session.settings?.require_approval && !canProgress && hasCurrentPhaseArtifact && (
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200">
                    ⚠️ Artifact muss zuerst genehmigt werden, bevor zur nächsten Phase fortgeschritten werden kann.
                  </div>
                )}

                {Object.keys(phaseProgress).length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Phase Progress (anklickbar)</p>
                    {Object.entries(phaseProgress).map(([phase, status]) => {
                      const isCurrentPhase = session.current_phase === phase;
                      return (
                        <button
                          key={phase}
                          onClick={() => handleSelectPhase(phase)}
                          disabled={runningPhase || runningAllPhases}
                          className={`flex items-center gap-3 w-full p-2 rounded hover:bg-accent/50 transition-colors ${
                            isCurrentPhase ? 'bg-primary/10 border-2 border-primary' : ''
                          }`}
                        >
                          {status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : status === 'running' ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : status === 'error' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className={`text-sm ${isCurrentPhase ? 'font-bold' : ''}`}>
                            {PHASE_NAMES[phase as keyof typeof PHASE_NAMES]}
                          </span>
                          {isCurrentPhase && (
                            <Badge variant="default" className="ml-auto">Aktiv</Badge>
                          )}
                        </button>
                      );
                    })}
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
                <div className="space-y-6">
                  {Object.keys(PHASE_CONFIG).map(phase => {
                    const phaseArtifacts = artifacts.filter(a => a.agent_type === phase);
                    if (phaseArtifacts.length === 0) return null;

                    return (
                      <div key={phase} className="space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                          {getAgentIcon(phase)}
                          <h3 className="font-semibold text-lg">
                            {PHASE_NAMES[phase as keyof typeof PHASE_NAMES]} ({phaseArtifacts.length})
                          </h3>
                        </div>

                        <div className="space-y-2 pl-7">
                          {phaseArtifacts.map((artifact) => (
                            <Card key={artifact.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                              <CardHeader className="py-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-base">{artifact.title}</CardTitle>
                                    <CardDescription>
                                      Version {artifact.version} • {artifact.artifact_type}
                                    </CardDescription>
                                  </div>
                                  <div className="flex gap-2">
                                    {artifact.is_approved === true ? (
                                      <Badge className="bg-green-500">
                                        <Check className="h-3 w-3 mr-1" />
                                        Genehmigt
                                      </Badge>
                                    ) : artifact.is_approved === false ? (
                                      <Badge className="bg-red-500">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Abgelehnt
                                      </Badge>
                                    ) : session.settings?.require_approval ? (
                                      <Badge variant="outline" className="bg-yellow-500/10">
                                        Ausstehend
                                      </Badge>
                                    ) : null}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="flex gap-2 py-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedArtifact(artifact)}
                                >
                                  Vorschau & Genehmigen
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["bmad-artifacts", sessionId] });
            queryClient.invalidateQueries({ queryKey: ["bmad-session", sessionId] });
          }}
        />
      )}
    </div>
  );
}
