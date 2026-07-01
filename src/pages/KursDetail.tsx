import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { usePublicCourses, useCourseDates, PublicCourse, PublicCourseDate } from "@/hooks/usePublicCourses";
import { usePublicCourseModules } from "@/hooks/usePublicCourseModules";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { PublicCourseView } from "@/components/course/PublicCourseView";

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
  const { modules } = usePublicCourseModules(course.id);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={`${course.title} | one-next`} description={course.description || "Kurs bei one-next"} />
      <Navigation />
      <main className="flex-1 mt-24">
        <PublicCourseView
          course={course}
          dates={dates}
          modules={modules}
          primaryCta={{ label: "Jetzt anmelden →", onClick: () => setIsRegisterOpen(true) }}
        />
      </main>
      <Footer isEditMode={false} />
      <RegistrationDialog course={course} dates={dates} open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />
    </div>
  );
}

/* ──── Registration Dialog ──── */

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
      if (error) {
        console.error("Registration edge function error:", error);
        throw error;
      }
      if (data?.error) {
        console.error("Registration API error:", data.error);
        toast.error(data.error);
        return;
      }
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      console.error("Registration error details:", err);
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
