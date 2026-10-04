import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageLibraryGrid } from "@/components/admin/ImageLibraryGrid";
import { PromptLibraryManager } from "@/components/admin/PromptLibraryManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { deleteLibraryImage, type LibraryImage } from "@/services/ImageLibrary";

const ImageLibrary = () => {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const [active, setActive] = useState<LibraryImage | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/auth");
  }, [loading, isAdmin, navigate]);

  const qc = useQueryClient();
  const remove = async (img: LibraryImage) => {
    if (!window.confirm("Dieses nicht verwendete Bild endgültig löschen?")) return;
    try {
      await deleteLibraryImage(img);
      toast({ title: "Bild gelöscht" });
      void qc.invalidateQueries({ queryKey: ["image-library"] });
    } catch {
      toast({ title: "Löschen fehlgeschlagen", variant: "destructive" });
    }
  };

  const copy = (url: string) => {
    void navigator.clipboard.writeText(url);
    toast({ title: "Link kopiert" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 pb-16 pt-28">
        <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Bildbibliothek" }]} />
        <h1 className="mb-2 mt-4 text-3xl font-bold">Bildbibliothek</h1>
        <p className="mb-8 max-w-2xl text-muted-foreground">
          Alle erzeugten Zeichnungen und hochgeladenen Referenzbilder. Im Video-Editor lässt sich jedes Bild über
          «Aus Bibliothek wählen» als Referenzbild für ein neues Video verwenden.
        </p>
        <Tabs defaultValue="bilder">
          <TabsList className="mb-6">
            <TabsTrigger value="bilder">Bilder</TabsTrigger>
            <TabsTrigger value="vorgaben">Bildvorgaben</TabsTrigger>
          </TabsList>
          <TabsContent value="bilder">
        <ImageLibraryGrid
          onSelect={setActive}
          showUsage
          renderActions={(img, used) => (
            <div className="flex flex-wrap gap-1">
              <Button variant="ghost" size="sm" className="-ml-2" onClick={() => copy(img.url)}>
                <Copy className="mr-2 h-3.5 w-3.5" /> Link kopieren
              </Button>
              {!used && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => void remove(img)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Löschen
                </Button>
              )}
            </div>
          )}
        />
          </TabsContent>
          <TabsContent value="vorgaben">
            <PromptLibraryManager />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{active?.video_title ?? "Bild"}</DialogTitle>
            <DialogDescription>{active?.prompt ?? "Ohne Bildbeschreibung"}</DialogDescription>
          </DialogHeader>
          {active && (
            <>
              <img src={active.url} alt={active.prompt ?? "Bild"} className="w-full rounded-md" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => copy(active.url)}>
                  <Copy className="mr-2 h-4 w-4" /> Link kopieren
                </Button>
                <Button variant="outline" asChild>
                  <a href={active.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> In neuem Tab öffnen
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageLibrary;
