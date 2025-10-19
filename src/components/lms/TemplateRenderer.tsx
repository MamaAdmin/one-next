import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HMWGenerator } from "./HMWGenerator";
import { UserTestingForm } from "./UserTestingForm";
import { SmartSailboat } from "./SmartSailboat";

interface TemplateRendererProps {
  data: any;
  enrollmentId?: string;
  moduleId?: string;
}

export function TemplateRenderer({ data, enrollmentId, moduleId }: TemplateRendererProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Keine Template-Daten verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  // Special handling for HMW Generator
  if (data?.type === 'hmw-generator') {
    return <HMWGenerator />;
  }

  // Special handling for Smart Sailboat
  if (data?.type === 'smart-sailboat') {
    return <SmartSailboat />;
  }

  // Special handling for User Testing Form
  if (data?.type === 'user-testing-form') {
    if (!enrollmentId || !moduleId) {
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">Fehler: Enrollment- oder Modul-ID fehlt</p>
          </CardContent>
        </Card>
      );
    }
    return <UserTestingForm enrollmentId={enrollmentId} moduleId={moduleId} />;
  }

  // Simple JSON renderer - can be enhanced based on template structure
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Template</CardTitle>
        <CardDescription>Strukturierte Template-Daten</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.fields && Array.isArray(data.fields) && (
            <div>
              <h4 className="font-medium mb-2">Felder:</h4>
              <ul className="space-y-2">
                {data.fields.map((field: any, index: number) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{field.label || field.name}:</span>{" "}
                    <span className="text-muted-foreground">
                      {field.type || field.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {data.sections && Array.isArray(data.sections) && (
            <div>
              <h4 className="font-medium mb-2">Sektionen:</h4>
              <div className="space-y-3">
                {data.sections.map((section: any, index: number) => (
                  <Card key={index}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">
                        {section.title || `Sektion ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    {section.description && (
                      <CardContent className="py-2">
                        <p className="text-xs text-muted-foreground">
                          {section.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Fallback: Show raw JSON if no structured data */}
          {!data.fields && !data.sections && (
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
