import ShareDialog from "./ShareDialog";

export default function ShareSprintDialog({
  sprintId,
  open,
  onOpenChange,
}: {
  sprintId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <ShareDialog
      resourceId={sprintId}
      open={open}
      onOpenChange={onOpenChange}
      invitationsTable="sprint_invitations"
      resourceColumn="sprint_id"
      joinPath="/sprint/join"
      title="Sprint teilen"
      description="Erstelle einen Einladungslink. Wähle, ob Empfänger:innen nur lesen oder auch bearbeiten dürfen."
    />
  );
}
