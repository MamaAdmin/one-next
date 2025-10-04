import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BookingData } from "@/hooks/useSprintBooking";

const bookingSchema = z.object({
  name: z.string().min(2, "Name erforderlich").max(100),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  company: z.string().max(100).optional(),
  teamSize: z
    .number()
    .min(2, "Mind. 2 Personen")
    .max(50, "Max. 50 Personen"),
  preferredStartDate: z.date().optional(),
  notes: z.string().max(1000, "Max. 1000 Zeichen").optional(),
});

interface BookingFormProps {
  onSubmit: (data: BookingData) => Promise<void>;
  sprintType: string;
  isLoading: boolean;
}

export const BookingForm = ({ onSubmit, sprintType, isLoading }: BookingFormProps) => {
  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      teamSize: 4,
      notes: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof bookingSchema>) => {
    const bookingData: BookingData = {
      name: values.name || "",
      email: values.email || "",
      company: values.company,
      teamSize: values.teamSize || 4,
      preferredStartDate: values.preferredStartDate,
      notes: values.notes,
    };
    await onSubmit(bookingData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Unverbindliche Reservierung</h1>
        <p className="text-muted-foreground mb-2">
          Füllen Sie das Formular aus, um Ihren Sprint zu reservieren.
        </p>
        <div className="inline-block bg-primary/10 px-6 py-3 rounded-lg">
          <p className="text-sm font-semibold text-primary">
            Empfohlener Sprint: {sprintType}
          </p>
          <p className="text-2xl font-bold mt-1">999 CHF</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Max Mustermann" {...field} />
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
                  <Input type="email" placeholder="max@beispiel.ch" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unternehmen</FormLabel>
                <FormControl>
                  <Input placeholder="ACME GmbH" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teamSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teamgröße *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2}
                    max={50}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Anzahl der Teilnehmer (2-50 Personen)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredStartDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Bevorzugtes Startdatum</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: de })
                        ) : (
                          <span>Datum wählen</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Optional: Wann möchten Sie starten?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bemerkungen</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Besondere Wünsche oder Anmerkungen..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Optional (max. 1000 Zeichen)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-accent/50 p-4 rounded-lg text-sm text-muted-foreground">
            <p>
              <strong>Keine Verpflichtung:</strong> Mit dem Absenden{" "}
              <strong>reservieren</strong> Sie unverbindlich. <strong>Erst die Zahlung</strong>{" "}
              im nächsten Schritt bestätigt Ihre Buchung.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? "Wird gespeichert..." : "Unverbindlich reservieren"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
