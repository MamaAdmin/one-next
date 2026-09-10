import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import {
  STYLE_RECOMMENDATIONS,
  WHITEBOARD_STYLES,
  type WhiteboardStyleOption,
} from "@/features/whiteboard/styles";
import { SCRIPT_TYPES } from "@/features/whiteboard/scriptTypes";
import { thumbFor, youtubeId } from "@/features/whiteboard/styleThumbs";

const StyleLibrary = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const [activeStyle, setActiveStyle] = useState<WhiteboardStyleOption | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [isAdmin, loading, navigate]);

  if (loading || !isAdmin) return null;

  const activeVideoId = activeStyle ? youtubeId(activeStyle.beispielUrl) : null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Lernvideos", href: "/admin/whiteboard-videos" }, { label: "Stilbibliothek", active: true }]} />
      <main className="container mx-auto px-6 pt-40 pb-20">
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {WHITEBOARD_STYLES.map((style) => (
              <Card key={style.value} className="flex flex-col overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveStyle(style)}
                  className="group relative block w-full text-left"
                  aria-label={`Beispielvideo für ${style.label} ansehen`}
                >
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={thumbFor(style.value)}
                      alt={`Beispielbild für den Videostil ${style.label}`}
                      loading="lazy"
                      width={1088}
                      height={608}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </AspectRatio>
                  <span className="absolute inset-0 flex items-center justify-center bg-foreground/25 transition-colors group-hover:bg-foreground/40">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/90 shadow-lg">
                      <Play className="h-6 w-6 translate-x-0.5 text-primary" fill="currentColor" />
                    </span>
                  </span>
                </button>
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
                  <Button variant="secondary" size="sm" onClick={() => setActiveStyle(style)}>
                    <Play className="w-4 h-4 mr-2" /> Beispiel ansehen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={!!activeStyle} onOpenChange={(open) => !open && setActiveStyle(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{activeStyle?.label}</DialogTitle>
                <DialogDescription>{activeStyle?.merkmale}</DialogDescription>
              </DialogHeader>
              {activeStyle && activeVideoId ? (
                <AspectRatio ratio={16 / 9}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1`}
                    title={`Beispielvideo: ${activeStyle.label}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full rounded-md border-0"
                  />
                </AspectRatio>
              ) : (
                activeStyle && (
                  <div className="space-y-4">
                    <AspectRatio ratio={16 / 9}>
                      <img
                        src={thumbFor(activeStyle.value)}
                        alt={`Beispielbild für den Videostil ${activeStyle.label}`}
                        className="h-full w-full rounded-md object-cover"
                      />
                    </AspectRatio>
                    <p className="text-sm text-muted-foreground">
                      Für diesen Stil liegt kein direkt abspielbares Video vor. Die Beispiele finden
                      Sie beim Anbieter.
                    </p>
                    <Button asChild>
                      <a href={activeStyle.beispielUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {activeStyle.beispielLabel}
                      </a>
                    </Button>
                  </div>
                )
              )}
            </DialogContent>
          </Dialog>

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
