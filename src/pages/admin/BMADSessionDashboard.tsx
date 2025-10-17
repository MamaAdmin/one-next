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
import { Brain, Users, Layers, Code } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const getAgentIcon = (phase: string) => {
  switch (phase) {
    case "business_analyst":
      return <Brain className="w-4 h-4 text-purple-500" />;
    case "manager":
      return <Users className="w-4 h-4 text-blue-500" />;
    case "architect":
      return <Layers className="w-4 h-4 text-orange-500" />;
    case "developer":
      return <Code className="w-4 h-4 text-green-500" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "development":
      return "bg-blue-500";
    case "planning":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const BMADSessionDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { sessions, isLoading } = useBMADSessions();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleRowClick = (session: any) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">BMAD Sessions</h1>
            <p className="text-muted-foreground">
              Übersicht aller AI-gestützten Entwicklungssessions
            </p>
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
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Phasen</SelectItem>
                    <SelectItem value="business_analyst">Business Analyst</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="architect">Architect</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => (
                        <TableRow
                          key={session.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(session)}
                        >
                          <TableCell className="font-medium">{session.title}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getAgentIcon(session.current_phase)}
                              <span className="text-sm">{session.current_phase}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(session.created_at), "PPp", { locale: de })}
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

      <Footer />
    </div>
  );
};

export default BMADSessionDashboard;
