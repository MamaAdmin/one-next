import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, ClipboardList, Clock, Mail, Phone, Sparkles, Users } from "lucide-react";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Bitte geben Sie Ihren vollständigen Namen ein."),
  email: z
    .string()
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  company: z
    .string()
    .min(2, "Bitte geben Sie den Namen Ihres Unternehmens ein."),
  role: z
    .string()
    .min(2, "Bitte geben Sie Ihre Rolle oder Funktion an."),
  teamSize: z
    .string({ required_error: "Bitte wählen Sie eine Teamgröße aus." })
    .min(1, "Bitte wählen Sie eine Teamgröße aus."),
  challenge: z
    .string()
    .min(10, "Beschreiben Sie Ihre Challenge mit mindestens 10 Zeichen."),
  preferredStart: z
    .string()
    .min(1, "Bitte geben Sie Ihren gewünschten Starttermin an."),
  goals: z.string().optional(),
  referral: z.string().optional(),
  consent: z
    .boolean()
    .refine((value) => value === true, "Bitte bestätigen Sie die Kontaktaufnahme."),
});

const keyFacts = [
  {
    icon: Clock,
    title: "6-tägiger Prozess",
    description: "Tag 0-5, flexibel remote und async durchführbar.",
  },
  {
    icon: Users,
    title: "Ideale Teamgröße",
    description: "4-7 Personen mit klaren Rollen für maximale Effektivität.",
  },
  {
    icon: Sparkles,
    title: "Digitale Templates",
    description: "Guided Canvas, Automationen und Ergebnis-Report inklusive.",
  },
];

const deliverables = [
  "Guided Workspace mit Templates für jeden Sprint-Tag",
  "Aufgaben- & Fortschrittstracking für das gesamte Team",
  "Automatisierte Einladungen und Meeting-Agenda",
  "Exportfähiger Sprint-Report als PDF",
  "Sofortzugriff auf die Sprint-Plattform nach der Registrierung",
];

const processSteps = [
  {
    title: "Registrierung & Onboarding",
    description: "Teaminformationen teilen, Zugang für alle Teilnehmer:innen erhalten und Kick-off vorbereiten.",
  },
  {
    title: "Vorbereitung & Tag 0",
    description: "Challenge schärfen, Ziele definieren und Stakeholder einbinden – mit Smart Sailboat & Priorisierung.",
  },
  {
    title: "Tage 1-3: Map, Sketch & Decide",
    description: "Gemeinsam Journey Map erstellen, Ideen entwickeln und priorisieren – komplett digital begleitet.",
  },
  {
    title: "Tage 4-5: Prototype & Test",
    description: "Prototyp bauen, User Tests durchführen und Feedback in den Abschlussreport übertragen.",
  },
];

const faqs = [
  {
    question: "Wie schnell erhalte ich Zugang zur Plattform?",
    answer: "Direkt nach der Registrierung erhalten Sie eine Bestätigungs-E-Mail mit allen nächsten Schritten sowie den Zugangslink zur Sprint-Plattform.",
  },
  {
    question: "Braucht mein Team bereits Erfahrung mit Design Sprints?",
    answer: "Nein. Der Online Design Sprint führt Ihr Team Schritt für Schritt durch jeden Tag und liefert alle Templates, Beispiele und Checklisten, die Sie benötigen.",
  },
  {
    question: "Wie flexibel ist der Zeitplan?",
    answer: "Sie können den Sprint sowohl synchron als auch asynchron durchführen. Pausen zwischen den Tagen sind möglich – Ihr Fortschritt bleibt gespeichert.",
  },
  {
    question: "Welche Sprache unterstützt die Plattform?",
    answer: "Die Inhalte und Templates stehen in Deutsch und Englisch zur Verfügung. Geben Sie einfach Ihre Präferenz im Formular an.",
  },
];

const OnlineDesignSprintRegistration = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: "",
      teamSize: "",
      challenge: "",
      preferredStart: "",
      goals: "",
      referral: "",
      consent: false,
    },
  });

  const { isSubmitting } = form.formState;

  const confirmationSummary = useMemo(
    () => [
      "Wir prüfen Ihre Angaben und melden uns mit Terminvorschlägen für das Kick-off.",
      "Sie erhalten alle Zugänge für Ihr gesamtes Team inklusive Onboarding-Guide.",
      "Gemeinsam planen wir Ihren Sprint-Start – inklusive optionaler Experten-Sessions.",
    ],
    [],
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    toast({
      title: "Vielen Dank für Ihre Registrierung!",
      description: "Wir melden uns innerhalb von 24 Stunden mit den nächsten Schritten.",
    });

    console.table(values);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24">
        <section className="relative overflow-hidden py-20 bg-gradient-hero">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 right-24 h-64 w-64 bg-primary/40 blur-3xl rounded-full" />
            <div className="absolute bottom-10 left-10 h-72 w-72 bg-secondary/40 blur-3xl rounded-full" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl space-y-6">
              <Badge className="bg-accent text-accent-foreground w-fit px-4 py-1 text-sm">
                Selbstgeführter Prozess mit Experten-Setup
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold">
                Registrierung für den Online Design Sprint
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Melden Sie Ihr Team an, sichern Sie sich Zugang zur Plattform und starten Sie Ihren Sprint in weniger als 48 Stunden – inklusive digitaler Templates, Onboarding und persönlicher Begleitung.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-gradient-primary text-lg px-6" asChild>
                  <Link to="/ai-design-sprint/setup">Sprint-Team vorbereiten</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-6" asChild>
                  <Link to="/ai-design-sprint">Mehr zur Methode erfahren</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Was Sie erwartet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      Unser Online Design Sprint kombiniert strukturierte Moderation mit flexibler, digitaler Durchführung. Nach Ihrer Registrierung erhalten Sie ein persönliches Onboarding sowie Zugriff auf alle Tools.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {keyFacts.map((fact) => {
                        const Icon = fact.icon;
                        return (
                          <div
                            key={fact.title}
                            className="rounded-2xl border bg-muted/40 p-4 space-y-3"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{fact.title}</h3>
                              <p className="text-sm text-muted-foreground">{fact.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        In Ihrer Registrierung enthalten
                      </h3>
                      <ul className="grid gap-2 text-sm text-muted-foreground">
                        {deliverables.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <ClipboardList className="w-6 h-6 text-primary" />
                      Nächste Schritte nach Ihrer Anmeldung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {confirmationSummary.map((item, index) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">So läuft der Online Sprint ab</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      {processSteps.map((step, index) => (
                        <div key={step.title} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            {index !== processSteps.length - 1 && (
                              <div className="w-px flex-1 bg-border" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="sticky top-28 shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-primary" />
                    Jetzt Team registrieren
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Nach dem Absenden setzen wir uns innerhalb von 24 Stunden mit Ihnen in Verbindung, um Ihren Sprintstart zu planen.
                  </p>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vor- und Nachname *</FormLabel>
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
                              <FormLabel>Geschäftliche E-Mail *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="team@unternehmen.de" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unternehmen *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Unternehmensname" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rolle/Funktion *</FormLabel>
                                <FormControl>
                                  <Input placeholder="z.B. Product Lead" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="teamSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teamgröße *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Bitte auswählen" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="2-3">2-3 Personen</SelectItem>
                                  <SelectItem value="4-5">4-5 Personen</SelectItem>
                                  <SelectItem value="6-7">6-7 Personen</SelectItem>
                                  <SelectItem value="8+">8 oder mehr Personen</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="preferredStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gewünschter Starttermin *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="challenge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kurzbeschreibung Ihrer Challenge *</FormLabel>
                              <FormControl>
                                <Textarea rows={4} placeholder="Woran möchten Sie mit dem Sprint arbeiten?" {...field} />
                              </FormControl>
                              <FormDescription>
                                Nennen Sie uns kurz das Problemfeld, relevante Zielgruppen oder bisherige Hypothesen.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="goals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Wichtigste Ziele für den Sprint</FormLabel>
                              <FormControl>
                                <Textarea rows={3} placeholder="z.B. Nutzerbedürfnisse validieren, Prototyp für Feature erstellen" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="referral"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Wie haben Sie von uns erfahren?</FormLabel>
                              <FormControl>
                                <Input placeholder="Empfehlung, LinkedIn, Podcast, ..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="consent"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <div className="flex items-start gap-3 rounded-lg border border-border/60 p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => field.onChange(checked === true)}
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel className="text-sm font-medium">
                                  Ich bin einverstanden, dass one-next mich zur Planung des Online Design Sprints kontaktiert.
                                </FormLabel>
                                <FormDescription>
                                  Wir nutzen Ihre Angaben ausschließlich für die Abstimmung des Sprints.
                                </FormDescription>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Wird gesendet..." : "Jetzt unverbindlich registrieren"}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-8 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Mail className="w-4 h-4" />
                      online-sprint@one-next.de
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      +49 30 123 456 78
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6 space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <Badge className="bg-primary/10 text-primary px-4 py-1">FAQ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Häufige Fragen zur Registrierung</h2>
              <p className="text-muted-foreground">
                Noch unsicher? Hier beantworten wir die häufigsten Fragen zum Ablauf, zur Plattform und zu den nächsten Schritten.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question} className="border rounded-xl px-4">
                    <AccordionTrigger className="text-left text-lg font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OnlineDesignSprintRegistration;
