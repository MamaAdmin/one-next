import { useState } from "react";
import { useGDPRConsent } from "@/hooks/useGDPRConsent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface GDPRConsentProps {
  participantId: string;
  onComplete: () => void;
}

export function GDPRConsent({ participantId, onComplete }: GDPRConsentProps) {
  const { grantConsent } = useGDPRConsent(participantId);
  const [consents, setConsents] = useState({
    data_processing: false,
    video_recording: false,
    analytics: false,
  });

  const handleSubmit = async () => {
    for (const [type, granted] of Object.entries(consents)) {
      if (granted) {
        await grantConsent(type);
      }
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datenschutz-Einwilligungen</CardTitle>
          <CardDescription>
            Bitte bestätigen Sie die folgenden Einwilligungen, um fortzufahren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="data_processing"
              checked={consents.data_processing}
              onCheckedChange={(checked) =>
                setConsents({ ...consents, data_processing: checked as boolean })
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="data_processing" className="font-medium">
                Datenverarbeitung
              </Label>
              <p className="text-sm text-muted-foreground">
                Ich stimme der Verarbeitung meiner Daten für die Kursdurchführung zu.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="video_recording"
              checked={consents.video_recording}
              onCheckedChange={(checked) =>
                setConsents({ ...consents, video_recording: checked as boolean })
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="video_recording" className="font-medium">
                Video-Aufnahmen
              </Label>
              <p className="text-sm text-muted-foreground">
                Ich stimme der Aufnahme von Videos für User Testing zu (optional).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="analytics"
              checked={consents.analytics}
              onCheckedChange={(checked) =>
                setConsents({ ...consents, analytics: checked as boolean })
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="analytics" className="font-medium">
                Analytics
              </Label>
              <p className="text-sm text-muted-foreground">
                Ich stimme der anonymisierten Analyse meines Lernverhaltens zu.
              </p>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!consents.data_processing}
            className="w-full"
          >
            Bestätigen und fortfahren
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
