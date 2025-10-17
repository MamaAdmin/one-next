import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FolderTree, Loader2, CheckCircle, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

interface DevelopmentPhaseProps {
  session: any;
  artifacts: any[];
  generateStoryFiles: () => Promise<any>;
  flattenRepo: () => Promise<any>;
  isRunning: boolean;
  refresh: () => void;
}

export function DevelopmentPhase({ session, artifacts, generateStoryFiles, flattenRepo, isRunning, refresh }: DevelopmentPhaseProps) {
  const { toast } = useToast();
  
  const storyFileArtifact = artifacts.find(a => a.artifact_type === 'story_file');
  const flattenedRepoArtifact = artifacts.find(a => a.artifact_type === 'flattened_repo');

  const downloadArtifact = (artifact: any, filename: string) => {
    const blob = new Blob([artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download gestartet",
      description: `${filename} wurde heruntergeladen.`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎉 Agentic Planning abgeschlossen!</CardTitle>
          <CardDescription>
            Alle 6 Agenten haben ihre Analyse abgeschlossen. Sie befinden sich jetzt in der Development Phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Story Files generieren
                </CardTitle>
                <CardDescription>
                  Erstellen Sie entwickler-freundliche Story Files aus allen Agent-Outputs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {storyFileArtifact ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Story Files generiert</span>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            Anzeigen
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Developer Story Files</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh] pr-4">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{storyFileArtifact.content}</ReactMarkdown>
                            </div>
                          </ScrollArea>
                          <div className="flex justify-end pt-4 border-t">
                            <Button onClick={() => downloadArtifact(storyFileArtifact, 'story-files.md')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline"
                        onClick={() => downloadArtifact(storyFileArtifact, 'story-files.md')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button 
                    onClick={generateStoryFiles}
                    disabled={isRunning}
                    className="w-full"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generiere...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Story Files generieren
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  Repository Flattener
                </CardTitle>
                <CardDescription>
                  Analysieren Sie die aktuelle Projekt-Struktur für Context-Engineering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {flattenedRepoArtifact ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Repository analysiert</span>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            Anzeigen
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Repository Context & Structure</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh] pr-4">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{flattenedRepoArtifact.content}</ReactMarkdown>
                            </div>
                          </ScrollArea>
                          <div className="flex justify-end pt-4 border-t">
                            <Button onClick={() => downloadArtifact(flattenedRepoArtifact, 'repo-context.md')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline"
                        onClick={() => downloadArtifact(flattenedRepoArtifact, 'repo-context.md')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button 
                    onClick={flattenRepo}
                    disabled={isRunning}
                    className="w-full"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analysiere...
                      </>
                    ) : (
                      <>
                        <FolderTree className="mr-2 h-4 w-4" />
                        Repository analysieren
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alle Planning Artifacts</CardTitle>
          <CardDescription>
            Die Outputs aller 6 Agenten aus der Planning Phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {artifacts
              .filter(a => a.artifact_type !== 'story_file' && a.artifact_type !== 'flattened_repo')
              .map((artifact) => (
                <Dialog key={artifact.id}>
                  <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                    <DialogTrigger asChild>
                      <button className="text-left w-full">
                        <p className="font-medium mb-1">{artifact.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {artifact.agent_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </button>
                    </DialogTrigger>
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
                  </DialogContent>
                </Dialog>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
