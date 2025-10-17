import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, Layers, Code } from "lucide-react";

export const BMADInfo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>BMAD - Breakthrough Method for Agile AI-Driven Development</CardTitle>
        <CardDescription>
          Ein 4-Phasen-Prozess mit AI-Agenten für strukturierte Softwareentwicklung
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3 p-4 rounded-lg border bg-card">
            <Brain className="w-8 h-8 text-purple-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">1. Business Analyst</h4>
              <p className="text-sm text-muted-foreground">
                Requirements-Analyse, Stakeholder-Interviews simulieren
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generiert: Requirements-Dokument
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-lg border bg-card">
            <Users className="w-8 h-8 text-blue-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">2. Manager</h4>
              <p className="text-sm text-muted-foreground">
                Projektplanung, Ressourcen-Schätzung
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generiert: Projekt-Plan
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-lg border bg-card">
            <Layers className="w-8 h-8 text-orange-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">3. Architect</h4>
              <p className="text-sm text-muted-foreground">
                System-Design, Technologie-Stack-Entscheidungen
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generiert: Architektur-Dokument
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-lg border bg-card">
            <Code className="w-8 h-8 text-green-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">4. Developer</h4>
              <p className="text-sm text-muted-foreground">
                Code-Implementierung, Testing & Deployment
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generiert: Lauffähiger Code
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-muted">
          <p className="text-sm">
            <strong>Workflow:</strong> Jede Phase generiert Artifacts, die vom Team approved
            werden können. Der AI-gesteuerte Prozess ermöglicht es, strukturiert von der
            Anforderungsanalyse bis zur Implementierung zu arbeiten.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
