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
  token: string;
  role: Role;
  created_at: string;
  expires_at: string | null;
  revoked: boolean;
}

export interface ShareDialogProps {
  resourceId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invitationsTable: "sprint_invitations" | "framing_invitations";
  resourceColumn: "sprint_id" | "session_id";
  joinPath: string; // e.g. "/sprint/join" or "/sprint/framing/join"
  title: string;
  description?: string;
}

export default function ShareDialog({
  resourceId,
  open,
  onOpenChange,
  invitationsTable,
  resourceColumn,
  joinPath,
  title,
  description,
}: ShareDialogProps) {
  const [role, setRole] = useState<Role>("viewer");
  const qc = useQueryClient();

  const invitesQ = useQuery({
    queryKey: [invitationsTable, resourceId],
    enabled: open && !!resourceId,
    queryFn: async (): Promise<Invitation[]> => {
      const { data, error } = await supabase
        .from(invitationsTable as never)
        .select("*")
        .eq(resourceColumn, resourceId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Invitation[]) ?? [];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Nicht angemeldet");
      const payload = {
        [resourceColumn]: resourceId,
        role,
        created_by: userData.user.id,
      };
      const { error } = await supabase.from(invitationsTable as never).insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Einladungslink erstellt");
      qc.invalidateQueries({ queryKey: [invitationsTable, resourceId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(invitationsTable as never)
        .update({ revoked: true } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [invitationsTable, resourceId] });
    },
  });

  function linkFor(token: string) {
    return `${window.location.origin}${joinPath}/${encodeURIComponent(token)}`;
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
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
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
                  <p className="text-xs text-muted-foreground">Kann ansehen, nichts ändern.</p>
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
                  <p className="text-xs text-muted-foreground">Kann mitarbeiten und Inhalte ändern.</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          <Button className="w-full" onClick={() => createMut.mutate()} disabled={createMut.isPending}>
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
                    <Button size="icon" variant="ghost" onClick={() => revokeMut.mutate(inv.id)} title="Widerrufen">
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
