import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { toast } from "sonner";

const personalInfoSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Name muss mindestens 2 Zeichen lang sein")
    .max(100, "Name darf maximal 100 Zeichen lang sein"),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{8,20}$/, "Ungültige Telefonnummer")
    .optional()
    .or(z.literal("")),
});

interface PersonalInfoCardProps {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  onUpdate: (data: { full_name: string; phone: string }) => Promise<void>;
}

export const PersonalInfoCard = ({
  fullName,
  email,
  phone,
  onUpdate,
}: PersonalInfoCardProps) => {
  const [formData, setFormData] = useState({
    full_name: fullName || "",
    phone: phone || "",
  });
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate with Zod
      const validated = personalInfoSchema.parse(formData);
      
      setUpdating(true);
      await onUpdate({
        full_name: validated.full_name,
        phone: validated.phone || "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Update error:", error);
        toast.error("Ein Fehler ist aufgetreten");
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Persönliche Informationen</CardTitle>
        <CardDescription>
          Aktualisieren Sie Ihre persönlichen Daten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Vollständiger Name</Label>
            <Input
              id="fullName"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="Ihr Name"
              className={errors.full_name ? "border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              value={email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Die E-Mail-Adresse kann nicht geändert werden
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Telefon (optional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+49 123 456789"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          <Button type="submit" disabled={updating}>
            {updating ? "Wird gespeichert..." : "Änderungen speichern"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
