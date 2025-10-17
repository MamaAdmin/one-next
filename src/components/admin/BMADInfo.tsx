import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AnalystIcon, 
  ManagerIcon, 
  UXIcon, 
  OwnerIcon, 
  ArchitectIcon, 
  ScrumIcon, 
  DeveloperIcon, 
  QAIcon, 
  OrchestratorIcon 
} from "@/components/ui/custom-icons";

export const BMADInfo = () => {
  const phases = [
    { 
      name: "Business Analyst", 
      icon: AnalystIcon, 
      description: "Requirements-Analyse, Stakeholder-Interviews", 
      output: "Requirements-Dokument",
      color: "text-blue-500" 
    },
    { 
      name: "Product Manager", 
      icon: ManagerIcon, 
      description: "Product Vision, Roadmap & KPIs", 
      output: "Product Vision Document",
      color: "text-purple-500" 
    },
    { 
      name: "UX Expert", 
      icon: UXIcon, 
      description: "User Journey, Wireframes, Design System", 
      output: "UX Artifacts",
      color: "text-pink-500" 
    },
    { 
      name: "Product Owner", 
      icon: OwnerIcon, 
      description: "User Stories, Backlog, Acceptance Criteria", 
      output: "User Stories & Epics",
      color: "text-indigo-500" 
    },
    { 
      name: "Architect", 
      icon: ArchitectIcon, 
      description: "System-Design, Tech-Stack, Security", 
      output: "Architektur-Dokument",
      color: "text-orange-500" 
    },
    { 
      name: "Scrum Master", 
      icon: ScrumIcon, 
      description: "Sprint Planning, Story Refinement", 
      output: "Sprint Plan",
      color: "text-teal-500" 
    },
    { 
      name: "Developer", 
      icon: DeveloperIcon, 
      description: "Implementierung, Code-Struktur", 
      output: "Lauffähiger Code",
      color: "text-green-500" 
    },
    { 
      name: "QA Tester", 
      icon: QAIcon, 
      description: "Test Strategy, E2E Tests, Quality Assurance", 
      output: "Test Plans & Cases",
      color: "text-red-500" 
    },
    { 
      name: "Orchestrator", 
      icon: OrchestratorIcon, 
      description: "Cross-Phase Coordination, Risk Management", 
      output: "Orchestration Report",
      color: "text-yellow-500" 
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>BMAD - Breakthrough Method for Agile AI-Driven Development</CardTitle>
        <CardDescription>
          Ein 9-Phasen-Prozess mit spezialisierten AI-Agenten für strukturierte Softwareentwicklung
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <div key={index} className="flex gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <Icon className={`w-12 h-12 ${phase.color} flex-shrink-0`} />
                <div>
                  <h4 className="font-semibold mb-1">{index + 1}. {phase.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {phase.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Output:</strong> {phase.output}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-4 rounded-lg bg-muted">
          <p className="text-sm">
            <strong>Workflow:</strong> Jede Phase generiert spezifische Artifacts, die vom Team approved
            werden können. Der AI-gesteuerte 9-Phasen-Prozess ermöglicht es, strukturiert von der
            initialen Requirements-Analyse bis zur finalen Orchestration und QA zu arbeiten.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
