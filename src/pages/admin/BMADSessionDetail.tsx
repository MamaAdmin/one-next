import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useBMADSession } from "@/hooks/useBMADSession";
import { AgentPipeline } from "@/components/bmad/AgentPipeline";
import { AgentChat } from "@/components/bmad/AgentChat";
import { ArtifactViewer } from "@/components/bmad/ArtifactViewer";
import { DevelopmentPhase } from "@/components/bmad/DevelopmentPhase";

export default function BMADSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, artifacts, conversations, loading, isRunning, runAgent, generateStoryFiles, flattenRepo, refresh } = useBMADSession(sessionId);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <p className="text-center text-muted-foreground">Lade Session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-6 py-8">
        <p className="text-center text-destructive">Session nicht gefunden</p>
      </div>
    );
  }

  const isDevPhase = session.status === 'development' || session.status === 'completed';

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/bmad")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{session.title}</h1>
              {session.description && (
                <p className="text-sm text-muted-foreground">{session.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold capitalize">{session.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {isDevPhase ? (
          <DevelopmentPhase
            session={session}
            artifacts={artifacts}
            generateStoryFiles={generateStoryFiles}
            flattenRepo={flattenRepo}
            isRunning={isRunning}
            refresh={refresh}
          />
        ) : (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <AgentPipeline
                currentPhase={session.current_phase}
                artifacts={artifacts}
              />
            </div>

            <div className="lg:col-span-6">
              <AgentChat
                sessionId={session.id}
                currentPhase={session.current_phase}
                conversations={conversations.filter(c => c.agent_type === session.current_phase)}
                artifacts={artifacts}
                runAgent={runAgent}
                isRunning={isRunning}
              />
            </div>

            <div className="lg:col-span-3">
              <ArtifactViewer
                artifacts={artifacts}
                onRefresh={refresh}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
