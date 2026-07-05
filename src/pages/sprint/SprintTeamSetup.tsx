import { Link, useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useSprint } from "@/hooks/useSprint";
import { TeamRoleGrid } from "@/components/sprint/TeamRoleGrid";
import { useFramingBySprint } from "@/hooks/useFraming";

export default function SprintTeamSetup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sprintQ = useSprint(id);
  const framingQ = useFramingBySprint(id);

  const sprint = sprintQ.data;

  if (sprintQ.isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Wird geladen …
        </div>
        <Footer />
      </>
    );
  }

  if (!sprint || !id) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-6 py-20 max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">Sprint nicht gefunden</h1>
          <Button asChild>
            <Link to="/sprint">Zur Übersicht</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  function goToFraming() {
    if (framingQ.data?.id) {
      navigate(`/sprint/framing/${framingQ.data.id}`);
    } else {
      navigate("/sprint");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navigation />

      <main className="flex-1 container mx-auto px-6 py-10 lg:py-16 max-w-5xl">
        <Link to="/sprint" className="text-sm text-muted-foreground hover:underline">
          ← Sprint-Übersicht
        </Link>

        <div className="mt-3 mb-8">
          <Badge variant="secondary" className="mb-2">
            <Users className="w-3 h-3 mr-1" /> Team-Konstellation
          </Badge>
          <h1 className="text-3xl font-bold">Team zusammenstellen</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Du bist der Moderator dieses Sprints und lädst dein Team per E-Mail ein. Ein Decider
            wird empfohlen. Eine Person kann mehrere Rollen halten – dann trage sie für jede Rolle
            einzeln ein.
          </p>
        </div>

        <TeamRoleGrid sprintId={id} emphasizeDeciderMissing={false} />

        <Card className="mt-8 border-none shadow-sm">
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground max-w-md">
              Team kann später auf der Kickoff-Seite noch ergänzt werden. Weiter geht’s mit dem
              Problem Framing – dort schärft ihr die Herausforderung.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/sprint">Später</Link>
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90" onClick={goToFraming}>
                Weiter zum Problem Framing
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
