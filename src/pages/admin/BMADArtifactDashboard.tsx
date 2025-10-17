import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useBMADArtifacts } from "@/hooks/useBMADArtifacts";
import { useBMADSessions } from "@/hooks/useBMADSessions";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BMADArtifactPreviewDialog } from "@/components/admin/BMADArtifactPreviewDialog";
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
  BMADArtifactIcon
} from "@/components/ui/custom-icons";
import { BMADBreadcrumb } from "@/components/admin/BMADBreadcrumb";

const getAgentIcon = (agentType: string) => {
  const iconProps = { className: "w-5 h-5" };
  switch (agentType) {
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

const getArtifactTypeColor = (type: string) => {
  switch (type) {
    case "requirements":
      return "bg-purple-500";
    case "architecture":
      return "bg-blue-500";
    case "code":
      return "bg-green-500";
    case "deployment":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

const BMADArtifactDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { artifacts, isLoading } = useBMADArtifacts();
  const { sessions } = useBMADSessions();
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [artifactTypeFilter, setArtifactTypeFilter] = useState<string>("all");
  const [agentTypeFilter, setAgentTypeFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [sessionFilter, setSessionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artifactToDelete, setArtifactToDelete] = useState<any>(null);
  const [groupBySession, setGroupBySession] = useState(true);

  const { mutate: deleteArtifact } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bmad_artifacts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bmad-artifacts"] });
      toast.success("Artifact erfolgreich gelöscht");
      setDeleteDialogOpen(false);
      setArtifactToDelete(null);
    },
    onError: (error) => {
      toast.error("Fehler beim Löschen des Artifacts");
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

  const filteredArtifacts = artifacts.filter((artifact) => {
    const matchesArtifactType =
      artifactTypeFilter === "all" || artifact.artifact_type === artifactTypeFilter;
    const matchesAgentType =
      agentTypeFilter === "all" || artifact.agent_type === agentTypeFilter;
    const matchesApproval =
      approvalFilter === "all" ||
      (approvalFilter === "approved" && artifact.is_approved === true) ||
      (approvalFilter === "pending" && artifact.is_approved !== true);
    const matchesSession =
      sessionFilter === "all" || artifact.session_id === sessionFilter;
    const matchesSearch =
      searchQuery === "" ||
      artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.session_id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesArtifactType && matchesAgentType && matchesApproval && matchesSession && matchesSearch;
  });

  // Group artifacts by session
  const groupedArtifacts = filteredArtifacts.reduce((groups, artifact) => {
    const sessionId = artifact.session_id;
    if (!groups[sessionId]) {
      groups[sessionId] = [];
    }
    groups[sessionId].push(artifact);
    return groups;
  }, {} as Record<string, typeof artifacts>);

  const getSessionTitle = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.title || sessionId.substring(0, 8);
  };

  const handleRowClick = (artifact: any) => {
    setSelectedArtifact(artifact);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <BMADBreadcrumb
        items={[
          { label: "Admin", href: "/admin?tab=bmad", icon: <Home className="w-5 h-5" /> },
          { label: "BMAD Artifacts", icon: <BMADArtifactIcon className="w-5 h-5" />, active: true }
        ]}
      />
      <main className="container mx-auto px-6 pt-48 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">BMAD Artifacts</h1>
            <p className="text-muted-foreground">
              Übersicht aller generierten AI-Artifacts
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Artifacts ({filteredArtifacts.length})</CardTitle>
              <CardDescription>
                Verwalten und prüfen Sie alle generierten Artifacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Input
                  placeholder="Suche nach Titel oder Session-ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <Select value={sessionFilter} onValueChange={setSessionFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="BMAD Session" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">Alle Sessions</SelectItem>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={artifactTypeFilter} onValueChange={setArtifactTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Artifact Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">Alle Typen</SelectItem>
                    <SelectItem value="requirements">Requirements</SelectItem>
                    <SelectItem value="architecture">Architecture</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="deployment">Deployment</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={agentTypeFilter} onValueChange={setAgentTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Agent Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">Alle Agenten</SelectItem>
                    <SelectItem value="business_analyst">Business Analyst</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="architect">Architect</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Approval Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={groupBySession ? "default" : "outline"}
                  onClick={() => setGroupBySession(!groupBySession)}
                  size="default"
                >
                  {groupBySession ? "Gruppiert" : "Liste"}
                </Button>
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : filteredArtifacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Artifacts gefunden
                </div>
              ) : groupBySession ? (
                <div className="space-y-6">
                  {Object.entries(groupedArtifacts).map(([sessionId, sessionArtifacts]) => (
                    <div key={sessionId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{getSessionTitle(sessionId)}</h3>
                          <p className="text-sm text-muted-foreground">{sessionArtifacts.length} Artifacts</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/bmad/session/${sessionId}`)}
                        >
                          Session öffnen
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Titel</TableHead>
                            <TableHead>Artifact Type</TableHead>
                            <TableHead>Agent</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Erstellt</TableHead>
                            <TableHead className="w-[70px]">Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sessionArtifacts.map((artifact) => (
                            <TableRow
                              key={artifact.id}
                              className="hover:bg-muted/50"
                            >
                              <TableCell 
                                className="font-medium cursor-pointer hover:underline"
                                onClick={() => handleRowClick(artifact)}
                              >
                                {artifact.title}
                              </TableCell>
                              <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer">
                                <Badge className={getArtifactTypeColor(artifact.artifact_type)}>
                                  {artifact.artifact_type}
                                </Badge>
                              </TableCell>
                              <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  {getAgentIcon(artifact.agent_type)}
                                  <span className="text-sm">{artifact.agent_type}</span>
                                </div>
                              </TableCell>
                              <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer">v{artifact.version}</TableCell>
                              <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer">
                                {artifact.is_approved !== null && (
                                  <Badge variant={artifact.is_approved ? "default" : "secondary"}>
                                    {artifact.is_approved ? "✓ Approved" : "⏳ Pending"}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer text-muted-foreground">
                                {format(new Date(artifact.created_at), "PPp", { locale: de })}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-background">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleRowClick(artifact);
                                    }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Details anzeigen
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setArtifactToDelete(artifact);
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
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titel</TableHead>
                        <TableHead>Artifact Type</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead className="w-[70px]">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArtifacts.map((artifact) => (
                        <TableRow
                          key={artifact.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell 
                            className="font-medium cursor-pointer hover:underline"
                            onClick={() => handleRowClick(artifact)}
                          >
                            {artifact.title}
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer">
                            <Badge className={getArtifactTypeColor(artifact.artifact_type)}>
                              {artifact.artifact_type}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              {getAgentIcon(artifact.agent_type)}
                              <span className="text-sm">{artifact.agent_type}</span>
                            </div>
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer">v{artifact.version}</TableCell>
                          <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer">
                            {artifact.is_approved !== null && (
                              <Badge variant={artifact.is_approved ? "default" : "secondary"}>
                                {artifact.is_approved ? "✓ Approved" : "⏳ Pending"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(artifact)} className="cursor-pointer text-muted-foreground">
                            {format(new Date(artifact.created_at), "PPp", { locale: de })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(artifact);
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Details anzeigen
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setArtifactToDelete(artifact);
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

      <BMADArtifactPreviewDialog
        artifact={selectedArtifact}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artifact löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Artifact "{artifactToDelete?.title}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => artifactToDelete && deleteArtifact(artifactToDelete.id)}
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

export default BMADArtifactDashboard;
