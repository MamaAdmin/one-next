import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useArtifacts } from "@/hooks/useArtifacts";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoiceBotDialog } from "@/components/VoiceBotDialog";

interface UserTestingFormProps {
  enrollmentId: string;
  moduleId: string;
  onSubmit?: (data: any) => void;
}

interface Hypothesis {
  id: string;
  text: string;
  validated: boolean;
  notes: string;
}

export const UserTestingForm = ({
  enrollmentId,
  moduleId,
  onSubmit,
}: UserTestingFormProps) => {
  const [interviewee, setInterviewee] = useState("");
  const [duration, setDuration] = useState("");
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([
    { id: "1", text: "", validated: false, notes: "" },
  ]);
  const [observations, setObservations] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { uploadArtifact } = useArtifacts(enrollmentId, moduleId);
  const { toast } = useToast();

  const addHypothesis = () => {
    setHypotheses([
      ...hypotheses,
      { id: Date.now().toString(), text: "", validated: false, notes: "" },
    ]);
  };

  const updateHypothesis = (
    id: string,
    field: keyof Hypothesis,
    value: any
  ) => {
    setHypotheses(
      hypotheses.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!interviewee || !duration) {
      toast({
        title: "Fehler",
        description: "Bitte alle Pflichtfelder ausfüllen",
        variant: "destructive",
      });
      return;
    }

    const protocolData = {
      interviewee,
      duration,
      hypotheses: hypotheses.filter((h) => h.text),
      observations,
    };

    // Upload recording if exists
    if (uploadedFile) {
      try {
        await uploadArtifact(
          uploadedFile,
          moduleId,
          `Interview Recording: ${interviewee}`
        );
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    onSubmit?.(protocolData);

    toast({
      title: "Erfolg",
      description: "Interview-Protokoll gespeichert",
    });

    // Reset form
    setInterviewee("");
    setDuration("");
    setHypotheses([{ id: "1", text: "", validated: false, notes: "" }]);
    setObservations("");
    setUploadedFile(null);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Interview-Protokoll</h3>

      <div className="mb-6 p-4 bg-accent/50 rounded-lg border border-border">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-1">
            <h4 className="font-medium mb-2">🎤 Interview-Assistent</h4>
            <p className="text-sm text-muted-foreground mb-3 sm:mb-0">
              Nutze den Voice Bot für Sprachnotizen während des Interviews. 
              Du kannst dem Assistenten Fragen stellen oder Beobachtungen diktieren.
            </p>
          </div>
          <VoiceBotDialog 
            buttonText="Voice Assistant starten"
            buttonSize="default"
            buttonClassName="bg-gradient-primary hover:opacity-90 shrink-0 w-full sm:w-auto"
            voiceBotUrl="https://one-next.lovable.app/voice-bot"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="interviewee">Interviewpartner*</Label>
          <Input
            id="interviewee"
            value={interviewee}
            onChange={(e) => setInterviewee(e.target.value)}
            placeholder="Name oder Pseudonym"
          />
        </div>

        <div>
          <Label htmlFor="duration">Dauer (Minuten)*</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="z.B. 30"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Hypothesen</Label>
            <Button variant="outline" size="sm" onClick={addHypothesis}>
              + Hypothese
            </Button>
          </div>

          <div className="space-y-4">
            {hypotheses.map((hypothesis) => (
              <Card key={hypothesis.id} className="p-4 space-y-3">
                <Input
                  value={hypothesis.text}
                  onChange={(e) =>
                    updateHypothesis(hypothesis.id, "text", e.target.value)
                  }
                  placeholder="Hypothese beschreiben..."
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={hypothesis.validated}
                    onCheckedChange={(checked) =>
                      updateHypothesis(hypothesis.id, "validated", checked)
                    }
                  />
                  <Label className="text-sm">
                    {hypothesis.validated ? "✓ Bestätigt" : "Nicht bestätigt"}
                  </Label>
                </div>

                <Textarea
                  value={hypothesis.notes}
                  onChange={(e) =>
                    updateHypothesis(hypothesis.id, "notes", e.target.value)
                  }
                  placeholder="Notizen zur Hypothese..."
                  rows={2}
                />
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="observations">Weitere Beobachtungen</Label>
          <Textarea
            id="observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Wichtige Erkenntnisse, Zitate, etc."
            rows={4}
          />
        </div>

        <div>
          <Label>Interview-Aufzeichnung (optional)</Label>
          <div className="mt-2">
            <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-4 hover:bg-accent transition-colors">
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-5 w-5" />
              <span className="text-sm">
                {uploadedFile ? (
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {uploadedFile.name}
                  </span>
                ) : (
                  "Audio/Video hochladen"
                )}
              </span>
            </label>
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Protokoll speichern
        </Button>
      </div>
    </Card>
  );
};
