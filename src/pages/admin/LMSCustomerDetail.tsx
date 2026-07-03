import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { HomeIcon } from "@/components/ui/custom-icons";
import { useAdmin } from "@/hooks/useAdmin";
import { useCustomerDetail } from "@/hooks/useCustomerDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CompanyLogoUpload } from "@/components/company/CompanyLogoUpload";
import { EmployeeList } from "@/components/company/EmployeeList";

import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const LMSCustomerDetail = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { 
    customer, 
    employees, 
    loading, 
    updateCustomer, 
    uploadLogo,
    sendInvitation 
  } = useCustomerDetail(customerId);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        company_name: customer.company_name || "",
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCustomer(formData);
      toast.success("Änderungen gespeichert");
    } catch {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Laden...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
            <CardDescription>Sie haben keine Berechtigung für diese Seite.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Kunde nicht gefunden</CardTitle>
            <CardDescription>Der angeforderte Kunde wurde nicht gefunden.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/admin/customers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Übersicht
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Admin", href: "/admin", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "LMS", href: "/admin?tab=lms" },
    { label: "Kunden", href: "/admin/customers" },
    { label: customer.company_name || customer.name, active: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb items={breadcrumbItems} />

      <main className="flex-1 container mx-auto px-4 py-8 mt-32">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/customers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">{customer.company_name || customer.name}</h1>
            <p className="text-muted-foreground">Kundendetails bearbeiten</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Company Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Unternehmensinformationen</CardTitle>
              <CardDescription>
                Verwalten Sie die Details und das Logo des Unternehmens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CompanyLogoUpload
                currentLogo={customer.logo_url}
                companyName={customer.company_name || customer.name}
                onUpload={uploadLogo}
              />

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="company_name">Firmenname</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    placeholder="z.B. Acme GmbH"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Kontaktperson *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Max Mustermann"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="kontakt@firma.de"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+41 44 123 45 67"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Straße, PLZ Ort, Land"
                    rows={3}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Speichern..." : "Änderungen speichern"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Employees Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Mitarbeiter</CardTitle>
                  <CardDescription>
                    Verwalten Sie die Mitarbeiter dieses Unternehmens
                  </CardDescription>
                </div>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                  Mitarbeiter einladen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <EmployeeList employees={employees} />
            </CardContent>
          </Card>
        </div>

        <InviteUserDialog
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
          onInvite={sendInvitation}
        />
      </main>

      <Footer isEditMode={false} />
    </div>
  );
};

export default LMSCustomerDetail;
