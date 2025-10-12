import { useState } from "react";
import { useCoursePurchase } from "@/hooks/useCoursePurchase";
import { useCustomer } from "@/hooks/useCustomer";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { useLMSCourse } from "@/hooks/useLMSCourse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LMSPurchaseDashboard() {
  const { purchases, loading, createPurchase, updatePurchase } = useCoursePurchase();
  const { customers } = useCustomer();
  const { courses } = useLMSCourse();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    course_id: "",
    licenses: 1,
    price_chf: 0,
  });

  const handleCourseChange = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    setFormData({
      ...formData,
      course_id: courseId,
      price_chf: course ? course.price_chf * formData.licenses : 0,
    });
  };

  const handleLicensesChange = (licenses: number) => {
    const course = courses.find((c) => c.id === formData.course_id);
    setFormData({
      ...formData,
      licenses,
      price_chf: course ? course.price_chf * licenses : 0,
    });
  };

  const handleSubmit = async () => {
    await createPurchase(formData);
    setIsCreateOpen(false);
    setFormData({ customer_id: "", course_id: "", licenses: 1, price_chf: 0 });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      paid: "default",
      cancelled: "destructive",
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
    { label: "LMS" },
    { label: "Käufe", active: true }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      <main className="container mx-auto px-4 py-8 mt-32">
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kurs-Käufe</CardTitle>
              <CardDescription>Verwalten Sie alle Kurs-Käufe</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setFormData({ customer_id: "", course_id: "", licenses: 1, price_chf: 0 });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Neuer Kauf
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neuer Kurs-Kauf</DialogTitle>
                  <DialogDescription>
                    Erstellen Sie einen neuen Kurs-Kauf
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">Kunde</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kunde wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="course">Kurs</Label>
                    <Select
                      value={formData.course_id}
                      onValueChange={handleCourseChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kurs wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title} (CHF {course.price_chf})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="licenses">Lizenzen</Label>
                    <Input
                      id="licenses"
                      type="number"
                      min="1"
                      value={formData.licenses}
                      onChange={(e) => handleLicensesChange(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Gesamtpreis (CHF)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price_chf}
                      readOnly
                      className="bg-muted"
                    />
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
                <TableHead>Kunde</TableHead>
                <TableHead>Kurs</TableHead>
                <TableHead>Lizenzen</TableHead>
                <TableHead>Preis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kaufdatum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.customers?.company_name}</TableCell>
                  <TableCell>{purchase.lms_courses?.title}</TableCell>
                  <TableCell>{purchase.licenses}</TableCell>
                  <TableCell>CHF {purchase.price_chf}</TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell>{new Date(purchase.purchased_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </main>
      <Footer isEditMode={false} />
    </div>
  );
}
