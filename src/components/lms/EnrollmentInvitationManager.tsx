import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, UserPlus, CheckCircle, Clock, XCircle } from "lucide-react";
import { useInvitations } from "@/hooks/useInvitations";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface EnrollmentInvitationManagerProps {
  customerId: string;
  purchaseId?: string;
}

export const EnrollmentInvitationManager = ({
  customerId,
  purchaseId,
}: EnrollmentInvitationManagerProps) => {
  const { invitations, loading, createInvitation } = useInvitations(customerId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async () => {
    try {
      setSubmitting(true);
      await createInvitation(formData.email, formData.fullName);
      setFormData({ email: "", fullName: "", message: "" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      accepted: "default",
      pending: "secondary",
      expired: "destructive",
    };

    const labels: Record<string, string> = {
      accepted: "Akzeptiert",
      pending: "Ausstehend",
      expired: "Abgelaufen",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Lädt Einladungen...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Enrollment-Einladungen</h3>
          <p className="text-sm text-muted-foreground">
            Laden Sie Mitarbeiter ein, auf gekaufte Kurse zuzugreifen
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Einladung senden
        </Button>
      </div>

      {invitations.length === 0 ? (
        <Card className="p-8 text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Noch keine Einladungen versendet
          </p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Erste Einladung senden
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="mt-1">{getStatusIcon(invitation.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{invitation.full_name}</span>
                      {getStatusBadge(invitation.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {invitation.email}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        Gesendet:{" "}
                        {format(new Date(invitation.created_at), "dd.MM.yyyy", {
                          locale: de,
                        })}
                      </span>
                      {invitation.accepted_at && (
                        <span>
                          Akzeptiert:{" "}
                          {format(new Date(invitation.accepted_at), "dd.MM.yyyy", {
                            locale: de,
                          })}
                        </span>
                      )}
                      <span>
                        Läuft ab:{" "}
                        {format(new Date(invitation.expires_at), "dd.MM.yyyy", {
                          locale: de,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enrollment-Einladung senden</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="z.B. Max Mustermann"
              />
            </div>

            <div>
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="max@example.com"
              />
            </div>

            <div>
              <Label htmlFor="message">Persönliche Nachricht (optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Füge eine persönliche Nachricht zur Einladung hinzu..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleInvite}
              disabled={
                submitting || !formData.email || !formData.fullName
              }
            >
              {submitting ? "Sendet..." : "Einladung senden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
