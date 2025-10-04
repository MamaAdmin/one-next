import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResultRecommendationProps {
  score: number;
  sprintType: string;
  gatesOk: boolean;
  onContinue: () => void;
  onViewVideo: () => void;
}

export const ResultRecommendation = ({
  score,
  sprintType,
  gatesOk,
  onContinue,
  onViewVideo,
}: ResultRecommendationProps) => {
  const isSuitable = score >= 60;
  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-orange-600";

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
          {isSuitable ? "Ihr Thema ist sprint-tauglich!" : "Wir empfehlen eine Vorbereitung"}
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
              {score >= 60 && sprintType === "Design Sprint Workshop (Mit AI)" && (
                <>
                  Ihre Challenge ist klar, strategisch relevant und sprint-ready. Ein{" "}
                  <strong>Design Sprint Workshop (Mit AI)</strong> hilft Ihnen, innovative Lösungen 
                  zu entwickeln, Prototypen zu erstellen und mit echten Nutzern zu testen – begleitet 
                  von KI-gestützten Tools und erfahrenen Facilitators.
                </>
              )}
              {score >= 60 && sprintType === "Online Design Sprint" && (
                <>
                  Ihre Challenge eignet sich perfekt für einen <strong>Online Design Sprint</strong>. 
                  Optimieren Sie interne Prozesse oder Kundenerlebnisse flexibel und selbstgeführt – 
                  mit digitalen Tools, die Sie durch den gesamten Sprint-Prozess begleiten.
                </>
              )}
              {score >= 40 && score < 60 && (
                <>
                  Ihre Challenge benötigt noch Vorbereitung. Ein <strong>Pre-Sprint</strong> hilft
                  Ihnen, die nötigen Voraussetzungen (Entscheider, Nutzer, Testbarkeit) zu schaffen.
                </>
              )}
              {score < 40 && (
                <>
                  Wir empfehlen zunächst einen <strong>Problem-Framing-Workshop</strong>, um die
                  Challenge zu schärfen und die richtigen Zielgruppen zu identifizieren. So stellen 
                  Sie sicher, dass Ihr nachfolgender Design Sprint auf einem soliden Fundament steht.
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

      {!gatesOk && score >= 60 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-900 mb-2">
            Fast geschafft! Bitte sichern Sie:
          </h3>
          <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
            <li>Entscheider:in für Tag 3</li>
            <li>Zugang zu ≥ 5 Nutzer:innen</li>
            <li>Testbarkeit in 5 Tagen</li>
          </ul>
          <p className="text-sm text-amber-700 mt-2">
            Wir unterstützen Sie beim <strong>Pre-Sprint Setup</strong>.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" size="lg" onClick={onViewVideo}>
          2-Minuten-Video ansehen
        </Button>
        
        {score >= 60 && gatesOk && sprintType === "Design Sprint Workshop (Mit AI)" && (
          <>
            <Button size="lg" onClick={onContinue}>
              Workshop buchen
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/ai-design-sprint">Mehr zum Workshop</a>
            </Button>
          </>
        )}
        
        {score >= 60 && gatesOk && sprintType === "Online Design Sprint" && (
          <>
            <Button size="lg" onClick={onContinue}>
              Online Sprint starten
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/ai-design-sprint/online">Mehr zum Online Sprint</a>
            </Button>
          </>
        )}
        
        {score >= 60 && !gatesOk && (
          <Button size="lg" onClick={onContinue}>
            Pre-Sprint Setup vereinbaren
          </Button>
        )}
        
        {score < 60 && (
          <>
            <Button size="lg" onClick={onContinue}>
              Problem-Framing anfragen
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/problem-framing-workshop">Mehr zum Workshop</a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
