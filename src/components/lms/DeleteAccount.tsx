import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DeleteAccount = () => {
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft");
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirmed) {
      toast({
        title: "Fehler",
        description: "Bitte Löschung bestätigen",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (deleteType === "soft") {
        // Soft delete: Anonymize data
        const { data: participant } = await (supabase as any)
          .from("participants")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (participant) {
          await (supabase as any)
            .from("participants")
            .update({
              full_name: "Anonymized User",
              email: `deleted_${Date.now()}@example.com`,
              phone: null,
            })
            .eq("id", participant.id);

          // Revoke all consents
          await (supabase as any)
            .from("lms_gdpr_consents")
            .update({ is_granted: false, revoked_at: new Date().toISOString() })
            .eq("participant_id", participant.id);
        }

        await supabase.auth.signOut();

        toast({
          title: "Account anonymisiert",
          description: "Ihre Daten wurden anonymisiert und Sie wurden abgemeldet",
        });
      } else {
        // Hard delete: Delete everything
        const { data: participant } = await (supabase as any)
          .from("participants")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (participant) {
          // Delete artifacts from storage
          const { data: artifacts } = await (supabase as any)
            .from("lms_artifacts")
            .select("file_path")
            .eq("enrollment_id", participant.id);

          for (const artifact of artifacts || []) {
            await supabase.storage
              .from("lms-artifacts")
              .remove([artifact.file_path]);
          }

          // Delete all related data
          await (supabase as any)
            .from("lms_artifacts")
            .delete()
            .eq("enrollment_id", participant.id);

          await (supabase as any)
            .from("lms_gdpr_consents")
            .delete()
            .eq("participant_id", participant.id);

          await (supabase as any)
            .from("lms_module_progress")
            .delete()
            .eq("enrollment_id", participant.id);

          await (supabase as any)
            .from("participants")
            .delete()
            .eq("id", participant.id);
        }

        // Delete auth user
        await supabase.auth.admin.deleteUser(user.id);

        toast({
          title: "Account gelöscht",
          description: "Ihr Account und alle Daten wurden unwiderruflich gelöscht",
        });
      }

      navigate("/");
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Fehler",
        description: "Löschen fehlgeschlagen. Bitte kontaktieren Sie den Support.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Account löschen</CardTitle>
        </div>
        <CardDescription>
          WARNUNG: Diese Aktion kann nicht rückgängig gemacht werden
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Löschungstyp wählen:</Label>

          <div className="space-y-3">
            <Card
              className={`p-4 cursor-pointer transition-all ${
                deleteType === "soft" ? "border-primary border-2" : ""
              }`}
              onClick={() => setDeleteType("soft")}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={deleteType === "soft"}
                  onCheckedChange={() => setDeleteType("soft")}
                />
                <div>
                  <Label className="font-medium cursor-pointer">
                    Soft Delete (Anonymisierung)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ihre persönlichen Daten werden anonymisiert. Kurs-Enrollments bleiben
                    für Statistiken erhalten, sind aber nicht mehr mit Ihnen verknüpft.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className={`p-4 cursor-pointer transition-all ${
                deleteType === "hard" ? "border-destructive border-2" : ""
              }`}
              onClick={() => setDeleteType("hard")}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={deleteType === "hard"}
                  onCheckedChange={() => setDeleteType("hard")}
                />
                <div>
                  <Label className="font-medium cursor-pointer text-destructive">
                    Hard Delete (Komplettlöschung)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ihr Account und ALLE zugehörigen Daten (Enrollments, Artifacts,
                    Progress) werden unwiderruflich gelöscht. Diese Aktion kann NICHT
                    rückgängig gemacht werden!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
          />
          <Label className="text-sm">
            Ich verstehe, dass diese Aktion{" "}
            {deleteType === "hard" ? "unwiderruflich" : "nicht einfach rückgängig zu machen"} ist
          </Label>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              disabled={!confirmed}
            >
              Account jetzt löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteType === "soft"
                  ? "Ihre persönlichen Daten werden anonymisiert und können nicht wiederhergestellt werden."
                  : "Diese Aktion kann NICHT rückgängig gemacht werden. Ihr Account und alle Daten werden permanent gelöscht."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Endgültig löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
