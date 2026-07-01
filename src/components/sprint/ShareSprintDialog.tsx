import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Link2, Trash2, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";

type Role = "viewer" | "editor";

interface Invitation {
  id: string;
  sprint_id: string;
  token: string;
  role: Role;
  created_at: string;
  expires_at: string | null;
  revoked: boolean;
}

export default function ShareSprintDialog({
  sprintId,
  open,
  onOpenChange,
}: {
  sprintId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [role, setRole] = useState<Role>("viewer");
  const qc = useQueryClient();

  const invitesQ = useQuery({
    queryKey: ["sprint-invitations", sprintId],
    enabled: open && !!sprintId,
    queryFn: async (): Promise<Invitation[]> => {
      const { data, error } = await supabase
        .from("sprint_invitations" as never)
        .select("*")
        .eq("sprint_id", sprintId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Invitation[]) ?? [];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Nicht angemeldet");
      const { error } = await supabase
        .from("sprint_invitations" as never)
        .insert({
          sprint_id: sprintId,
          role,
          created_by: userData.user.id,
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Einladungslink erstellt");
      qc.invalidateQueries({ queryKey: ["sprint-invitations", sprintId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sprint_invitations" as never)
        .update({ revoked: true } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprint-invitations", sprintId] });
    },
  });

  function linkFor(token: string) {
    return `${window.location.origin}/sprint/join/${encodeURIComponent(token)}`;
  }

  async function copy(token: string) {
    await navigator.clipboard.writeText(linkFor(token));
    toast.success("Link kopiert");
  }

  const active = (invitesQ.data ?? []).filter((i) => !i.revoked);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sprint teilen</DialogTitle>
          <DialogDescription>
            Erstelle einen Einladungslink. Wähle, ob Empfänger:innen nur lesen oder auch bearbeiten dürfen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Berechtigung</Label>
            <RadioGroup value={role} onValueChange={(v) => setRole(v as Role)} className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                  role === "viewer" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="viewer" className="mt-1" />
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-sm">
                    <Eye className="w-4 h-4" /> Nur lesen
                  </div>
                  <p className="text-xs text-muted-foreground">Kann Sprint ansehen, nichts ändern.</p>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                  role === "editor" ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem value="editor" className="mt-1" />
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-sm">
                    <Pencil className="w-4 h-4" /> Bearbeiten
                  </div>
                  <p className="text-xs text-muted-foreground">Kann Schritte bearbeiten und mitarbeiten.</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          <Button
            className="w-full"
            onClick={() => createMut.mutate()}
            disabled={createMut.isPending}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Einladungslink erstellen
          </Button>

          <div className="space-y-2">
            <Label>Aktive Links</Label>
            {invitesQ.isLoading ? (
              <p className="text-sm text-muted-foreground">Lädt…</p>
            ) : active.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Links vorhanden.</p>
            ) : (
              <ul className="space-y-2">
                {active.map((inv) => (
                  <li key={inv.id} className="flex items-center gap-2 rounded-md border p-2">
                    <Badge variant={inv.role === "editor" ? "default" : "secondary"} className="shrink-0">
                      {inv.role === "editor" ? "Bearbeiten" : "Nur lesen"}
                    </Badge>
                    <Input readOnly value={linkFor(inv.token)} className="text-xs h-8" />
                    <Button size="icon" variant="ghost" onClick={() => copy(inv.token)} title="Kopieren">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => revokeMut.mutate(inv.id)}
                      title="Widerrufen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
