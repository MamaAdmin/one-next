import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, Sparkles, Download, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useConnectMiro,
  useCreateCrazy8Board,
  useFetchMiroItems,
  useMiroConnection,
  useSprintMiroBoard,
} from "@/hooks/useMiro";
import type { SprintRow } from "@/features/sprint/types";

interface Props {
  sprint: SprintRow;
  stepKey: string;
  onImportedItems?: (items: string[]) => void;
}

export default function Crazy8sMiro({ sprint, stepKey, onImportedItems }: Props) {
  const connQ = useMiroConnection();
  const boardQ = useSprintMiroBoard(sprint.id, stepKey);
  const connectMut = useConnectMiro();
  const createMut = useCreateCrazy8Board(sprint.id, stepKey);
  const fetchMut = useFetchMiroItems(sprint.id, stepKey);
  const [fullscreen, setFullscreen] = useState(false);

  const isConnected = !!connQ.data;
  const board = boardQ.data;

  async function handleConnect() {
    try {
      await connectMut.mutateAsync();
      toast({ title: "Miro verbunden", description: "Du kannst jetzt ein Crazy-8-Board erstellen." });
    } catch (e) {
      toast({
        title: "Verbindung fehlgeschlagen",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  }

  async function handleCreate() {
    try {
      await createMut.mutateAsync();
      toast({ title: "Board erstellt", description: "Miro-Board mit 8 Feldern ist bereit." });
    } catch (e) {
      toast({
        title: "Board konnte nicht erstellt werden",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  }

  async function handleImport() {
    try {
      const items = await fetchMut.mutateAsync();
      if (items.length === 0) {
        toast({ title: "Keine Sticky Notes gefunden", description: "Füge im Miro-Board Sticky Notes hinzu." });
        return;
      }
      onImportedItems?.(items);
      toast({ title: `${items.length} Einträge importiert`, description: "Als Antworten übernommen." });
    } catch (e) {
      toast({
        title: "Import fehlgeschlagen",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  }

  if (connQ.isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Miro-Status wird geprüft …
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Crazy 8s in Miro skizzieren</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Verbinde einmalig dein Miro-Konto. Danach erstellt one-next pro Sprint automatisch
            ein Board mit 8 Skizzenfeldern, das dein Team gemeinsam bearbeiten kann.
          </p>
          <Button onClick={handleConnect} disabled={connectMut.isPending}>
            {connectMut.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            Mit Miro verbinden
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isModerator = sprint.owner_id !== undefined; // placeholder — access rules handled server-side
  void isModerator;

  if (!board) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-semibold">Crazy-8-Board erstellen</h3>
              <p className="text-sm text-muted-foreground">
                one-next legt ein neues Miro-Board mit 8 nummerierten Feldern für dein Team an.
              </p>
            </div>
            <Badge variant="secondary">Miro verbunden{connQ.data?.miro_name ? ` · ${connQ.data.miro_name}` : ""}</Badge>
          </div>
          <Button onClick={handleCreate} disabled={createMut.isPending} className="bg-gradient-primary hover:opacity-90">
            {createMut.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Board erstellen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={fullscreen ? "fixed inset-0 z-50 rounded-none border-0" : ""}>
      <CardContent className={`p-4 space-y-3 ${fullscreen ? "h-full flex flex-col" : ""}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Crazy 8s – Miro-Board</h3>
            <Badge variant="secondary">8 Felder</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href={board.board_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" /> In Miro öffnen
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={handleImport} disabled={fetchMut.isPending}>
              {fetchMut.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1" />
              )}
              Ergebnisse übernehmen
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setFullscreen((f) => !f)}>
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className={`rounded-md overflow-hidden border ${fullscreen ? "flex-1" : "aspect-video"}`}>
          <iframe
            src={board.embed_url}
            title="Miro Crazy 8s Board"
            className="w-full h-full"
            allow="fullscreen; clipboard-read; clipboard-write"
            allowFullScreen
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Tipp: 8 Minuten Timer starten, 1 Skizze pro Minute, dann „Ergebnisse übernehmen" klicken, um Sticky-Note-Texte
          in one-next zu speichern.
        </p>
      </CardContent>
    </Card>
  );
}
