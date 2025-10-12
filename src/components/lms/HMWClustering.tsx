import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, GripVertical, RotateCcw, Download, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Cluster {
  id: string;
  name: string;
  questions: string[];
}

interface ClusterData {
  clusters: Cluster[];
}

const HMWClustering = () => {
  const { toast } = useToast();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [unassignedQuestions, setUnassignedQuestions] = useState<string[]>([]);
  const [draggedQuestion, setDraggedQuestion] = useState<{ question: string; sourceId: string } | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<string>("");

  // Load saved questions and clusters on mount
  useEffect(() => {
    const savedQuestions = localStorage.getItem("hmw-questions");
    const savedClusters = localStorage.getItem("hmw-clusters");

    if (savedQuestions) {
      const questions = JSON.parse(savedQuestions);
      
      if (savedClusters) {
        const clusterData: ClusterData = JSON.parse(savedClusters);
        setClusters(clusterData.clusters);
        
        // Find unassigned questions
        const assignedQuestions = new Set(
          clusterData.clusters.flatMap(c => c.questions)
        );
        const unassigned = questions.filter((q: string) => !assignedQuestions.has(q));
        setUnassignedQuestions(unassigned);
      } else {
        // No clusters yet, all questions are unassigned
        setUnassignedQuestions(questions);
      }
    }
  }, []);

  // Save clusters to localStorage
  useEffect(() => {
    if (clusters.length > 0) {
      const clusterData: ClusterData = { clusters };
      localStorage.setItem("hmw-clusters", JSON.stringify(clusterData));
    }
  }, [clusters]);

  const addCluster = () => {
    if (clusters.length >= 10) {
      toast({
        title: "Maximum erreicht",
        description: "Du kannst maximal 10 Cluster erstellen.",
        variant: "destructive",
      });
      return;
    }

    const newCluster: Cluster = {
      id: `cluster-${Date.now()}`,
      name: "",
      questions: [],
    };
    setClusters([...clusters, newCluster]);
  };

  const deleteCluster = (clusterId: string) => {
    const cluster = clusters.find(c => c.id === clusterId);
    if (cluster) {
      // Move questions back to unassigned
      setUnassignedQuestions([...unassignedQuestions, ...cluster.questions]);
      setClusters(clusters.filter(c => c.id !== clusterId));
      toast({
        title: "Cluster gelöscht",
        description: `${cluster.questions.length} Frage(n) zu "Nicht zugeordnet" verschoben.`,
      });
    }
  };

  const updateClusterName = (clusterId: string, name: string) => {
    setClusters(clusters.map(c => 
      c.id === clusterId ? { ...c, name } : c
    ));
  };

  const handleDragStart = (question: string, sourceId: string) => {
    setDraggedQuestion({ question, sourceId });
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    if (!draggedQuestion) return;
    e.preventDefault();
    setActiveDropZone(targetId);
  };

  const handleDragLeave = () => {
    setActiveDropZone("");
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!draggedQuestion) return;
    e.preventDefault();

    const { question, sourceId } = draggedQuestion;

    // Don't do anything if dropping in the same place
    if (sourceId === targetId) {
      setDraggedQuestion(null);
      setActiveDropZone("");
      return;
    }

    // Remove from source
    if (sourceId === "unassigned") {
      setUnassignedQuestions(unassignedQuestions.filter(q => q !== question));
    } else {
      setClusters(clusters.map(c => 
        c.id === sourceId 
          ? { ...c, questions: c.questions.filter(q => q !== question) }
          : c
      ));
    }

    // Add to target
    if (targetId === "unassigned") {
      setUnassignedQuestions([...unassignedQuestions, question]);
    } else {
      setClusters(clusters.map(c => 
        c.id === targetId 
          ? { ...c, questions: [...c.questions, question] }
          : c
      ));
    }

    setDraggedQuestion(null);
    setActiveDropZone("");
  };

  const resetAll = () => {
    // Move all questions back to unassigned
    const allQuestions = [
      ...unassignedQuestions,
      ...clusters.flatMap(c => c.questions)
    ];
    setUnassignedQuestions(allQuestions);
    setClusters(clusters.map(c => ({ ...c, questions: [] })));
    toast({
      title: "Zurückgesetzt",
      description: "Alle Fragen wurden zu 'Nicht zugeordnet' verschoben.",
    });
  };

  const exportClusters = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      clusters: clusters.map(c => ({
        name: c.name || "Unbenannt",
        questions: c.questions,
      })),
      unassigned: unassignedQuestions,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hmw-clusters-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportiert",
      description: "Deine Cluster wurden als JSON heruntergeladen.",
    });
  };

  const ClusterColumn = ({ 
    cluster, 
    isUnassigned = false 
  }: { 
    cluster?: Cluster; 
    isUnassigned?: boolean;
  }) => {
    const id = isUnassigned ? "unassigned" : cluster!.id;
    const name = isUnassigned ? "Nicht zugeordnet" : cluster!.name || "Unbenannt";
    const questions = isUnassigned ? unassignedQuestions : cluster!.questions;
    const isActive = activeDropZone === id;

    return (
      <Card 
        className={`min-w-[280px] max-w-[280px] flex-shrink-0 transition-colors ${
          isActive ? "border-primary bg-primary/5" : ""
        }`}
        onDragOver={(e) => handleDragOver(e, id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, id)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="truncate">{name}</span>
            <Badge variant="secondary">{questions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {questions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Ziehe Fragen hierher
                </div>
              ) : (
                questions.map((question, index) => (
                  <div
                    key={`${id}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(question, id)}
                    className="group cursor-move"
                  >
                    <Card className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-sm flex-1 line-clamp-3">{question}</p>
                      </div>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={addCluster} disabled={clusters.length >= 10}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Cluster
          </Button>
          <Button onClick={resetAll} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Alle zurücksetzen
          </Button>
          <Button onClick={exportClusters} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportieren
          </Button>
        </div>
        {clusters.length >= 10 && (
          <p className="text-sm text-muted-foreground">
            Maximum von 10 Clustern erreicht
          </p>
        )}
      </div>

      {/* Cluster Name Management */}
      {clusters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cluster-Namen</CardTitle>
            <CardDescription>
              Gib deinen Clustern aussagekräftige Namen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="flex gap-2">
                  <Input
                    placeholder="Cluster-Name..."
                    value={cluster.name}
                    onChange={(e) => updateClusterName(cluster.id, e.target.value)}
                    autoComplete="off"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCluster(cluster.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Unassigned Column */}
          <ClusterColumn isUnassigned />

          {/* Cluster Columns */}
          {clusters.map((cluster) => (
            <ClusterColumn key={cluster.id} cluster={cluster} />
          ))}

          {/* Empty state when no clusters */}
          {clusters.length === 0 && (
            <Card className="min-w-[280px] max-w-[280px] flex-shrink-0">
              <CardHeader>
                <CardTitle className="text-lg">Erstelle einen Cluster</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Klicke auf "Neuer Cluster" um deine erste Kategorie zu erstellen
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HMWClustering;
