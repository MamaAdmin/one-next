import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useUpdateSprint } from "@/hooks/useSprint";
import type { SprintRow } from "@/features/sprint/types";

interface Props {
  sprint: SprintRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SprintBasicsEditDialog({ sprint, open, onOpenChange }: Props) {
  const update = useUpdateSprint(sprint.id);
  const [titel, setTitel] = useState(sprint.titel);
  const [problemstellung, setProblemstellung] = useState(sprint.problemstellung);
  const [sprintLeader, setSprintLeader] = useState(sprint.sprint_leader ?? "");
  const [decider, setDecider] = useState(sprint.decider ?? "");

  useEffect(() => {
    if (open) {
      setTitel(sprint.titel);
      setProblemstellung(sprint.problemstellung);
      setSprintLeader(sprint.sprint_leader ?? "");
      setDecider(sprint.decider ?? "");
    }
  }, [open, sprint]);

  const isSolo = sprint.modus === "solo";

  async function onSave() {
    if (titel.trim().length < 3) {
      toast({ title: "Titel zu kurz", description: "Mindestens 3 Zeichen.", variant: "destructive" });
      return;
    }
    if (problemstellung.trim().length < 10) {
      toast({
        title: "Problemstellung zu kurz",
        description: "Bitte etwas genauer beschreiben.",
        variant: "destructive",
      });
      return;
    }
    try {
      await update.mutateAsync({
        titel: titel.trim(),
        problemstellung: problemstellung.trim(),
        sprint_leader: sprintLeader.trim(),
        decider: isSolo ? "" : decider.trim(),
      });
      toast({ title: "Sprint aktualisiert" });
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Speichern fehlgeschlagen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Sprint-Grundlagen bearbeiten</DialogTitle>
          <DialogDescription>
            Diese Angaben fließen als Kontext in jeden Schritt ein.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-titel">Sprint-Titel</Label>
            <Input id="edit-titel" value={titel} onChange={(e) => setTitel(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-problem">Problemstellung</Label>
            <Textarea
              id="edit-problem"
              rows={5}
              value={problemstellung}
              onChange={(e) => setProblemstellung(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {isSolo ? (
              <div className="md:col-span-2 rounded-lg border bg-muted/40 p-3 text-sm">
                <span className="font-semibold">Decider:</span> Du – im Solo-Modus
                entscheidest du selbst.
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="edit-decider">Decider</Label>
                <Input
                  id="edit-decider"
                  value={decider}
                  onChange={(e) => setDecider(e.target.value)}
                  placeholder="Wer entscheidet?"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-leader">Sprint Leader</Label>
              <Input
                id="edit-leader"
                value={sprintLeader}
                onChange={(e) => setSprintLeader(e.target.value)}
                placeholder="Moderation / Timer"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={update.isPending}>
            Abbrechen
          </Button>
          <Button
            onClick={onSave}
            disabled={update.isPending}
            className="bg-gradient-primary hover:opacity-90"
          >
            {update.isPending ? "Speichert …" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
