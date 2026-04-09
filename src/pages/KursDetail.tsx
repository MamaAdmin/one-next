import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { usePublicCourses, useCourseDates, PublicCourse, PublicCourseDate } from "@/hooks/usePublicCourses";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CreditCard, Smartphone, Calendar, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function KursDetail() {
  const { slug } = useParams();
  const { courses, loading } = usePublicCourses();
  const [searchParams] = useSearchParams();
  const course = courses.find((c) => c.slug === slug);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Anmeldung erfolgreich! Sie erhalten eine Bestätigung per E-Mail.");
    }
    if (searchParams.get("cancelled") === "true") {
      toast.error("Zahlung abgebrochen.");
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Kurs nicht gefunden.</p>
          <Button variant="outline" asChild>
            <Link to="/kurse">Zurück zur Übersicht</Link>
          </Button>
        </div>
        <Footer isEditMode={false} />
      </div>
    );
  }

  return <CourseDetailView course={course} />;
}

function CourseDetailView({ course }: { course: PublicCourse }) {
  const { dates } = useCourseDates(course.id);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const youtubeEmbedUrl = course.youtube_url
    ? course.youtube_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
    : null;

  const descriptionHtml = course.description_html || "";

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={`${course.title} | one-next`} description={course.description || "Kurs bei one-next"} />
      <Navigation />

      <main className="flex-1 mt-24">
        {/* Hero */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="animate-fade-in">
              <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-4">Kurs</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                  {course.description}
                </p>
              )}
              <div className="flex gap-3 flex-wrap">
                <Button size="lg" onClick={() => setIsRegisterOpen(true)}>
                  Jetzt anmelden →
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/kurse">Alle Kurse</Link>
                </Button>
              </div>
            </div>

            {youtubeEmbedUrl && (
              <div className="animate-fade-in-up">
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-card border border-border">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={course.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
              <div className="py-10 px-8 border-r border-primary-foreground/10">
                <div className="text-4xl font-bold mb-1">CHF {course.price_chf.toFixed(0)}</div>
                <div className="text-sm opacity-60">Kurspreis</div>
              </div>
              <div className="py-10 px-8 border-r border-primary-foreground/10">
                <div className="text-4xl font-bold mb-1">{dates.length}</div>
                <div className="text-sm opacity-60">Termine</div>
              </div>
              {course.max_participants && (
                <div className="py-10 px-8">
                  <div className="text-4xl font-bold mb-1">{course.max_participants}</div>
                  <div className="text-sm opacity-60">Max. Teilnehmer</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Dates */}
        {dates.length > 0 && (
          <section className="bg-secondary/50">
            <div className="container mx-auto px-6 py-16">
              <div className="max-w-5xl mx-auto">
                <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-3">Termine</p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Nächste Kurstermine</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dates.map((d) => (
                    <Card key={d.id} className="border border-border">
                      <CardContent className="p-6">
                        <div className="text-5xl font-bold text-foreground/10 mb-1">
                          {new Date(d.event_date).toLocaleDateString("de-CH", { day: "2-digit" })}
                        </div>
                        <div className="text-lg font-semibold text-foreground mb-3">
                          {new Date(d.event_date).toLocaleDateString("de-CH", { month: "long", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{d.start_time}{d.end_time ? ` – ${d.end_time}` : ""}</span>
                        </div>
                        {d.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{d.location}</span>
                          </div>
                        )}
                        {d.notes && (
                          <p className="text-xs text-muted-foreground/70 mt-3 italic">{d.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        {descriptionHtml && (
          <section className="container mx-auto px-6 py-16">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-3">Kursinhalt</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Was Sie lernen</h2>
              <div
                className="prose prose-neutral max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
          </section>
        )}

        {/* Quote */}
        <section className="bg-accent/30 border-y border-border">
          <div className="max-w-2xl mx-auto text-center py-20 px-6">
            <blockquote className="text-2xl md:text-3xl font-bold text-foreground italic mb-4">
              "Praxisnah, effizient und direkt anwendbar."
            </blockquote>
            <p className="text-sm text-muted-foreground tracking-wide uppercase">Teilnehmer-Feedback</p>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-3">Jetzt starten</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sichern Sie sich Ihren Platz
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg">
              Melden Sie sich jetzt an und profitieren Sie von praxisorientiertem Wissen.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button size="lg" onClick={() => setIsRegisterOpen(true)}>
                Jetzt anmelden →
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/kurse">Alle Kurse</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer isEditMode={false} />

      <RegistrationDialog course={course} dates={dates} open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />
    </div>
  );
}

function RegistrationDialog({
  course, dates, open, onOpenChange,
}: {
  course: PublicCourse; dates: PublicCourseDate[]; open: boolean; onOpenChange: (o: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "",
    paymentMethod: "stripe", courseDateId: "",
  });

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }
    if (form.paymentMethod === "twint" && !form.phone) {
      toast.error("Für Twint-Zahlung wird eine Handynummer benötigt.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-course-registration", {
        body: {
          courseId: course.id, courseDateId: form.courseDateId || null,
          firstName: form.firstName, lastName: form.lastName, email: form.email,
          phone: form.phone || null, company: form.company || null, paymentMethod: form.paymentMethod,
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Anmeldung: {course.title}</DialogTitle>
          <DialogDescription>CHF {course.price_chf.toFixed(2)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Vorname *</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Nachname *</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>E-Mail *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Firma</Label>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          {dates.length > 0 && (
            <div className="grid gap-2">
              <Label>Termin auswählen</Label>
              <Select value={form.courseDateId} onValueChange={(v) => setForm({ ...form, courseDateId: v })}>
                <SelectTrigger><SelectValue placeholder="Termin wählen" /></SelectTrigger>
                <SelectContent>
                  {dates.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {new Date(d.event_date).toLocaleDateString("de-CH")} – {d.start_time}
                      {d.location ? ` (${d.location})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-3">
            <Label>Zahlungsmethode</Label>
            <RadioGroup value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })} className="grid grid-cols-2 gap-4">
              <Label htmlFor="stripe" className={`flex items-center gap-2 border rounded-lg p-4 cursor-pointer transition-colors ${form.paymentMethod === "stripe" ? "border-primary bg-primary/5" : "border-border"}`}>
                <RadioGroupItem value="stripe" id="stripe" />
                <CreditCard className="h-4 w-4" /><span>Kreditkarte</span>
              </Label>
              <Label htmlFor="twint" className={`flex items-center gap-2 border rounded-lg p-4 cursor-pointer transition-colors ${form.paymentMethod === "twint" ? "border-primary bg-primary/5" : "border-border"}`}>
                <RadioGroupItem value="twint" id="twint" />
                <Smartphone className="h-4 w-4" /><span>Twint</span>
              </Label>
            </RadioGroup>
          </div>
          {form.paymentMethod === "twint" && (
            <div className="grid gap-2">
              <Label>Handynummer *</Label>
              <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+41 79 123 45 67" />
              <p className="text-xs text-muted-foreground">Für die Twint-Zahlung benötigen wir Ihre Handynummer.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Wird verarbeitet...</>) : "Kostenpflichtig anmelden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
