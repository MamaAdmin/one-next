import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, Plus, LogOut, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface BMADSession {
  id: string;
  title: string;
  description: string | null;
  status: string;
  current_phase: string;
  created_at: string;
  updated_at: string;
}

const BMADDashboard = () => {
  const [sessions, setSessions] = useState<BMADSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionDescription, setNewSessionDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/bmad/login");
        return;
      }

      // Check if user has bmad_user or admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["bmad_user", "admin"]);

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        navigate("/bmad/login");
        return;
      }

      setUser(user);
      fetchSessions(user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchSessions = async (userId: string) => {
    const { data, error } = await supabase
      .from("bmad_sessions")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Fehler",
        description: "Sessions konnten nicht geladen werden.",
        variant: "destructive",
      });
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    const { data, error } = await supabase
      .from("bmad_sessions")
      .insert({
        title: newSessionTitle.trim(),
        description: newSessionDescription.trim() || null,
        created_by: user.id,
        status: "planning",
        current_phase: "business_analyst",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Fehler",
        description: "Session konnte nicht erstellt werden: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolgreich",
        description: "Session wurde erstellt.",
      });
      setCreateDialogOpen(false);
      setNewSessionTitle("");
      setNewSessionDescription("");
      // Navigate to the new session
      navigate(`/bmad/session/${data.id}`);
    }

    setCreating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/bmad/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-500/10 text-blue-500";
      case "development":
        return "bg-green-500/10 text-green-500";
      case "completed":
        return "bg-primary/10 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planning":
        return "In Planung";
      case "development":
        return "In Entwicklung";
      case "completed":
        return "Abgeschlossen";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">BMAD Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Abmelden
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Meine Sessions</h2>
            <p className="text-muted-foreground">
              Verwalten Sie Ihre BMAD-Planungssessions
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Neue Session
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Keine Sessions vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihre erste BMAD-Session, um loszulegen.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Erste Session erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/bmad/session/${session.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-1">{session.title}</CardTitle>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusLabel(session.status)}
                    </Badge>
                  </div>
                  {session.description && (
                    <CardDescription className="line-clamp-2">
                      {session.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{session.current_phase}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(session.updated_at), "d. MMM", { locale: de })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Session Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue BMAD Session erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine neue Planungssession für Ihr Projekt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                placeholder="z.B. Neue App für Kundenmanagement"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Kurze Beschreibung des Projekts..."
                value={newSessionDescription}
                onChange={(e) => setNewSessionDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateSession} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Erstellen...
                </>
              ) : (
                "Session erstellen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BMADDashboard;
