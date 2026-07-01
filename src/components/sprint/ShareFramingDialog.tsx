import ShareDialog from "./ShareDialog";

export default function ShareFramingDialog({
  sessionId,
  open,
  onOpenChange,
}: {
  sessionId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <ShareDialog
      resourceId={sessionId}
      open={open}
      onOpenChange={onOpenChange}
      invitationsTable="framing_invitations"
      resourceColumn="session_id"
      joinPath="/sprint/framing/join"
      title="Problem Framing teilen"
      description="Erstelle einen Einladungslink zu diesem Framing. Wähle, ob Empfänger:innen nur lesen oder auch bearbeiten dürfen."
    />
  );
}
