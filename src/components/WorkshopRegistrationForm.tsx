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
import { Calendar } from "@/components/ui/calendar";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

const workshopRegistrationSchema = z.object({
  // Unternehmensangaben
  companyName: z.string().min(1, "Firmenname ist erforderlich"),
  address: z.string().min(1, "Adresse ist erforderlich"),
  zipCity: z.string().min(1, "PLZ / Ort ist erforderlich"),
  country: z.string().min(1, "Land ist erforderlich"),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"], {
    required_error: "Bitte wählen Sie eine Unternehmensgröße",
  }),
  
  // Ansprechpartner
  contactName: z.string().min(1, "Name ist erforderlich"),
  position: z.string().min(1, "Position ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().min(1, "Telefonnummer ist erforderlich"),
  
  // Interesse
  workshopTypes: z.array(z.string()).min(1, "Bitte wählen Sie mindestens einen Workshop-Typ"),
  additionalServices: z.array(z.string()).optional(),
  
  // Teilnahme
  preferredDates: z.array(z.date()).min(1, "Bitte wählen Sie mindestens einen Termin"),
  numberOfParticipants: z.coerce.number().min(1, "Mindestens 1 Teilnehmende erforderlich").max(10, "Maximal 10 Teilnehmende möglich"),
  numberOfCourses: z.string().min(1, "Anzahl der Kurse ist erforderlich"),
  
  // Ziele
  goals: z.string().min(10, "Bitte beschreiben Sie Ihre Zielsetzung (mind. 10 Zeichen)"),
  
  // Zustimmung
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Sie müssen die Teilnahmebedingungen akzeptieren",
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
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const workshopTypeOptions = [
    { id: "problem-framing", label: "Problem-Framing Workshop" },
    { id: "design-sprint", label: "Design Sprint Workshop" },
  ];

  const form = useForm<WorkshopRegistrationFormData>({
    resolver: zodResolver(workshopRegistrationSchema),
    defaultValues: {
      workshopTypes: defaultWorkshopType ? [defaultWorkshopType] : [],
      additionalServices: [],
      preferredDates: [],
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: WorkshopRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // Call edge function to create company and user
      const { data: setupResult, error: setupError } = await supabase.functions.invoke(
        'create-company-from-registration',
        {
          body: {
            companyName: data.companyName,
            companySize: data.companySize,
            address: data.address,
            zipCity: data.zipCity,
            country: data.country,
            contactName: data.contactName,
            position: data.position,
            email: data.email,
            phone: data.phone,
          }
        }
      );

      if (setupError) throw setupError;
      if (!setupResult?.success) throw new Error("Fehler beim Erstellen des Unternehmensprofils");
      const formattedDates = data.preferredDates
        .map(date => format(date, "dd.MM.yyyy", { locale: de }))
        .join(", ");

      // Erstelle Buchung
      const { error: bookingError } = await supabase
        .from("sprint_bookings")
        .insert({
          name: data.contactName,
          email: data.email,
          company: data.companyName,
          team_size: data.numberOfParticipants,
          preferred_start_date: data.preferredDates.map(d => format(d, 'yyyy-MM-dd')).join(', '),
          notes: `
Position: ${data.position}
Telefon: ${data.phone}
Unternehmensgröße: ${data.companySize}
Workshop-Typen: ${data.workshopTypes?.map(type => 
  type === "problem-framing" ? "Problem-Framing Workshop" : "Design Sprint Workshop"
).join(", ") || "Keine"}
Zusätzliche Services: ${data.additionalServices?.join(", ") || "Keine"}
Anzahl Kurse: ${data.numberOfCourses}
Wunschtermine: ${formattedDates}
Ziele: ${data.goals}
          `.trim(),
          challenge_description: data.goals,
          target_audience: ["Nicht angegeben"],
          consequences: "Nicht angegeben",
          success_criteria: data.goals,
          relevance_reason: data.workshopTypes?.join(", ") || "Nicht angegeben",
          recommended_sprint_type: data.workshopTypes?.join(",") || "not_specified",
        });

      if (bookingError) throw bookingError;

      toast.success(
        "Registrierung erfolgreich! Sie erhalten in Kürze eine E-Mail mit Ihren Login-Daten.",
        { duration: 5000 }
      );
      form.reset();
      setSelectedDates([]);
      onSuccess?.();
    } catch (error: any) {
      console.error("Fehler bei der Anmeldung:", error);
      toast.error(error.message || "Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const additionalServicesOptions = [
    { id: "ai-design-sprint", label: "KI Design Sprint" },
    { id: "problem-framing", label: "Problem-Framing Workshop" },
    { id: "data-audit", label: "KI Datenaudit & Governance" },
    { id: "custom-ai", label: "Individuelle KI-Entwicklung" },
    { id: "ai-consulting", label: "KI-Beratung & Strategie" },
    { id: "ai-training", label: "KI Trainings & Enablement" },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Anmeldeformular – Workshop & Services</CardTitle>
        <CardDescription>
          Bitte füllen Sie dieses Formular vollständig aus, damit wir Ihre Anmeldung bearbeiten können.
          <br />
          <span className="text-sm italic">(Alle Felder mit * sind Pflichtfelder)</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Unternehmensangaben */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Unternehmensangaben</h3>
              
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
              <h3 className="text-lg font-semibold">Ansprechpartner</h3>
              
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
              <h3 className="text-lg font-semibold">Interesse</h3>
              
              <FormField
                control={form.control}
                name="workshopTypes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Art des Workshops *</FormLabel>
                      <FormDescription>
                        Wählen Sie alle Workshop-Typen aus, die Sie interessieren
                      </FormDescription>
                    </div>
                    {workshopTypeOptions.map((workshop) => (
                      <FormField
                        key={workshop.id}
                        control={form.control}
                        name="workshopTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={workshop.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(workshop.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), workshop.id])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== workshop.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {workshop.label}
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

              <FormField
                control={form.control}
                name="additionalServices"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Zusätzliche Services (Mehrfachauswahl möglich)</FormLabel>
                      <FormDescription>
                        Wählen Sie alle Services aus, die Sie interessieren
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
              <h3 className="text-lg font-semibold">Teilnahme</h3>
              
              <FormField
                control={form.control}
                name="preferredDates"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Wunschtermin(e) *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !selectedDates.length && "text-muted-foreground"
                            )}
                          >
                            {selectedDates.length > 0 ? (
                              selectedDates.map(d => format(d, "dd.MM.yyyy", { locale: de })).join(", ")
                            ) : (
                              <span>Termine auswählen</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="multiple"
                          selected={selectedDates}
                          onSelect={(dates) => {
                            setSelectedDates(dates || []);
                            field.onChange(dates || []);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Sie können mehrere Termine auswählen
                    </FormDescription>
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
                      <Input type="number" min="1" max="10" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximal 10 Teilnehmende möglich
                    </FormDescription>
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
              <h3 className="text-lg font-semibold">Ziele & Erwartungen</h3>
              
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitte beschreiben Sie kurz Ihre Zielsetzung *</FormLabel>
                    <FormControl>
                      <div className="min-h-[200px]">
                        <RichTextEditor
                          value={field.value}
                          onSave={async (value) => {
                            field.onChange(value);
                          }}
                          isEditMode={true}
                          placeholder="Welche Ziele verfolgen Sie mit dem Workshop? Was möchten Sie erreichen?"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Zustimmung */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Zustimmung</h3>
              
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
                      <FormLabel className="text-sm font-normal">
                        Mit Absenden der Anfrage bestätige ich, dass meine angegebenen Daten zur Bearbeitung der Workshop-Anfrage verwendet werden dürfen. 
                        Es handelt sich noch nicht um eine verbindliche Buchung – das Organisationsteam wird zur weiteren Abstimmung Kontakt aufnehmen. 
                        Die Daten werden ausschließlich für die Anfragebearbeitung genutzt und bei Nichtzustandekommen einer Buchung gemäß Schweizer Datenschutzgesetz (DSG) und DSGVO innerhalb der gesetzlichen Fristen gelöscht.{" "}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button type="button" variant="link" className="h-auto p-0 text-primary underline">
                              Vollständige Bedingungen lesen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Teilnahmebedingungen & Datenschutz</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 text-sm">
                              <div>
                                <h4 className="font-semibold mb-2">Datenverwendung</h4>
                                <p>
                                  Mit Absenden der Anfrage bestätigen Sie, dass Ihre angegebenen Daten zur Bearbeitung der Workshop-Anfrage verwendet werden dürfen.
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Unverbindliche Anfrage</h4>
                                <p>
                                  Es handelt sich noch nicht um eine verbindliche Buchung. Das Organisationsteam wird zur weiteren Abstimmung mit Ihnen Kontakt aufnehmen.
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Datenschutz & Löschung</h4>
                                <p>
                                  Die Daten werden ausschließlich für die Anfragebearbeitung genutzt und bei Nichtzustandekommen einer Buchung gemäß Schweizer Datenschutzgesetz (DSG) und DSGVO innerhalb der gesetzlichen Fristen gelöscht.
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Ihre Rechte</h4>
                                <p>
                                  Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer personenbezogenen Daten sowie das Recht auf Datenübertragbarkeit.
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                "Anmeldung absenden"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
