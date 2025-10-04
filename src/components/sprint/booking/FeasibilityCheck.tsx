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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FeasibilityData } from "@/hooks/useSprintBooking";

const feasibilitySchema = z.object({
  challenge: z
    .string()
    .min(50, "Bitte beschreiben Sie Ihre Herausforderung ausführlicher (mind. 50 Zeichen)")
    .max(1000, "Bitte kürzen Sie Ihre Beschreibung (max. 1000 Zeichen)"),
  relevance: z.enum([
    "Marktveränderungen",
    "Kundenbedürfnisse",
    "Interne Probleme",
    "Wettbewerb",
    "Sonstiges",
  ]),
  targetAudience: z
    .array(z.string())
    .min(1, "Bitte wählen Sie mindestens eine Zielgruppe"),
  consequences: z
    .string()
    .min(30, "Bitte beschreiben Sie die Konsequenzen ausführlicher (mind. 30 Zeichen)")
    .max(1000),
  successCriteria: z
    .string()
    .min(20, "Bitte beschreiben Sie Ihre Erfolgskriterien (mind. 20 Zeichen)")
    .max(500),
});

const targetAudienceOptions = [
  { id: "customers", label: "Kund:innen" },
  { id: "employees", label: "Mitarbeitende" },
  { id: "management", label: "Management" },
  { id: "partners", label: "Partner:innen" },
];

interface FeasibilityCheckProps {
  onSubmit: (data: FeasibilityData) => void;
}

export const FeasibilityCheck = ({ onSubmit }: FeasibilityCheckProps) => {
  const form = useForm<z.infer<typeof feasibilitySchema>>({
    resolver: zodResolver(feasibilitySchema),
    defaultValues: {
      challenge: "",
      relevance: "Kundenbedürfnisse",
      targetAudience: [],
      consequences: "",
      successCriteria: "",
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">So starten Sie (unverbindlich)</h1>
        <p className="text-muted-foreground">
          Willkommen zum Start Ihres Online Design Sprints. In <strong>3–5 Minuten</strong> klären Sie die wichtigsten Punkte zu Ihrer Challenge.
          Am Ende erhalten Sie eine <strong>Einschätzung zur Sprint-Tauglichkeit</strong> und eine <strong>Empfehlung zum passenden Sprint-Typ</strong>.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Wichtig:</strong> Bis zum Absenden des Buchungsformulars ist alles <strong>unverbindlich</strong> – eine Buchung kommt <strong>erst mit der Zahlung</strong> zustande.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => {
          const feasibilityData: FeasibilityData = {
            challenge: data.challenge || "",
            relevance: data.relevance || "Kundenbedürfnisse",
            targetAudience: data.targetAudience || [],
            consequences: data.consequences || "",
            successCriteria: data.successCriteria || "",
          };
          onSubmit(feasibilityData);
        })} className="space-y-8">
          <FormField
            control={form.control}
            name="challenge"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  Was ist aktuell Ihre grösste Herausforderung? *
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Beispiele: 'Unser Produkt wird zu wenig genutzt', 'Unser Prozess ist zu langsam', 'Wir haben viele Ideen – wissen aber nicht, welche wir verfolgen sollen.'"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Bitte beschreiben Sie ausführlich (mindestens 50 Zeichen)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relevance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  Warum ist das Thema jetzt wichtig? *
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bitte auswählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Marktveränderungen">Marktveränderungen</SelectItem>
                    <SelectItem value="Kundenbedürfnisse">Kundenbedürfnisse</SelectItem>
                    <SelectItem value="Interne Probleme">Interne Probleme</SelectItem>
                    <SelectItem value="Wettbewerb">Wettbewerb</SelectItem>
                    <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={() => (
              <FormItem>
                <FormLabel className="text-lg">
                  Welche Zielgruppe ist betroffen? *
                </FormLabel>
                <div className="space-y-2">
                  {targetAudienceOptions.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.label)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, option.label])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== option.label)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consequences"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  Was passiert, wenn Sie das Problem nicht lösen? *
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Beschreiben Sie Folgen wie höhere Kosten, Kundenschwund, Unzufriedenheit im Team ..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Bitte beschreiben Sie die Konsequenzen (mindestens 30 Zeichen)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="successCriteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  Was wäre ein gutes Ergebnis nach dem Sprint? *
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Eine getestete Produktidee, eine klare Vision, ein Prototyp, eine Entscheidungsvorlage ..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Beschreiben Sie Ihre Erfolgskriterien (mindestens 20 Zeichen)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Ergebnis anzeigen
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
