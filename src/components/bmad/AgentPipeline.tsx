import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentPipelineProps {
  currentPhase: string;
  artifacts: any[];
}

const AGENTS = [
  { id: 'business_analyst', name: 'Business Analyst', icon: '📊' },
  { id: 'product_manager', name: 'Product Manager', icon: '🎯' },
  { id: 'ux_expert', name: 'UX Expert', icon: '🎨' },
  { id: 'product_owner', name: 'Product Owner', icon: '📋' },
  { id: 'architect', name: 'Architect', icon: '🏗️' },
  { id: 'scrum_master', name: 'Scrum Master', icon: '🚀' },
];

export function AgentPipeline({ currentPhase, artifacts }: AgentPipelineProps) {
  const completedAgents = new Set(artifacts.map(a => a.agent_type));
  const currentIndex = AGENTS.findIndex(a => a.id === currentPhase);

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Agent Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {AGENTS.map((agent, index) => {
            const isCompleted = completedAgents.has(agent.id);
            const isCurrent = agent.id === currentPhase;
            const isPending = index > currentIndex;

            return (
              <div
                key={agent.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  isCurrent && "bg-primary/10 border border-primary",
                  isCompleted && !isCurrent && "bg-green-50 dark:bg-green-950/20",
                  isPending && "opacity-50"
                )}
              >
                <span className="text-2xl">{agent.icon}</span>
                <div className="flex-1">
                  <p className={cn(
                    "font-medium text-sm",
                    isCurrent && "text-primary"
                  )}>
                    {agent.name}
                  </p>
                </div>
                <div>
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {isCurrent && !isCompleted && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                  {isPending && <Circle className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
