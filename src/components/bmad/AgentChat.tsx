import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, FastForward, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface AgentChatProps {
  sessionId: string;
  currentPhase: string;
  conversations: any[];
  artifacts: any[];
  runAgent: (agentType: string, userInput?: string, autoProgress?: boolean) => Promise<any>;
  isRunning: boolean;
}

export function AgentChat({ sessionId, currentPhase, conversations, artifacts, runAgent, isRunning }: AgentChatProps) {
  const [userInput, setUserInput] = useState("");

  const handleRun = async (autoProgress: boolean = false) => {
    await runAgent(currentPhase, userInput || undefined, autoProgress);
    setUserInput("");
  };

  const agentName = currentPhase.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const previousArtifacts = artifacts.filter(a => {
    const agentOrder = ['business_analyst', 'product_manager', 'ux_expert', 'product_owner', 'architect', 'scrum_master'];
    const currentIndex = agentOrder.indexOf(currentPhase);
    const artifactIndex = agentOrder.indexOf(a.agent_type);
    return artifactIndex < currentIndex;
  });

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{agentName}</CardTitle>
          <Badge>{currentPhase.replace(/_/g, ' ')}</Badge>
        </div>
        {previousArtifacts.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Verfügbare Inputs: {previousArtifacts.map(a => a.agent_type.replace(/_/g, ' ')).join(', ')}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Noch keine Konversation gestartet.</p>
                <p className="text-sm mt-2">Klicken Sie "Agent ausführen", um zu beginnen.</p>
              </div>
            ) : (
              conversations.map((conv, idx) => (
                <div
                  key={conv.id}
                  className={cn(
                    "p-4 rounded-lg",
                    conv.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                  )}
                >
                  <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase">
                    {conv.role === "user" ? "Admin" : agentName}
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{conv.content}</ReactMarkdown>
                  </div>
                  {conv.completion_tokens && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Tokens: {conv.completion_tokens}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3 border-t pt-4">
          <Textarea
            placeholder="Optional: Zusätzliche Anweisungen oder Präzisierungen für den Agenten..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={3}
            disabled={isRunning}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => handleRun(false)}
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agent läuft...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Agent ausführen
                </>
              )}
            </Button>
            <Button
              onClick={() => handleRun(true)}
              disabled={isRunning}
              variant="outline"
            >
              <FastForward className="mr-2 h-4 w-4" />
              Auto-Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
