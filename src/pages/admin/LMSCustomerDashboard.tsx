import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { useCustomer } from "@/hooks/useCustomer";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Building2, Mail, User, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
const LMSCustomerDashboard = () => {
  const {
    isAdmin,
    loading: adminLoading
  } = useAdmin();
  const {
    customers,
    loading,
    createCustomer,
    deleteCustomer
  } = useCustomer();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_email: "",
    contact_name: "",
    notes: ""
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(formData);
      setIsDialogOpen(false);
      setFormData({
        company_name: "",
        contact_email: "",
        contact_name: "",
        notes: ""
      });
    } catch (error) {
      // Error already handled in hook
    }
  };
  const handleDelete = async (id: string, companyName: string) => {
    if (confirm(`Möchten Sie den Kunden "${companyName}" wirklich löschen? Dies löscht auch alle zugehörigen Teilnehmer und Buchungen.`)) {
      await deleteCustomer(id);
    }
  };
  if (adminLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <p>Laden...</p>
      </div>;
  }
  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
            <CardDescription>Sie haben keine Berechtigung für diese Seite.</CardDescription>
          </CardHeader>
        </Card>
      </div>;
  }
  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "LMS" },
    { label: "Kunden", active: true }
  ];

  return <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-32">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">LMS Kunden-Verwaltung</h1>
            <p className="text-muted-foreground">Verwalten Sie Ihre Kunden und deren Teilnehmer</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="my-[100px]">
                <Plus className="mr-2 h-4 w-4" />
                Neuer Kunde
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neuen Kunden anlegen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen neuen Kunden, dem Sie später Teilnehmer zuweisen können.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Firmenname *</Label>
                  <Input id="company_name" value={formData.company_name} onChange={e => setFormData({
                  ...formData,
                  company_name: e.target.value
                })} placeholder="z.B. Acme GmbH" required />
                </div>

                <div>
                  <Label htmlFor="contact_email">Kontakt-Email *</Label>
                  <Input id="contact_email" type="email" value={formData.contact_email} onChange={e => setFormData({
                  ...formData,
                  contact_email: e.target.value
                })} placeholder="kontakt@firma.de" required />
                </div>

                <div>
                  <Label htmlFor="contact_name">Ansprechpartner</Label>
                  <Input id="contact_name" value={formData.contact_name} onChange={e => setFormData({
                  ...formData,
                  contact_name: e.target.value
                })} placeholder="Max Mustermann" />
                </div>

                <div>
                  <Label htmlFor="notes">Notizen</Label>
                  <Textarea id="notes" value={formData.notes} onChange={e => setFormData({
                  ...formData,
                  notes: e.target.value
                })} placeholder="Weitere Informationen zum Kunden..." rows={3} />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit">
                    Kunde anlegen
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Lade Kunden...</p>
            </CardContent>
          </Card> : customers.length === 0 ? <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Noch keine Kunden angelegt. Erstellen Sie den ersten Kunden über den Button oben.
              </p>
            </CardContent>
          </Card> : <Card>
            <CardHeader>
              <CardTitle>Alle Kunden ({customers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Building2 className="inline mr-2 h-4 w-4" />
                      Firma
                    </TableHead>
                    <TableHead>
                      <Mail className="inline mr-2 h-4 w-4" />
                      Email
                    </TableHead>
                    <TableHead>
                      <User className="inline mr-2 h-4 w-4" />
                      Ansprechpartner
                    </TableHead>
                    <TableHead>Erstellt am</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map(customer => <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.company_name}</TableCell>
                      <TableCell>{customer.contact_email}</TableCell>
                      <TableCell>{customer.contact_name || "-"}</TableCell>
                      <TableCell>
                        {new Date(customer.created_at).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => toast.info("Details-Ansicht kommt in nächster Phase")}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(customer.id, customer.company_name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>}
      </main>

      <Footer isEditMode={false} />
    </div>;
};
export default LMSCustomerDashboard;