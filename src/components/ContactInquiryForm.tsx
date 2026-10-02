import { useState, type FormEvent } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { submitContactInquiry } from "@/services/ContactInquiry";

const SERVICE_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Der one-next-Prozess",
    items: [
      "Problem Framing",
      "Design Sprint (moderiert)",
      "Online Sprint-Tool",
      "KI-Arbeitsablauf entwickeln",
      "Wirkung messen und skalieren",
    ],
  },
  { title: "Begleitende Bausteine", items: ["KI-Beratung", "Datenqualitäts-Audit"] },
  { title: "Weiteres", items: ["Kurse und Schulungen", "Noch unklar – bitte beraten"] },
];

const TIMINGS = ["So bald wie möglich", "In den nächsten 3 Monaten", "In 3 bis 6 Monaten", "Noch offen"];

const schema = z.object({
  name: z.string().trim().min(1, "Bitte Namen angeben").max(100),
  email: z.string().trim().email("Bitte gültige E-Mail angeben").max(255),
  company: z.string().trim().max(150),
  services: z.array(z.string()).min(1, "Bitte mindestens eine Leistung wählen"),
  timing: z.string().max(100),
  message: z.string().trim().min(1, "Bitte kurz Ihr Anliegen beschreiben").max(2000),
});

const empty = { name: "", email: "", company: "", services: [] as string[], timing: "", message: "", website: "" };

export function ContactInquiryForm() {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggle = (service: string) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(service) ? f.services.filter((s) => s !== service) : [...f.services, service],
    }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach((i) => { next[String(i.path[0])] ??= i.message; });
      setErrors(next);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      await submitContactInquiry(form);
      setSent(true);
      setForm(empty);
    } catch {
      toast({ title: "Senden fehlgeschlagen", description: "Bitte versuchen Sie es erneut oder schreiben Sie an info@one-next.com.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-border p-6">
        <CheckCircle2 className="mb-3 h-8 w-8 text-primary" />
        <h3 className="mb-2 text-xl font-semibold">Vielen Dank für Ihre Anfrage</h3>
        <p className="mb-4 text-muted-foreground">Wir melden uns innerhalb von zwei Arbeitstagen bei Ihnen.</p>
        <Button variant="outline" onClick={() => setSent(false)}>Weitere Anfrage senden</Button>
      </div>
    );
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-sm text-destructive">{errors[k]}</p>;

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ci-name">Name *</Label>
          <Input id="ci-name" className="mt-2" value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ihr Name" />
          {err("name")}
        </div>
        <div>
          <Label htmlFor="ci-email">E-Mail *</Label>
          <Input id="ci-email" type="email" className="mt-2" value={form.email} maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ihre@firma.ch" />
          {err("email")}
        </div>
      </div>
      <div>
        <Label htmlFor="ci-company">Unternehmen</Label>
        <Input id="ci-company" className="mt-2" value={form.company} maxLength={150} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Name Ihres Unternehmens" />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Wofür interessieren Sie sich? *</legend>
        <div className="mt-3 space-y-4">
          {SERVICE_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{group.title}</p>
              <div className="grid gap-2">
                {group.items.map((service) => {
                  const id = `ci-${service.replace(/\W+/g, "-")}`;
                  return (
                    <label key={service} htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
                      <Checkbox id={id} checked={form.services.includes(service)} onCheckedChange={() => toggle(service)} />
                      {service}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {err("services")}
      </fieldset>

      <div>
        <Label>Gewünschter Zeitrahmen</Label>
        <Select value={form.timing} onValueChange={(v) => setForm({ ...form, timing: v })}>
          <SelectTrigger className="mt-2"><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
          <SelectContent>
            {TIMINGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="ci-message">Ihr Anliegen *</Label>
        <Textarea id="ci-message" className="mt-2" rows={5} maxLength={2000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Beschreiben Sie kurz Ihre Ausgangslage und Ihr Ziel." />
        {err("message")}
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />

      <Button type="submit" className="w-full" disabled={sending}>
        {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Anfrage senden
      </Button>
    </form>
  );
}
