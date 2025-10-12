import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, BookOpen, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Metrics {
  activeEnrollments: number;
  avgProgress: number;
  dropoutRate: number;
  engagementScore: number;
}

export default function LMSAnalytics() {
  const [metrics, setMetrics] = useState<Metrics>({
    activeEnrollments: 0,
    avgProgress: 0,
    dropoutRate: 0,
    engagementScore: 0,
  });
  const [progressData, setProgressData] = useState<any[]>([]);
  const [phaseData, setPhaseData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    // Load enrollment metrics
    const { data: enrollments } = await (supabase as any)
      .from("lms_course_enrollments")
      .select("status, progress_percentage, current_phase");

    if (enrollments) {
      const active = enrollments.filter((e: any) => e.status === "active");
      const dropped = enrollments.filter((e: any) => e.status === "dropped");
      
      const avgProgress =
        active.reduce((sum: number, e: any) => sum + e.progress_percentage, 0) /
        active.length || 0;

      const dropoutRate = (dropped.length / enrollments.length) * 100 || 0;

      // Calculate phase distribution
      const phaseCounts = [0, 0, 0, 0, 0];
      active.forEach((e: any) => {
        if (e.current_phase >= 1 && e.current_phase <= 5) {
          phaseCounts[e.current_phase - 1]++;
        }
      });

      setPhaseData([
        { phase: "Phase 1", count: phaseCounts[0] },
        { phase: "Phase 2", count: phaseCounts[1] },
        { phase: "Phase 3", count: phaseCounts[2] },
        { phase: "Phase 4", count: phaseCounts[3] },
        { phase: "Phase 5", count: phaseCounts[4] },
      ]);

      setMetrics({
        activeEnrollments: active.length,
        avgProgress: Math.round(avgProgress),
        dropoutRate: Math.round(dropoutRate),
        engagementScore: 85, // Mock for now
      });
    }

    // Load progress over time (mock data)
    setProgressData([
      { date: "Woche 1", progress: 15 },
      { date: "Woche 2", progress: 32 },
      { date: "Woche 3", progress: 48 },
      { date: "Woche 4", progress: 65 },
      { date: "Woche 5", progress: 78 },
    ]);
  };

  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "LMS", href: "/admin" },
    { label: "Analytics", active: true }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">LMS Analytics</h1>

          {/* Metric Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Aktive Enrollments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeEnrollments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ø Fortschritt</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgProgress}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Abbruchrate</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.dropoutRate}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.engagementScore}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fortschritt über Zeit</CardTitle>
                <CardDescription>Durchschnittlicher Kurs-Fortschritt</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="progress" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verteilung nach Phase</CardTitle>
                <CardDescription>Anzahl aktiver Teilnehmer pro Phase</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={phaseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="phase" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
