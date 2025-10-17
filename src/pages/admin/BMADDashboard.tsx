import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowLeft, Bot, Sparkles, CheckCircle, Clock, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function BMADDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | 'planning' | 'development' | 'completed' | 'archived'>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    project_context: "",
  });

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ["bmad-sessions", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("bmad_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createSession = async () => {
    if (!newSession.title || !newSession.project_context) {
      toast({
        title: "Fehlende Informationen",
        description: "Bitte füllen Sie Titel und Projekt-Kontext aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht authentifiziert");

      const { data, error } = await supabase
        .from("bmad_sessions")
        .insert({
          ...newSession,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Session erstellt",
        description: "Ihre BMAD-Session wurde erfolgreich erstellt.",
      });

      setIsCreateOpen(false);
      setNewSession({ title: "", description: "", project_context: "" });
      refetch();
      navigate(`/admin/bmad/sessions/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Clock className="h-4 w-4" />;
      case 'development':
        return <Sparkles className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'archived':
        return <Archive className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return "bg-blue-500";
      case 'development':
        return "bg-purple-500";
      case 'completed':
        return "bg-green-500";
      case 'archived':
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const calculateProgress = (currentPhase: string) => {
    const phases = ['business_analyst', 'product_manager', 'ux_expert', 'product_owner', 'architect', 'scrum_master'];
    const index = phases.indexOf(currentPhase);
    return index >= 0 ? ((index + 1) / phases.length) * 100 : 0;
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Bot className="h-10 w-10 text-primary" />
            BMAD Method
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-gestützte Produktentwicklung mit orchestrierten Agenten
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Neue Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neue BMAD Session erstellen</DialogTitle>
              <DialogDescription>
                Starten Sie eine neue AI-gestützte Entwicklungssession mit der BMAD-Methode.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Projekt-Titel *</Label>
                <Input
                  id="title"
                  placeholder="z.B. Mobile Banking App"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Kurzbeschreibung</Label>
                <Input
                  id="description"
                  placeholder="Optionale Kurzbeschreibung"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="context">Projekt-Kontext *</Label>
                <Textarea
                  id="context"
                  placeholder="Beschreiben Sie das Projekt, Ziele, Zielgruppe, Herausforderungen..."
                  rows={6}
                  value={newSession.project_context}
                  onChange={(e) => setNewSession({ ...newSession, project_context: e.target.value })}
                />
              </div>
              <Button onClick={createSession} className="w-full">
                Session erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
          <TabsTrigger value="archived">Archiviert</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Lade Sessions...</p>
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Keine Sessions vorhanden</h3>
            <p className="text-muted-foreground mb-6">
              Erstellen Sie Ihre erste BMAD-Session, um zu beginnen.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2" />
              Erste Session erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/admin/bmad/sessions/${session.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{session.title}</CardTitle>
                    {session.description && (
                      <CardDescription>{session.description}</CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {getStatusIcon(session.status)}
                    <span className="ml-1 capitalize">{session.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Aktuelle Phase:</span>
                      <span className="font-medium">
                        {session.current_phase.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Progress value={calculateProgress(session.current_phase)} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Erstellt: {new Date(session.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
