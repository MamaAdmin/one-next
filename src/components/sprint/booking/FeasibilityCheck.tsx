import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Info, AlertCircle } from "lucide-react";
import { FeasibilityData } from "@/hooks/useSprintBooking";

const feasibilitySchema = z.object({
  challenge: z
    .string()
    .min(50, "Bitte beschreiben Sie Ihre Herausforderung mit mindestens 50 Zeichen.")
    .max(1000, "Bitte kürzen Sie Ihre Beschreibung (max. 1000 Zeichen)"),
  relevance: z.enum(
    ["Marktveränderungen", "Wettbewerb", "Kundenbedürfnisse", "Interne Probleme", "Sonstiges"],
    {
      required_error: "Bitte wählen Sie einen Grund für die Relevanz.",
    }
  ),
  targetAudience: z
    .array(z.string())
    .min(1, "Bitte wählen Sie mindestens eine Zielgruppe aus."),
  consequences: z
    .string()
    .min(30, "Bitte schildern Sie die Folgen in mindestens 30 Zeichen.")
    .max(1000, "Bitte kürzen Sie Ihre Beschreibung (max. 1000 Zeichen)"),
  successCriteria: z
    .string()
    .min(20, "Bitte formulieren Sie das gewünschte Ergebnis in mindestens 20 Zeichen.")
    .max(500, "Bitte kürzen Sie Ihre Beschreibung (max. 500 Zeichen)"),
  testableIn5Days: z.enum(["Ja", "Teilweise", "Nein"], {
    required_error: "Bitte geben Sie an, ob die Idee in 5 Tagen testbar ist.",
  }),
  deciderAvailable: z.enum(["Ja", "Nein"], {
    required_error: "Bitte bestätigen Sie die Verfügbarkeit einer/s Entscheider:in für Tag 3.",
  }),
  userAccessCount: z.coerce.number({
    required_error: "Bitte geben Sie die Anzahl erreichbarer Nutzer:innen an.",
    invalid_type_error: "Bitte geben Sie eine gültige Zahl ein.",
  }).min(0, "Die Anzahl muss mindestens 0 sein."),
  impactScale: z.number({
    required_error: "Bitte bewerten Sie den geschäftlichen Impact (1–5).",
  }).min(1, "Mindestens 1").max(5, "Maximal 5"),
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
      testableIn5Days: "Ja",
      deciderAvailable: "Ja",
      userAccessCount: 0,
      impactScale: 3,
    },
  });

  const challengeValue = form.watch("challenge");
  const targetAudienceValue = form.watch("targetAudience");
  const successCriteriaValue = form.watch("successCriteria");
  const userAccessCountValue = form.watch("userAccessCount");
  const impactScaleValue = form.watch("impactScale");

  const keywords = [
    "Prototyp", "Test", "Nutzertest", "Entscheidung", 
    "Validierung", "Feedback", "Hypothese", "MVP", 
    "A/B", "Wizard", "Fake Door", "Smoke Test"
  ];
  const hasKeyword = keywords.some(kw =>
    successCriteriaValue?.toLowerCase().includes(kw.toLowerCase())
  );

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
            challenge: data.challenge,
            relevance: data.relevance,
            targetAudience: data.targetAudience,
            consequences: data.consequences,
            successCriteria: data.successCriteria,
            testableIn5Days: data.testableIn5Days,
            deciderAvailable: data.deciderAvailable,
            userAccessCount: data.userAccessCount,
            impactScale: data.impactScale,
          };
          onSubmit(feasibilityData);
        })} className="space-y-8">
          
          {/* Challenge */}
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
                  Konkrete Zielgruppe, Zeitraum oder Zahl erhöhen die Klarheit.
                </FormDescription>
                <FormMessage />
                {challengeValue && challengeValue.length >= 50 && challengeValue.length < 100 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Gut! Mit konkreter Zielgruppe, Zahl oder Zeitraum wird es noch klarer.</span>
                  </div>
                )}
                {(challengeValue && challengeValue.length > 350 || /\b(und|sowie|ausserdem)\b/i.test(challengeValue || "")) && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded mt-2 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Der Umfang wirkt breit. Für Sprint-Tempo empfehlen wir die Challenge zu <strong>fokussieren</strong> oder in <strong>Teilvorhaben</strong> zu splitten.</span>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Relevance */}
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

          {/* Target Audience */}
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
                {targetAudienceValue && targetAudienceValue.length > 1 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded mt-2 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Für das Sprint-Tempo empfehlen wir eine <strong>primäre</strong> Zielgruppe.</span>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Consequences */}
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

          {/* Success Criteria */}
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
                  Formulieren Sie ein <strong>testbares</strong> Ergebnis (z. B. Nutzertest eines Klick-Prototyps).
                </FormDescription>
                <FormMessage />
                {successCriteriaValue && !hasKeyword && successCriteriaValue.length >= 20 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Tipp: Benennen Sie ein <strong>testbares</strong> Ergebnis (z. B. Nutzertest eines Klick-Prototyps).</span>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Testable in 5 Days */}
          <FormField
            control={form.control}
            name="testableIn5Days"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  Lässt sich Ihre Idee in 5 Tagen als Prototyp testen? *
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Ja" id="testable-ja" />
                      <Label htmlFor="testable-ja" className="font-normal">Ja</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Teilweise" id="testable-teilweise" />
                      <Label htmlFor="testable-teilweise" className="font-normal">Teilweise</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Nein" id="testable-nein" />
                      <Label htmlFor="testable-nein" className="font-normal">Nein</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Decider Available */}
          <FormField
            control={form.control}
            name="deciderAvailable"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  Steht am Tag 3 eine Entscheidungsperson zur Verfügung? *
                </FormLabel>
                <FormDescription>
                  Eine Person, die finale Entscheidungen treffen kann
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Ja" id="decider-ja" />
                      <Label htmlFor="decider-ja" className="font-normal">Ja</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Nein" id="decider-nein" />
                      <Label htmlFor="decider-nein" className="font-normal">Nein</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* User Access Count */}
          <FormField
            control={form.control}
            name="userAccessCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  Wie viele Nutzer:innen können Sie für Tests erreichen? *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="z.B. 10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
                {userAccessCountValue !== undefined && userAccessCountValue < 5 && userAccessCountValue >= 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded mt-2 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Für Tag 5 empfehlen wir Zugang zu <strong>mindestens 5 Nutzer:innen</strong>.</span>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Impact Scale */}
          <FormField
            control={form.control}
            name="impactScale"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  Geschäftlicher Impact bei Erfolg (1 = gering, 5 = sehr hoch) *
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value || 3]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      className="w-full"
                    />
                    <div className="text-center text-2xl font-bold text-primary">
                      {field.value || 3}
                    </div>
                  </div>
                </FormControl>
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
