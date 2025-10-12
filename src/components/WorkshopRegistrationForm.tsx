import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const workshopRegistrationSchema = z.object({
  // Unternehmensangaben
  companyName: z.string().min(1, "Firmenname ist erforderlich"),
  address: z.string().min(1, "Adresse ist erforderlich"),
  zipCity: z.string().min(1, "PLZ / Ort ist erforderlich"),
  country: z.string().min(1, "Land ist erforderlich"),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"], {
    required_error: "Bitte wähle eine Unternehmensgröße",
  }),
  
  // Ansprechpartner
  contactName: z.string().min(1, "Name ist erforderlich"),
  position: z.string().min(1, "Position ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().min(1, "Telefonnummer ist erforderlich"),
  
  // Interesse
  workshopType: z.enum(["problem-framing", "design-sprint"], {
    required_error: "Bitte wähle einen Workshop-Typ",
  }),
  additionalServices: z.array(z.string()).optional(),
  
  // Teilnahme
  preferredDates: z.string().min(1, "Wunschtermin ist erforderlich"),
  numberOfParticipants: z.string().min(1, "Anzahl der Teilnehmenden ist erforderlich"),
  numberOfCourses: z.string().min(1, "Anzahl der Kurse ist erforderlich"),
  
  // Ziele
  goals: z.string().min(10, "Bitte beschreibe deine Zielsetzung (mind. 10 Zeichen)"),
  
  // Zustimmung
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Du musst die Teilnahmebedingungen akzeptieren",
  }),
});

type WorkshopRegistrationFormData = z.infer<typeof workshopRegistrationSchema>;

interface WorkshopRegistrationFormProps {
  defaultWorkshopType?: "problem-framing" | "design-sprint";
  onSuccess?: () => void;
}

export const WorkshopRegistrationForm = ({ 
  defaultWorkshopType, 
  onSuccess 
}: WorkshopRegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkshopRegistrationFormData>({
    resolver: zodResolver(workshopRegistrationSchema),
    defaultValues: {
      workshopType: defaultWorkshopType,
      additionalServices: [],
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: WorkshopRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // Erstelle Kunde
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: data.contactName,
          email: data.email,
          phone: data.phone,
          company_name: data.companyName,
          address: `${data.address}, ${data.zipCity}, ${data.country}`,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Erstelle Buchung
      const { error: bookingError } = await supabase
        .from("sprint_bookings")
        .insert({
          name: data.contactName,
          email: data.email,
          company: data.companyName,
          team_size: parseInt(data.numberOfParticipants) || 1,
          preferred_start_date: data.preferredDates,
          notes: `
Position: ${data.position}
Telefon: ${data.phone}
Unternehmensgröße: ${data.companySize}
Workshop-Typ: ${data.workshopType === "problem-framing" ? "Problem-Framing Workshop" : "Design Sprint Workshop"}
Zusätzliche Services: ${data.additionalServices?.join(", ") || "Keine"}
Anzahl Kurse: ${data.numberOfCourses}
Ziele: ${data.goals}
          `.trim(),
          challenge_description: data.goals,
          target_audience: ["Nicht angegeben"],
          consequences: "Nicht angegeben",
          success_criteria: data.goals,
          relevance_reason: data.workshopType === "problem-framing" ? "Problem-Framing" : "Design Sprint",
          recommended_sprint_type: data.workshopType === "problem-framing" ? "problem_framing" : "design_sprint",
        });

      if (bookingError) throw bookingError;

      toast.success("Anmeldung erfolgreich übermittelt!");
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Fehler bei der Anmeldung:", error);
      toast.error(error.message || "Fehler bei der Anmeldung. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const additionalServicesOptions = [
    { id: "ai-design-sprint", label: "AI Design Sprint" },
    { id: "problem-framing", label: "Problem-Framing Workshop" },
    { id: "data-audit", label: "AI Datenaudit & Governance" },
    { id: "custom-ai", label: "Custom AI Development" },
    { id: "ai-consulting", label: "AI Beratung & Strategie" },
    { id: "ai-training", label: "AI Trainings & Enablement" },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">📝 Anmeldeformular – Workshop & Services</CardTitle>
        <CardDescription>
          Bitte fülle dieses Formular vollständig aus, damit wir deine Anmeldung bearbeiten können.
          <br />
          <span className="text-sm italic">(Alle Felder mit * sind Pflichtfelder)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Unternehmensangaben */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📌 Unternehmensangaben</h3>
              
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firmenname *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PLZ / Ort *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Unternehmensgröße *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1-10" id="size-1-10" />
                          <Label htmlFor="size-1-10">1–10 Mitarbeitende</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="11-50" id="size-11-50" />
                          <Label htmlFor="size-11-50">11–50 Mitarbeitende</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="51-200" id="size-51-200" />
                          <Label htmlFor="size-51-200">51–200 Mitarbeitende</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="201-500" id="size-201-500" />
                          <Label htmlFor="size-201-500">201–500 Mitarbeitende</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="500+" id="size-500-plus" />
                          <Label htmlFor="size-500-plus">500+ Mitarbeitende</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ansprechpartner */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">👤 Ansprechpartner</h3>
              
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name, Vorname *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position / Funktion *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonnummer *</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Interesse */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">🎯 Interesse</h3>
              
              <FormField
                control={form.control}
                name="workshopType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Art des Workshops *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="problem-framing" id="workshop-problem" />
                          <Label htmlFor="workshop-problem">Problem-Framing Workshop</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="design-sprint" id="workshop-design" />
                          <Label htmlFor="workshop-design">Design Sprint Workshop</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalServices"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Zusätzliche Services (Mehrfachauswahl möglich)</FormLabel>
                      <FormDescription>
                        Wähle alle Services aus, die dich interessieren
                      </FormDescription>
                    </div>
                    {additionalServicesOptions.map((service) => (
                      <FormField
                        key={service.id}
                        control={form.control}
                        name="additionalServices"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={service.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(service.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), service.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== service.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {service.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Teilnahme */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📅 Teilnahme</h3>
              
              <FormField
                control={form.control}
                name="preferredDates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wunschtermin(e) *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="z.B. 15.-19. März 2025" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzahl der Teilnehmenden *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfCourses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzahl der gewünschten Kurse/Workshops *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ziele & Erwartungen */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📌 Ziele & Erwartungen</h3>
              
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitte beschreibe kurz deine Zielsetzung *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={5}
                        placeholder="Welche Ziele verfolgst du mit dem Workshop? Was erhoffst du dir davon?"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Zustimmung */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">✅ Zustimmung</h3>
              
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Hiermit bestätige ich die Anmeldung und akzeptiere die Teilnahmebedingungen.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                "📤 Anmeldung absenden"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
