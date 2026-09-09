import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { STYLE_RECOMMENDATIONS, WHITEBOARD_STYLES } from "@/features/whiteboard/styles";
import { SCRIPT_TYPES } from "@/features/whiteboard/scriptTypes";

const StyleLibrary = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" asChild className="w-fit">
            <Link to="/admin/whiteboard-videos">
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurück zu den Lernvideos
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Stilbibliothek</CardTitle>
              <CardDescription>
                Übersicht der Videostile mit Merkmalen, Einsatzzweck, passender Skriptart und einem
                Beispielvideo als Referenz.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {WHITEBOARD_STYLES.map((style) => (
              <Card key={style.value} className="flex flex-col">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-xl">{style.label}</CardTitle>
                    <Badge variant={style.generierbar ? "secondary" : "outline"}>
                      {style.generierbar ? "Erzeugbar" : "Nur Vorlage"}
                    </Badge>
                  </div>
                  <CardDescription>{style.merkmale}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Geeignet für: </span>
                    {style.eignung}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Skriptart: </span>
                    {style.skriptart}
                  </p>
                  {!style.generierbar && (
                    <p className="text-muted-foreground">
                      Dieser Stil dient als Vorlage für eine Produktion und wird nicht automatisch
                      erzeugt.
                    </p>
                  )}
                  <a
                    href={style.beispielUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {style.beispielLabel}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcher Stil passt zu meinem Lernziel?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {STYLE_RECOMMENDATIONS.map((row) => (
                <div key={row.lernziel} className="grid md:grid-cols-3 gap-2 border-b pb-3 last:border-0">
                  <span className="font-medium">{row.lernziel}</span>
                  <span>{row.stil}</span>
                  <span className="text-muted-foreground text-sm">{row.warum}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skriptarten</CardTitle>
              <CardDescription>
                Die Skriptart bestimmt die Dramaturgie, nach der die KI das Skript schreibt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SCRIPT_TYPES.map((type) => (
                <div key={type.value} className="grid md:grid-cols-2 gap-2 border-b pb-3 last:border-0">
                  <span className="font-medium">{type.label}</span>
                  <span className="text-muted-foreground text-sm">{type.ablauf}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StyleLibrary;
