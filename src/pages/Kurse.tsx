import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { usePublicCourses, useCourseDates, PublicCourse } from "@/hooks/usePublicCourses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Kurse() {
  const { courses, loading } = usePublicCourses();
  const [searchParams] = useSearchParams();
  const activeCourses = courses.filter((c) => c.is_active);

  useEffect(() => {
    if (searchParams.get("success") === "true") toast.success("Anmeldung erfolgreich!");
    if (searchParams.get("cancelled") === "true") toast.error("Zahlung abgebrochen.");
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
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
            <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-4">Kursangebot</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Unsere Kurse
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie unsere praxisorientierten Kurse und melden Sie sich direkt an.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {activeCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {activeCourses.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Aktuell sind keine Kurse verfügbar.</p>
          )}
        </section>
      </main>
      <Footer isEditMode={false} />
    </div>
  );
}

function CourseCard({ course }: { course: PublicCourse }) {
  const { dates } = useCourseDates(course.id);
  const slug = course.slug || course.id;

  return (
    <Link to={`/kurse/${slug}`} className="group block">
      <Card className="h-full border border-border hover:shadow-hover transition-all duration-300">
        <CardContent className="p-8 flex flex-col h-full">
          <p className="text-xs font-medium tracking-[0.1em] uppercase text-muted-foreground mb-2">
            Kurs
          </p>
          <h3 className="text-xl font-bold text-foreground mb-3 group-hover:opacity-70 transition-opacity">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
              {course.description}
            </p>
          )}
          <div className="mt-auto">
            <span className="text-2xl font-bold text-foreground">
              CHF {course.price_chf.toFixed(0)}
            </span>
            {dates.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{dates.length} Termin{dates.length > 1 ? "e" : ""}</span>
                <span>·</span>
                <span>{new Date(dates[0].event_date).toLocaleDateString("de-CH")}</span>
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" size="sm" className="pointer-events-none">
                Details →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
