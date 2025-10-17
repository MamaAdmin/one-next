import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Download, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

interface ArtifactViewerProps {
  artifacts: any[];
  onRefresh: () => void;
}

export function ArtifactViewer({ artifacts, onRefresh }: ArtifactViewerProps) {
  const { toast } = useToast();

  const downloadArtifact = (artifact: any) => {
    const blob = new Blob([artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download gestartet",
      description: `${artifact.title} wurde heruntergeladen.`,
    });
  };

  return (
    <Card className="sticky top-6 h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Artifacts</CardTitle>
          <Button variant="ghost" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {artifacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Noch keine Artifacts generiert</p>
            </div>
          ) : (
            <div className="space-y-3">
              {artifacts.map((artifact) => (
                <Dialog key={artifact.id}>
                  <div className="border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <DialogTrigger asChild>
                          <button className="text-left w-full hover:text-primary transition-colors">
                            <p className="font-medium text-sm truncate">{artifact.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {artifact.agent_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              v{artifact.version} · {new Date(artifact.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </button>
                        </DialogTrigger>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadArtifact(artifact)}
                        className="shrink-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>{artifact.title}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{artifact.content}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => downloadArtifact(artifact)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
