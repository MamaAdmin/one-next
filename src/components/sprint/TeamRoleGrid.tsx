import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, Trash2, User, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useSprintInvitations,
  useSprintMembers,
  useAddSelfAsMember,
  useRemoveSprintMember,
  useResendSprintInvitation,
  useRevokeSprintInvitation,
} from "@/hooks/useSprintTeam";
import { InviteMemberDialog } from "./InviteMemberDialog";
import type { SprintTeamRole } from "@/features/sprint/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RoleDef {
  key: SprintTeamRole;
  title: string;
  description: string;
  required?: boolean;
  recommended?: boolean;
  multi?: boolean;
}

const ROLES: RoleDef[] = [
  {
    key: "moderator",
    title: "Moderator",
    description:
      "Sprint-Owner. Lädt das Team ein, hält die Fäden zusammen und trägt (später) die Abrechnung. Wird automatisch beim Anlegen des Sprints gesetzt.",
    required: true,
  },
  {
    key: "decider",
    title: "Decider",
    description:
      "Die Person mit echter Entscheidungsbefugnis. Trifft die finalen Entscheidungen. Empfohlen, damit der Sprint verbindlich bleibt.",
    recommended: true,
  },
  {
    key: "finance",
    title: "Finance Expert",
    description: "Kennt Geschäftsmodell und Budget.",
    recommended: true,
  },
  {
    key: "marketing",
    title: "Marketing Expert",
    description: "Kennt Positionierung und Kundenkommunikation.",
    recommended: true,
  },
  {
    key: "customer",
    title: "Customer Expert",
    description: "Direkter Kundenkontakt aus Sales oder Support.",
    recommended: true,
  },
  {
    key: "tech",
    title: "Tech / Logistics Expert",
    description: "Kennt die technische Machbarkeit.",
    recommended: true,
  },
  {
    key: "design",
    title: "Design Expert",
    description: "Verantwortet UX oder Produktdesign.",
  },
  {
    key: "wildcard",
    title: "Wildcard",
    description:
      "Außenstehende Perspektive für unkonventionelle Impulse. Mehrere Wildcards sind möglich – achte auf die empfohlene Teamgröße.",
    multi: true,
  },
];

const RECOMMENDED_TEAM_SIZE = 7;

function useCurrentUserId() {
  return useQuery({
    queryKey: ["auth", "current-user-id"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
    staleTime: 60_000,
  });
}

interface Props {
  sprintId: string;
  /** Wenn true: Empfehlungs-Callout, solange Decider fehlt (Kickoff-Seite). */
  emphasizeDeciderMissing?: boolean;
}

export function TeamRoleGrid({ sprintId, emphasizeDeciderMissing = true }: Props) {
  const membersQ = useSprintMembers(sprintId);
  const invitesQ = useSprintInvitations(sprintId);
  const addSelf = useAddSelfAsMember(sprintId);
  const removeMember = useRemoveSprintMember(sprintId);
  const resendInvite = useResendSprintInvitation(sprintId);
  const revokeInvite = useRevokeSprintInvitation(sprintId);
  const currentUserQ = useCurrentUserId();
  const sprintOwnerQ = useQuery({
    queryKey: ["sprint", sprintId, "owner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sprints")
        .select("owner_id")
        .eq("id", sprintId)
        .maybeSingle();
      if (error) throw error;
      return (data as { owner_id: string } | null)?.owner_id ?? null;
    },
    staleTime: 60_000,
  });

  const [inviteRole, setInviteRole] = useState<SprintTeamRole | null>(null);

  const members = membersQ.data ?? [];
  const invites = invitesQ.data ?? [];


  const byRole = useMemo(() => {
    const map: Record<string, { members: typeof members; invites: typeof invites }> = {};
    for (const r of ROLES) map[r.key] = { members: [], invites: [] };
    for (const m of members) {
      (map[m.rolle] ??= { members: [], invites: [] }).members.push(m);
    }
    for (const i of invites) {
      if (i.status === "accepted" || i.status === "revoked") continue;
      (map[i.role_type] ??= { members: [], invites: [] }).invites.push(i);
    }
    return map;
  }, [members, invites]);

  const teamCount =
    members.length +
    invites.filter((i) => i.status !== "accepted" && i.status !== "revoked").length;
  const teamOverLimit = teamCount > RECOMMENDED_TEAM_SIZE;

  return (
    <div className="space-y-4">


      <div
        className={`text-xs rounded-md border px-3 py-2 ${
          teamOverLimit
            ? "border-orange-300 bg-orange-50 text-orange-900"
            : "border-muted bg-muted/30 text-muted-foreground"
        }`}
      >
        Team aktuell <span className="font-semibold">{teamCount}</span> von{" "}
        {RECOMMENDED_TEAM_SIZE} empfohlenen Personen
        {teamOverLimit
          ? " – Design Sprints funktionieren am besten mit maximal 7 Personen im Raum."
          : "."}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {ROLES.map((role) => {
          const filled = byRole[role.key]?.members ?? [];
          const pending = byRole[role.key]?.invites ?? [];
          const isModerator = role.key === "moderator";
          const slotTaken = filled.length > 0 || pending.length > 0;
          const canInviteMore = role.multi || !slotTaken;
          const canTakeSelf = role.multi || filled.length === 0;
          return (
            <Card
              key={role.key}
              className={
                filled.length > 0
                  ? "border-primary/30 bg-primary/5"
                  : ""
              }
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{role.title}</h3>
                      {isModerator ? (
                        <Badge className="text-[10px]">Sprint-Owner</Badge>
                      ) : role.required ? (
                        <Badge variant="destructive" className="text-[10px]">Pflicht</Badge>
                      ) : role.recommended ? (
                        <Badge variant="secondary" className="text-[10px]">Empfohlen</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Optional</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>

                {filled.length === 0 && pending.length === 0 ? (
                  <p className="text-xs italic text-muted-foreground">— noch offen —</p>
                ) : (
                  <ul className="space-y-1.5">
                    {filled.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">
                            {m.user_id === currentUserQ.data ? "Ich" : (m.email ?? "Teammitglied")}
                          </span>
                        </span>
                        {isModerator ? null : (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeMember.mutate(m.id)}
                            disabled={removeMember.isPending}
                            aria-label="Entfernen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </li>
                    ))}
                    {pending.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {i.full_name || i.email}{" "}
                            <Badge
                              variant={i.status === "expired" ? "destructive" : "outline"}
                              className="ml-1 text-[10px]"
                            >
                              {i.status === "expired" ? "Abgelaufen" : "Eingeladen"}
                            </Badge>
                          </span>
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              resendInvite
                                .mutateAsync(i.id)
                                .then(() => toast({ title: "Einladung erneut gesendet" }))
                                .catch((e) =>
                                  toast({
                                    title: "Erneutes Senden fehlgeschlagen",
                                    description: e instanceof Error ? e.message : String(e),
                                    variant: "destructive",
                                  }),
                                )
                            }
                          >
                            Erneut
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => revokeInvite.mutate(i.id)}
                            aria-label="Widerrufen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {isModerator || (!canTakeSelf && !canInviteMore) ? null : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {canTakeSelf ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          addSelf
                            .mutateAsync(role.key)
                            .then(() => toast({ title: `Rolle übernommen: ${role.title}` }))
                            .catch((e) =>
                              toast({
                                title: "Konnte Rolle nicht übernehmen",
                                description: e instanceof Error ? e.message : String(e),
                                variant: "destructive",
                              }),
                            )
                        }
                        disabled={addSelf.isPending}
                      >
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        Ich übernehme das
                      </Button>
                    ) : null}
                    {canInviteMore ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setInviteRole(role.key)}
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        {role.multi && slotTaken ? "Weitere Person einladen" : "Person einladen"}
                      </Button>
                    ) : null}
                  </div>
                )}
                {role.multi ? (
                  <p className="text-[11px] text-muted-foreground italic">
                    Mehrere Einladungen möglich. Empfohlen: maximal {RECOMMENDED_TEAM_SIZE}{" "}
                    Personen im gesamten Sprint-Team.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <InviteMemberDialog
        sprintId={sprintId}
        role={inviteRole}
        roleTitle={inviteRole ? ROLES.find((r) => r.key === inviteRole)?.title ?? "" : ""}
        onClose={() => setInviteRole(null)}
      />
    </div>
  );
}
