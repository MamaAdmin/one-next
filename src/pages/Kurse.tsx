import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { usePublicCourses, useCourseDates, PublicCourse, PublicCourseDate } from "@/hooks/usePublicCourses";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, Clock, Video, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function Kurse() {
  const { courses, loading } = usePublicCourses();
  const [searchParams] = useSearchParams();
  const activeCourses = courses.filter((c) => c.is_active);

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

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Kurse | one-next" description="Entdecken Sie unsere Kursangebote" />
      <Navigation />
      <main className="flex-1 mt-24">
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Unsere Kurse</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie unsere praxisorientierten Kurse und melden Sie sich direkt an.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {activeCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {activeCourses.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              Aktuell sind keine Kurse verfügbar.
            </p>
          )}
        </section>
      </main>
      <Footer isEditMode={false} />
    </div>
  );
}

function CourseCard({ course }: { course: PublicCourse }) {
  const { dates } = useCourseDates(course.id);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const youtubeEmbedUrl = course.youtube_url
    ? course.youtube_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
    : null;

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
        {youtubeEmbedUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <iframe
              src={youtubeEmbedUrl}
              title={course.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl">{course.title}</CardTitle>
          {course.description && (
            <CardDescription className="line-clamp-3">{course.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="text-2xl font-bold text-primary">
            CHF {course.price_chf.toFixed(2)}
          </div>

          {dates.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Nächste Termine
              </h4>
              {dates.slice(0, 3).map((d) => (
                <div key={d.id} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{new Date(d.event_date).toLocaleDateString("de-CH")}</span>
                  <Clock className="h-3 w-3" />
                  <span>{d.start_time}{d.end_time ? ` – ${d.end_time}` : ""}</span>
                  {d.location && (
                    <>
                      <MapPin className="h-3 w-3" />
                      <span>{d.location}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {course.max_participants && (
            <p className="text-sm text-muted-foreground">
              Max. {course.max_participants} Teilnehmer
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setIsRegisterOpen(true)}>
            Jetzt anmelden
          </Button>
        </CardFooter>
      </Card>

      <RegistrationDialog
        course={course}
        dates={dates}
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
      />
    </>
  );
}

function RegistrationDialog({
  course,
  dates,
  open,
  onOpenChange,
}: {
  course: PublicCourse;
  dates: PublicCourseDate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    paymentMethod: "stripe",
    courseDateId: "",
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
          courseId: course.id,
          courseDateId: form.courseDateId || null,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
          company: form.company || null,
          paymentMethod: form.paymentMethod,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Registration error:", error);
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
          <DialogDescription>
            CHF {course.price_chf.toFixed(2)}
          </DialogDescription>
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
                <SelectTrigger>
                  <SelectValue placeholder="Termin wählen" />
                </SelectTrigger>
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
            <RadioGroup
              value={form.paymentMethod}
              onValueChange={(v) => setForm({ ...form, paymentMethod: v })}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="stripe"
                className={`flex items-center gap-2 border rounded-lg p-4 cursor-pointer transition-colors ${
                  form.paymentMethod === "stripe" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <RadioGroupItem value="stripe" id="stripe" />
                <CreditCard className="h-4 w-4" />
                <span>Kreditkarte</span>
              </Label>
              <Label
                htmlFor="twint"
                className={`flex items-center gap-2 border rounded-lg p-4 cursor-pointer transition-colors ${
                  form.paymentMethod === "twint" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <RadioGroupItem value="twint" id="twint" />
                <Smartphone className="h-4 w-4" />
                <span>Twint</span>
              </Label>
            </RadioGroup>
          </div>

          {form.paymentMethod === "twint" && (
            <div className="grid gap-2">
              <Label>Handynummer *</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+41 79 123 45 67"
              />
              <p className="text-xs text-muted-foreground">
                Für die Twint-Zahlung benötigen wir Ihre Handynummer.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird verarbeitet...
              </>
            ) : (
              "Kostenpflichtig anmelden"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
