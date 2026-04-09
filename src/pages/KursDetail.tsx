import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import Footer from "@/components/Footer";
import { usePublicCourses, useCourseDates, PublicCourse, PublicCourseDate } from "@/hooks/usePublicCourses";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, Smartphone } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--course-cream))" }}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "hsl(var(--course-cream))" }}>
        <p className="text-lg" style={{ color: "hsl(var(--course-muted))" }}>Kurs nicht gefunden.</p>
        <Link to="/kurse" className="kurs-btn kurs-btn-outline">Zurück zur Übersicht</Link>
      </div>
    );
  }

  return <CourseDetailView course={course} />;
}

function CourseDetailView({ course }: { course: PublicCourse }) {
  const { dates } = useCourseDates(course.id);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [openModule, setOpenModule] = useState(0);

  // Parse description_html for structured content, or use description
  const descriptionHtml = course.description_html || "";

  const youtubeEmbedUrl = course.youtube_url
    ? course.youtube_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
    : null;

  // Fade-in on scroll
  const fadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("kurs-fade-in"); io.unobserve(e.target); } }),
      { threshold: 0.07 }
    );
    fadeRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const setFadeRef = (i: number) => (el: HTMLDivElement | null) => { fadeRefs.current[i] = el; };

  return (
    <div className="kurs-page">
      <SEO title={`${course.title} | one-next`} description={course.description || "Kurs bei one-next"} />

      {/* Nav */}
      <nav className="kurs-nav">
        <Link to="/" className="kurs-nav-logo">
          <span className="h-6 w-6 rounded-full bg-foreground inline-block" />
        </Link>
        <span className="kurs-nav-tag">Kurs · one-next</span>
      </nav>

      {/* Hero */}
      <div className="kurs-hero kurs-fade" ref={setFadeRef(0)}>
        <div className="kurs-hero-left">
          <h1>{course.title}</h1>
          {course.description && <p>{course.description}</p>}
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setIsRegisterOpen(true)} className="kurs-btn kurs-btn-dark">
              Jetzt anmelden →
            </button>
            <Link to="/kurse" className="kurs-btn kurs-btn-outline">Alle Kurse</Link>
          </div>
        </div>
        {youtubeEmbedUrl && (
          <div className="kurs-hero-right">
            <div className="aspect-video w-full max-w-[480px] rounded-lg overflow-hidden">
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

      {/* Stat strip */}
      <div className="kurs-stat-strip kurs-fade" ref={setFadeRef(1)}>
        <div className="kurs-stat-item">
          <div className="kurs-stat-val">CHF {course.price_chf.toFixed(0)}</div>
          <div className="kurs-stat-lbl">Kurspreis</div>
        </div>
        <div className="kurs-stat-item">
          <div className="kurs-stat-val">{dates.length}</div>
          <div className="kurs-stat-lbl">Termine</div>
        </div>
        {course.max_participants && (
          <div className="kurs-stat-item">
            <div className="kurs-stat-val">{course.max_participants}</div>
            <div className="kurs-stat-lbl">Max. Teilnehmer</div>
          </div>
        )}
      </div>

      {/* Dates section */}
      {dates.length > 0 && (
        <div className="kurs-section-bg-cream2">
          <div className="kurs-section kurs-fade" ref={setFadeRef(2)}>
            <div className="kurs-section-label">Termine</div>
            <h2>Nächste <em>Kurstermine</em></h2>
            <div className="kurs-dates-grid">
              {dates.map((d, i) => (
                <div key={d.id} className={`kurs-date-card ${i % 3 === 0 ? "kurs-mc-rose" : i % 3 === 1 ? "kurs-mc-sage" : "kurs-mc-cream2"}`}>
                  <div className="kurs-date-day">
                    {new Date(d.event_date).toLocaleDateString("de-CH", { day: "2-digit" })}
                  </div>
                  <div className="kurs-date-month">
                    {new Date(d.event_date).toLocaleDateString("de-CH", { month: "long", year: "numeric" })}
                  </div>
                  <div className="kurs-date-time">
                    {d.start_time}{d.end_time ? ` – ${d.end_time}` : ""}
                  </div>
                  {d.location && <div className="kurs-date-location">{d.location}</div>}
                  {d.notes && <div className="kurs-date-notes">{d.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Description / Content */}
      {descriptionHtml && (
        <div className="kurs-section kurs-fade" ref={setFadeRef(3)}>
          <div className="kurs-section-label">Kursinhalt</div>
          <h2>Was du <em>lernst</em></h2>
          <div className="kurs-content-html" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </div>
      )}

      {/* Quote */}
      <div className="kurs-section-bg-rose">
        <div className="kurs-quote kurs-fade" ref={setFadeRef(4)}>
          <blockquote>"Praxisnah, effizient und direkt anwendbar."</blockquote>
          <div className="kurs-quote-attr">Teilnehmer-Feedback</div>
        </div>
      </div>

      {/* CTA */}
      <div className="kurs-cta kurs-fade" ref={setFadeRef(5)}>
        <div className="kurs-section-label">Jetzt starten</div>
        <h2>Sichern Sie sich<br /><em>Ihren Platz</em></h2>
        <p>Melden Sie sich jetzt an und profitieren Sie von praxisorientiertem Wissen.</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setIsRegisterOpen(true)} className="kurs-btn kurs-btn-dark">
            Jetzt anmelden →
          </button>
          <Link to="/kurse" className="kurs-btn kurs-btn-outline">Alle Kurse</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="kurs-footer">
        <Link to="/" className="font-medium" style={{ color: "hsl(var(--course-dark))" }}>one-next</Link>
        <span>© {new Date().getFullYear()} one-next. Alle Rechte vorbehalten.</span>
      </footer>

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
          <button onClick={handleSubmit} disabled={isLoading} className="kurs-btn kurs-btn-dark w-full justify-center">
            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Wird verarbeitet...</>) : "Kostenpflichtig anmelden"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
