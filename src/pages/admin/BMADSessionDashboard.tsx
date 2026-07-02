import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useBMADSessions } from "@/hooks/useBMADSessions";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BMADSessionDetailsDialog } from "@/components/admin/BMADSessionDetailsDialog";
import { BMADInfo } from "@/components/admin/BMADInfo";
import { BMADSessionCreator } from "@/components/admin/BMADSessionCreator";
import { Home, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { 
  AnalystIcon,
  ManagerIcon,
  UXIcon,
  OwnerIcon,
  ArchitectIcon,
  ScrumIcon,
  DeveloperIcon,
  QAIcon,
  OrchestratorIcon,
  BMADSessionIcon
} from "@/components/ui/custom-icons";
import { BMADBreadcrumb } from "@/components/admin/BMADBreadcrumb";

const getAgentIcon = (phase: string) => {
  const iconProps = { className: "w-5 h-5" };
  switch (phase) {
    case "business_analyst":
      return <AnalystIcon {...iconProps} />;
    case "product_manager":
      return <ManagerIcon {...iconProps} />;
    case "ux_expert":
      return <UXIcon {...iconProps} />;
    case "product_owner":
      return <OwnerIcon {...iconProps} />;
    case "architect":
      return <ArchitectIcon {...iconProps} />;
    case "scrum_master":
      return <ScrumIcon {...iconProps} />;
    case "developer":
      return <DeveloperIcon {...iconProps} />;
    case "qa_tester":
      return <QAIcon {...iconProps} />;
    case "orchestrator":
      return <OrchestratorIcon {...iconProps} />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "development":
      return "bg-primary";
    case "planning":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "planning":
      return "Planung";
    case "development":
      return "Entwicklung";
    case "completed":
      return "Abgeschlossen";
    default:
      return status;
  }
};

const getPhaseLabel = (phase: string) => {
  switch (phase) {
    case "business_analyst":
      return "Business Analyst";
    case "product_manager":
      return "Product Manager";
    case "ux_expert":
      return "UX Expert";
    case "product_owner":
      return "Product Owner";
    case "architect":
      return "Architect";
    case "scrum_master":
      return "Scrum Master";
    case "developer":
      return "Developer";
    case "qa_tester":
      return "QA Tester";
    case "orchestrator":
      return "Orchestrator";
    default:
      return phase;
  }
};

const BMADSessionDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { sessions, isLoading } = useBMADSessions();
  const [selectedSession] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<any>(null);

  const { mutate: deleteSession } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bmad_sessions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bmad-sessions"] });
      toast.success("Session erfolgreich gelöscht");
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    },
    onError: (error) => {
      toast.error("Fehler beim Löschen der Session");
      console.error(error);
    },
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    const matchesPhase = phaseFilter === "all" || session.current_phase === phaseFilter;
    const matchesSearch =
      searchQuery === "" ||
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPhase && matchesSearch;
  });


  return (
    <div className="min-h-screen">
      <Navigation />
      <BMADBreadcrumb
        items={[
          { label: "Admin", href: "/admin?tab=bmad", icon: <Home className="w-5 h-5" /> },
          { label: "BMAD Sessions", icon: <BMADSessionIcon className="w-5 h-5" />, active: true }
        ]}
      />
      <main className="container mx-auto px-6 pt-[140px] pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">BMAD Sessions</h1>
              <p className="text-muted-foreground">
                Übersicht aller AI-gestützten Entwicklungssessions
              </p>
            </div>
            <BMADSessionCreator />
          </div>

          <BMADInfo />

          <Card>
            <CardHeader>
              <CardTitle>Sessions ({filteredSessions.length})</CardTitle>
              <CardDescription>
                Verwalten und überwachen Sie alle BMAD-Entwicklungssessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Input
                  placeholder="Suche nach Titel oder Beschreibung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="planning">Planung</SelectItem>
                    <SelectItem value="development">Entwicklung</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Phasen</SelectItem>
                    <SelectItem value="business_analyst">Business Analyst</SelectItem>
                    <SelectItem value="product_manager">Product Manager</SelectItem>
                    <SelectItem value="ux_expert">UX Expert</SelectItem>
                    <SelectItem value="product_owner">Product Owner</SelectItem>
                    <SelectItem value="architect">Architect</SelectItem>
                    <SelectItem value="scrum_master">Scrum Master</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="qa_tester">QA Tester</SelectItem>
                    <SelectItem value="orchestrator">Orchestrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Sessions gefunden
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead className="w-[70px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => (
                        <TableRow
                          key={session.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell 
                            className="font-medium cursor-pointer hover:underline"
                            onClick={() => navigate(`/admin/bmad/session/${session.id}`)}
                          >
                            {session.title}
                          </TableCell>
                          <TableCell onClick={() => navigate(`/admin/bmad/session/${session.id}`)} className="cursor-pointer">
                            <Badge className={getStatusColor(session.status)}>
                              {getStatusLabel(session.status)}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={() => navigate(`/admin/bmad/session/${session.id}`)} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              {getAgentIcon(session.current_phase)}
                              <span className="text-sm">{getPhaseLabel(session.current_phase)}</span>
                            </div>
                          </TableCell>
                          <TableCell onClick={() => navigate(`/admin/bmad/session/${session.id}`)} className="cursor-pointer text-muted-foreground">
                            {format(new Date(session.created_at), "PPp", { locale: de })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/bmad/session/${session.id}`);
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Details anzeigen
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSessionToDelete(session);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Löschen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <BMADSessionDetailsDialog
        session={selectedSession}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Session "{sessionToDelete?.title}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
              Alle zugehörigen Artifacts werden ebenfalls gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToDelete && deleteSession(sessionToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default BMADSessionDashboard;
