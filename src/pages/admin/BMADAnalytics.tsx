import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useBMADSessions } from "@/hooks/useBMADSessions";
import { useBMADArtifacts } from "@/hooks/useBMADArtifacts";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Activity, FileText, CheckCircle, Clock } from "lucide-react";

const COLORS = {
  requirements: "#A855F7",
  architecture: "#3B82F6",
  code: "#10B981",
  deployment: "#F97316",
};

const BMADAnalytics = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { sessions, isLoading: sessionsLoading } = useBMADSessions();
  const { artifacts, isLoading: artifactsLoading } = useBMADArtifacts();

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

  // Calculate statistics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === "completed").length;
  const developmentSessions = sessions.filter((s) => s.status === "development").length;
  const planningSessions = sessions.filter((s) => s.status === "planning").length;

  const totalArtifacts = artifacts.length;
  const approvedArtifacts = artifacts.filter((a) => a.is_approved === true).length;
  const approvalRate =
    totalArtifacts > 0 ? Math.round((approvedArtifacts / totalArtifacts) * 100) : 0;

  // Artifact type distribution
  const artifactTypeData = [
    {
      name: "Requirements",
      value: artifacts.filter((a) => a.artifact_type === "requirements").length,
    },
    {
      name: "Architecture",
      value: artifacts.filter((a) => a.artifact_type === "architecture").length,
    },
    { name: "Code", value: artifacts.filter((a) => a.artifact_type === "code").length },
    {
      name: "Deployment",
      value: artifacts.filter((a) => a.artifact_type === "deployment").length,
    },
  ].filter((item) => item.value > 0);

  // Artifacts per agent
  const agentData = [
    {
      agent: "Business Analyst",
      artifacts: artifacts.filter((a) => a.agent_type === "business_analyst").length,
    },
    {
      agent: "Manager",
      artifacts: artifacts.filter((a) => a.agent_type === "manager").length,
    },
    {
      agent: "Architect",
      artifacts: artifacts.filter((a) => a.agent_type === "architect").length,
    },
    {
      agent: "Developer",
      artifacts: artifacts.filter((a) => a.agent_type === "developer").length,
    },
  ].filter((item) => item.artifacts > 0);

  // Sessions over time (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  const sessionsOverTime = last30Days.map((date) => ({
    date: new Date(date).toLocaleDateString("de-DE", { month: "short", day: "numeric" }),
    sessions: sessions.filter((s) => s.created_at.startsWith(date)).length,
  }));

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">BMAD Analytics</h1>
            <p className="text-muted-foreground">
              Statistiken und Analysen des BMAD-Systems
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  {completedSessions} abgeschlossen, {developmentSessions} in Entwicklung
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Artifacts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalArtifacts}</div>
                <p className="text-xs text-muted-foreground">
                  Generiert von 4 AI-Agenten
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvalRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {approvedArtifacts} von {totalArtifacts} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {developmentSessions + planningSessions}
                </div>
                <p className="text-xs text-muted-foreground">
                  {planningSessions} in Planung
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Sessions über Zeit (30 Tage)</CardTitle>
                <CardDescription>Anzahl erstellter Sessions pro Tag</CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sessionsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sessions" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Artifact Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Artifact-Typen Verteilung</CardTitle>
                <CardDescription>Anzahl pro Artifact-Typ</CardDescription>
              </CardHeader>
              <CardContent>
                {artifactsLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={artifactTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {artifactTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Artifacts per Agent */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Artifacts pro Agent</CardTitle>
                <CardDescription>Performance der einzelnen AI-Agenten</CardDescription>
              </CardHeader>
              <CardContent>
                {artifactsLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={agentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="agent" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="artifacts" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BMADAnalytics;
