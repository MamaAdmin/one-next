import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2 } from "lucide-react";

interface PaymentSectionProps {
  onInitiatePayment: () => void;
  isLoading: boolean;
  sprintType: string;
}

export const PaymentSection = ({
  onInitiatePayment,
  isLoading,
  sprintType,
}: PaymentSectionProps) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Zahlung & Bestätigung</h1>
        <p className="text-muted-foreground">
          Schließen Sie Ihre Buchung mit einer sicheren Zahlung über Stripe ab.
        </p>
      </div>

      <div className="bg-card p-8 rounded-lg shadow-lg mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Ihre Buchung</h2>
          <p className="text-muted-foreground">{sprintType}</p>
        </div>

        <div className="bg-primary/10 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg">Online Design Sprint</span>
            <span className="text-2xl font-bold">999 CHF</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Inkl. 6-tägiger Sprint, Vorlagen, automatischer Report
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Strukturierter 6-Tages-Prozess</span>
          </div>
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Alle Sprint-Vorlagen und Tools</span>
          </div>
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Automatischer PDF-Report mit Ergebnissen</span>
          </div>
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Team-Kollaboration-Features</span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={onInitiatePayment}
          disabled={isLoading}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {isLoading ? "Weiterleitung..." : "Jetzt zahlen (999 CHF)"}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Sichere Zahlung über Stripe. Sie werden zur Checkout-Seite weitergeleitet.
        </p>
      </div>

      <div className="bg-accent/50 p-4 rounded-lg text-sm text-muted-foreground">
        <p className="font-semibold mb-2">Nach erfolgreicher Zahlung:</p>
        <ul className="space-y-1 ml-4">
          <li>✓ Bestätigungs-E-Mail mit Zugangslink</li>
          <li>✓ Sofortiger Zugriff auf Sprint-Dashboard</li>
          <li>✓ Team-Mitglieder einladen</li>
          <li>✓ Sprint-Materialien herunterladen</li>
        </ul>
      </div>
    </div>
  );
};
