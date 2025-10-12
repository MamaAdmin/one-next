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
    email: "",
    name: "",
    phone: "",
    address: ""
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(formData);
      setIsDialogOpen(false);
      setFormData({
        company_name: "",
        email: "",
        name: "",
        phone: "",
        address: ""
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
    { label: "LMS", href: "/admin?tab=lms" },
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
                  <Label htmlFor="company_name">Firmenname</Label>
                  <Input id="company_name" value={formData.company_name} onChange={e => setFormData({
                  ...formData,
                  company_name: e.target.value
                })} placeholder="z.B. Acme GmbH" />
                </div>

                <div>
                  <Label htmlFor="name">Kontaktperson *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })} placeholder="Max Mustermann" required />
                </div>

                <div>
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({
                  ...formData,
                  email: e.target.value
                })} placeholder="kontakt@firma.de" required />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({
                  ...formData,
                  phone: e.target.value
                })} placeholder="+41 44 123 45 67" />
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea id="address" value={formData.address} onChange={e => setFormData({
                  ...formData,
                  address: e.target.value
                })} placeholder="Straße, PLZ Ort, Land" rows={3} />
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
                      <User className="inline mr-2 h-4 w-4" />
                      Kontaktperson
                    </TableHead>
                    <TableHead>
                      <Mail className="inline mr-2 h-4 w-4" />
                      Email
                    </TableHead>
                    <TableHead>Erstellt am</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map(customer => <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.company_name || "-"}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        {new Date(customer.created_at).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => toast.info("Details-Ansicht kommt in nächster Phase")}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(customer.id, customer.company_name || customer.name)}>
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