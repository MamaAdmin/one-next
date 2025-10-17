import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface VideoSectionProps {
  onContinue: () => void;
}

export const VideoSection = ({ onContinue }: VideoSectionProps) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">So funktioniert der Online Design Sprint</h1>
        <p className="text-muted-foreground">
          Sehen Sie in 2 Minuten, wie der Sprint abläuft und welche Ergebnisse Sie erhalten.
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Video Placeholder */}
        <div className="aspect-video bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Video wird hier eingebettet
              <br />
              <span className="text-sm">(YouTube/Vimeo Link einfügen)</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-accent/50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Was Sie im Sprint lernen</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Tag 1-2: Verstehen & Definieren</h3>
            <p className="text-sm text-muted-foreground">
              Challenge klären, Ziele definieren, Expertenwissen sammeln
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Tag 3-4: Ideenfindung & Lösungen</h3>
            <p className="text-sm text-muted-foreground">
              Kreative Lösungsansätze entwickeln, beste Ideen auswählen
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Tag 5: Prototyping</h3>
            <p className="text-sm text-muted-foreground">
              Realistische Prototypen erstellen, die getestet werden können
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Tag 6: Testen & Validieren</h3>
            <p className="text-sm text-muted-foreground">
              Prototypen mit echten Nutzern testen, Feedback sammeln
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={onContinue}>
          Zum Buchungsformular (unverbindlich)
        </Button>
      </div>
    </div>
  );
};
