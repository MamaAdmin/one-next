import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useCreateSprintInvitation } from "@/hooks/useSprintTeam";
import type { SprintTeamRole } from "@/features/sprint/types";

interface Props {
  sprintId: string;
  role: SprintTeamRole | null;
  roleTitle: string;
  onClose: () => void;
}

export function InviteMemberDialog({ sprintId, role, roleTitle, onClose }: Props) {
  const create = useCreateSprintInvitation(sprintId);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (role) {
      setEmail("");
      setFullName("");
    }
  }, [role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: "E-Mail ungültig", variant: "destructive" });
      return;
    }
    try {
      await create.mutateAsync({
        email,
        full_name: fullName,
        role_type: role,
      });
      toast({
        title: "Einladung verschickt",
        description: `${email} wurde als ${roleTitle} eingeladen.`,
      });
      onClose();
    } catch (e) {
      toast({
        title: "Einladung fehlgeschlagen",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={role !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Person als {roleTitle} einladen</DialogTitle>
          <DialogDescription>
            Die eingeladene Person erhält eine E-Mail mit einem persönlichen Link zum Sprint. Der
            Link ist 14 Tage gültig.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name">Vollständiger Name</Label>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Vor- und Nachname"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-email">E-Mail</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@firma.tld"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Wird verschickt …" : "Einladung verschicken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
