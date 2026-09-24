import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, AlertCircle, HelpCircle, Play, ChevronDown } from "lucide-react";
import { TeamRoleGrid } from "@/components/sprint/TeamRoleGrid";
import { useSprintMembers } from "@/hooks/useSprintTeam";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { useVideoSlot } from "@/hooks/useVideoLibrary";

interface Props {
  sprintId: string | null | undefined;
  onContinue: () => void;
}

const COLLAPSE_TRIGGER =
  "group/intro w-full flex items-center gap-3 rounded-lg border bg-background p-4 font-semibold text-left transition-colors hover:bg-muted/60 [&[data-state=open]]:border-primary/40";
const COLLAPSE_BADGE =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary transition-all duration-200 group-hover/intro:bg-primary/20 [[data-state=open]_&]:rotate-180";

function TeamVideo() {
  const { data: slotVideo } = useVideoSlot("framing_team");
  return (
    <Collapsible>
      <CollapsibleTrigger className={COLLAPSE_TRIGGER}>
        <Play className="w-4 h-4 shrink-0" />
        <span className="flex-1">So arbeitest du mit dem Tool</span>
        <span className={COLLAPSE_BADGE}><ChevronDown className="w-4 h-4" /></span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-lg border bg-background p-4">
          <VideoPlayer url={slotVideo?.video_url || ""} title="So arbeitest du mit dem Tool" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
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
    <div className="space-y-6 workshop-type">
      <Card className="border-none shadow-xl">
        <CardContent className="p-6 lg:p-8 space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              <Users className="w-3 h-3 mr-1" /> Schritt 0 · Team-Konstellation
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">Wer macht mit?</h2>
            <p className="text-base text-muted-foreground mt-2">
              Als <strong>Moderator</strong> stellst du dein Team zusammen und lädst per E-Mail ein.
              Ein <strong>Decider</strong> wird empfohlen, damit der Sprint verbindlich bleibt. Eine
              Person kann mehrere Rollen halten – trage sie dann für jede Rolle einzeln ein.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Steht dein Team noch nicht komplett? Du kannst jederzeit später zurückkehren und
              Rollen ergänzen — beim Sprint-Start (Kickoff) wird die Team-Konstellation nochmal
              abgefragt, falls sie leer ist.
            </p>
          </div>

          {/* Erklärung – aufgeklappt */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className={COLLAPSE_TRIGGER}>
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">Erklärung</span>
              <span className={COLLAPSE_BADGE}><ChevronDown className="w-4 h-4" /></span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-lg border bg-background p-4 space-y-3 text-sm text-foreground/80 leading-relaxed">
                <p>
                  Trage hier ein, wer am Problem Framing teilnimmt, und weise jeder Person eine
                  Rolle zu. Neue Teammitglieder lädst du direkt per E-Mail ein — sie erhalten
                  einen Zugang zum Workshop.
                </p>
                <p>
                  Die richtigen Perspektiven entscheiden über die Qualität des Framings: Der
                  Decider sorgt für verbindliche Entscheidungen, Fachexpert:innen liefern das
                  nötige Hintergrundwissen.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Video – eingeklappt */}
          <TeamVideo />

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
            className=""
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
