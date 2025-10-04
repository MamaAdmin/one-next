import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResultRecommendationProps {
  score: number;
  sprintType: string;
  onContinue: () => void;
  onViewVideo: () => void;
}

export const ResultRecommendation = ({
  score,
  sprintType,
  onContinue,
  onViewVideo,
}: ResultRecommendationProps) => {
  const isSuitable = score >= 50;
  const scoreColor = score >= 75 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 mb-4 ${scoreColor}`}>
          {isSuitable ? (
            <CheckCircle2 className="w-12 h-12" />
          ) : (
            <AlertCircle className="w-12 h-12" />
          )}
          <h1 className="text-4xl font-bold">{score}/100</h1>
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          {isSuitable ? "Ihr Thema ist sprint-tauglich!" : "Ihr Thema benötigt Anpassungen"}
        </h2>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Sprint-Tauglichkeit</h3>
          <Progress value={score} className="h-3" />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Empfehlung</h3>
            <div className="bg-primary/10 p-4 rounded-md">
              <p className="text-xl font-bold text-primary">{sprintType}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Begründung</h3>
            <p className="text-muted-foreground">
              {score >= 75 && (
                <>
                  Ihre Challenge ist klar definiert, strategisch wichtig und betrifft mehrere
                  Stakeholder. Ein Strategy Sprint hilft Ihnen, langfristige Visionen zu
                  entwickeln und fundierte Entscheidungen zu treffen.
                </>
              )}
              {score >= 50 && score < 75 && (
                <>
                  Ihr Thema zeigt gutes Potenzial für einen Design Sprint. Ein Discovery Sprint
                  ermöglicht es Ihnen, Kundenbedürfnisse zu verstehen, Ideen zu validieren und
                  schnell testbare Prototypen zu erstellen.
                </>
              )}
              {score < 50 && (
                <>
                  Ihre Challenge eignet sich am besten für einen Process Sprint, bei dem wir
                  bestehende Abläufe optimieren und schnelle Verbesserungen implementieren können.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-accent/50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Was Sie erwartet</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
            <span>6-tägiger strukturierter Sprint-Prozess</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
            <span>Begleitet oder online selbstgeführt</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
            <span>Testbare Prototypen und klare Entscheidungsgrundlagen</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
            <span>Automatischer PDF-Report mit allen Ergebnissen</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" size="lg" onClick={onViewVideo}>
          2-Minuten-Video ansehen
        </Button>
        <Button size="lg" onClick={onContinue}>
          Unverbindlich fortfahren
        </Button>
      </div>
    </div>
  );
};
