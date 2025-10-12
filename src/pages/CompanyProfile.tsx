import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CompanyLogoUpload } from "@/components/company/CompanyLogoUpload";
import { EmployeeList } from "@/components/company/EmployeeList";
import { InviteUserDialog } from "@/components/company/InviteUserDialog";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useInvitations } from "@/hooks/useInvitations";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { company, employees, isAdmin, loading, updateCompany, uploadLogo } = useCompanyProfile();
  const { createInvitation } = useInvitations(company?.id);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (company?.company_name) {
      setCompanyName(company.company_name);
    }
  }, [company]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Sie haben keine Berechtigung für diese Seite");
      navigate("/profile");
    }
  }, [loading, isAdmin, navigate]);

  const handleUpdateCompany = async () => {
    setUpdating(true);
    try {
      await updateCompany({ company_name: companyName });
    } finally {
      setUpdating(false);
    }
  };

  const handleInvite = async (email: string, fullName: string) => {
    await createInvitation(email, fullName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Kein Unternehmensprofil gefunden
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Unternehmensprofil</h1>
              <p className="text-muted-foreground">
                Verwalten Sie Ihr Unternehmen und Ihre Mitarbeiter
              </p>
            </div>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Mitarbeiter einladen
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Unternehmensinformationen</CardTitle>
              <CardDescription>
                Logo und grundlegende Informationen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CompanyLogoUpload
                currentLogo={company.logo_url}
                companyName={company.company_name || undefined}
                onUpload={uploadLogo}
              />

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Firmenname</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Firma AG"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companySize">Unternehmensgröße</Label>
                    <Input
                      id="companySize"
                      value={company.company_size || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Land</Label>
                    <Input
                      id="country"
                      value={company.country || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={company.address || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      value={company.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={company.phone || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <Button onClick={handleUpdateCompany} disabled={updating}>
                  {updating ? "Wird gespeichert..." : "Änderungen speichern"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <EmployeeList employees={employees} />
        </div>
      </main>
      <Footer />

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={handleInvite}
      />
    </div>
  );
};

export default CompanyProfile;
