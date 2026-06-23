import { useState } from "react";
import { useVersionHistory } from "@/hooks/useVersionHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import ReactDiffViewer from "react-diff-viewer-continued";

interface VersionHistoryProps {
  contentType: string;
  contentId: string;
  onRestore?: () => void;
}

export const VersionHistory = ({
  contentType,
  contentId,
  onRestore,
}: VersionHistoryProps) => {
  const { versions, loading, restoreVersion } = useVersionHistory(contentType, contentId);
  const [open, setOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const handleRestore = async (versionId: string) => {
    const success = await restoreVersion(versionId);
    if (success) {
      setOpen(false);
      onRestore?.();
    }
  };

  const toggleCompare = (versionId: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const getVersionContent = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    return version ? JSON.stringify(version.content, null, 2) : "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          Versionen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Versions-Historie</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedVersions([]);
            }}
          >
            {compareMode ? "Vergleichsmodus beenden" : "Versionen vergleichen"}
          </Button>
          
          {compareMode && selectedVersions.length === 2 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedVersions([])}
            >
              Auswahl zurücksetzen
            </Button>
          )}
        </div>

        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="text-center py-4">Lade Versionen...</div>
          ) : compareMode && selectedVersions.length === 2 ? (
            <ReactDiffViewer
              oldValue={getVersionContent(selectedVersions[0])}
              newValue={getVersionContent(selectedVersions[1])}
              splitView={true}
              useDarkTheme={true}
            />
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        Version {version.version_number}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {version.created_at ? format(new Date(version.created_at), "PPp", { locale: de }) : ""}
                      </div>
                      {version.change_summary && (
                        <div className="text-sm mt-1">{version.change_summary}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {compareMode ? (
                        <Button
                          variant={selectedVersions.includes(version.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCompare(version.id)}
                          disabled={
                            !selectedVersions.includes(version.id) &&
                            selectedVersions.length >= 2
                          }
                        >
                          {selectedVersions.includes(version.id) ? "Ausgewählt" : "Auswählen"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(version.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Wiederherstellen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
