import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const inviteSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  fullName: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, fullName: string) => Promise<void>;
}

export const InviteUserDialog = ({
  open,
  onOpenChange,
  onInvite,
}: InviteUserDialogProps) => {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (data: InviteFormData) => {
    setSubmitting(true);
    try {
      await onInvite(data.email, data.fullName);
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mitarbeiter einladen</DialogTitle>
          <DialogDescription>
            Laden Sie einen neuen Mitarbeiter zu Ihrem Unternehmen ein.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Vollständiger Name</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Max Mustermann"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="max@firma.ch"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Wird gesendet..." : "Einladung senden"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
