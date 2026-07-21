import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, AlertCircle } from "lucide-react";
import { TeamRoleGrid } from "@/components/sprint/TeamRoleGrid";
import { useSprintMembers } from "@/hooks/useSprintTeam";

interface Props {
  sprintId: string | null | undefined;
  onContinue: () => void;
}

/**
 * Team-Konstellation als erster Schritt des Problem Framings.
 * Nutzt die bestehende `sprint_members`-Infrastruktur (der zugehörige Sprint
 * wurde beim Anlegen der Framing-Session bereits still vorangelegt und wird im
 * Dashboard erst mit Framing-Abschluss sichtbar).
 */
export default function FramingTeamGate({ sprintId, onContinue }: Props) {
  const membersQ = useSprintMembers(sprintId ?? undefined);
  const members = membersQ.data ?? [];
  const hasModerator = members.some((m) => m.rolle === "moderator");

  if (!sprintId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Team-Konstellation kann nicht geladen werden — kein Sprint-Container verknüpft.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl">
        <CardContent className="p-6 lg:p-8 space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              <Users className="w-3 h-3 mr-1" /> Schritt 0 · Team-Konstellation
            </Badge>
            <h2 className="text-2xl font-bold">Wer macht mit?</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Als <strong>Moderator</strong> stellst du dein Team zusammen und lädst per E-Mail ein.
              Ein <strong>Decider</strong> wird empfohlen, damit der Sprint verbindlich bleibt. Eine
              Person kann mehrere Rollen halten – trage sie dann für jede Rolle einzeln ein.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Steht dein Team noch nicht komplett? Du kannst jederzeit später zurückkehren und
              Rollen ergänzen — beim Sprint-Start (Kickoff) wird die Team-Konstellation nochmal
              abgefragt, falls sie leer ist.
            </p>
          </div>

          <TeamRoleGrid sprintId={sprintId} emphasizeDeciderMissing={false} />
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground max-w-md">
            {hasModerator
              ? "Moderator gesetzt. Ihr könnt jetzt mit dem Problem Framing starten."
              : "Moderator fehlt — bitte Seite neu laden."}
          </p>
          <Button
            className="bg-gradient-primary hover:opacity-90"
            onClick={onContinue}
            disabled={!hasModerator}
          >
            Weiter zum Problem Framing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
