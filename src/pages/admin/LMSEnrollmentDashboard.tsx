import { useState } from "react";
import { useLMSEnrollment } from "@/hooks/useLMSEnrollment";
import { useCoursePurchase } from "@/hooks/useCoursePurchase";
import { EnrollmentInvitationManager } from "@/components/lms/EnrollmentInvitationManager";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { useParticipants } from "@/hooks/useParticipants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabels, categoryColors, CourseCategory } from "@/lib/categoryMappings";
import { useToast } from "@/hooks/use-toast";

export default function LMSEnrollmentDashboard() {
  const { enrollments, loading } = useLMSEnrollment();
  const { purchases } = useCoursePurchase();
  const { participants } = useParticipants();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    purchase_id: "",
    participant_id: "",
  });

  const handleSubmit = async () => {
    try {
      const { error } = await (supabase as any)
        .from("lms_course_enrollments")
        .insert([
          {
            ...formData,
            status: "active",
            current_category: "understand",
            progress_percentage: 0,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Enrollment wurde erstellt",
      });
      
      setIsCreateOpen(false);
      setFormData({ purchase_id: "", participant_id: "" });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Enrollment konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      completed: "secondary",
      dropped: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "LMS", href: "/admin?tab=lms" },
    { label: "Teilnahmen", active: true }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      <main className="container mx-auto px-4 py-8 mt-32">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment-Einladungen</CardTitle>
            </CardHeader>
            <CardContent>
              <EnrollmentInvitationManager customerId={purchases[0]?.customer_id || ""} />
            </CardContent>
          </Card>
          
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enrollment-Verwaltung</CardTitle>
              <CardDescription>Verwalten Sie Kurs-Enrollments</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Neues Enrollment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neues Enrollment</DialogTitle>
                  <DialogDescription>
                    Weisen Sie einen Teilnehmer einem Kurs zu
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="purchase">Kauf</Label>
                    <Select
                      value={formData.purchase_id}
                      onValueChange={(value) => setFormData({ ...formData, purchase_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kauf wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {purchases.map((purchase) => (
                          <SelectItem key={purchase.id} value={purchase.id}>
                            {purchase.customers?.company_name} - {purchase.lms_courses?.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="participant">Teilnehmer</Label>
                    <Select
                      value={formData.participant_id}
                      onValueChange={(value) => setFormData({ ...formData, participant_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Teilnehmer wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map((participant) => (
                          <SelectItem key={participant.id} value={participant.id}>
                            {participant.full_name} ({participant.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>Erstellen</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teilnehmer</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Fortschritt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Eingeschrieben</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>Enrollment {enrollment.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge className={categoryColors[enrollment.current_category as CourseCategory]}>
                      {categoryLabels[enrollment.current_category as CourseCategory]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={enrollment.progress_percentage} className="w-24" />
                      <span className="text-sm">{enrollment.progress_percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                  <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
          </Card>
        </div>
      </main>
      <Footer isEditMode={false} />
    </div>
  );
}
