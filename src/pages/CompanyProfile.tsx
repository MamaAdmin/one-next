import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyLogoUpload } from "@/components/company/CompanyLogoUpload";
import { EmployeeList } from "@/components/company/EmployeeList";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { company, employees, isAdmin, loading, updateCompany, uploadLogo } = useCompanyProfile();
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
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
    if (company) {
      setCompanyName(company.company_name || "");
      setCompanySize(company.company_size || "");
      setAddress(company.address || "");
      setCountry(company.country || "");
      setPhone(company.phone || "");
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
      await updateCompany({ 
        company_name: companyName,
        company_size: companySize || null,
        address: address || null,
        country: country || null,
        phone: phone || null,
      });
    } finally {
      setUpdating(false);
    }
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
          <div>
            <h1 className="text-3xl font-bold mb-2">Unternehmensprofil</h1>
            <p className="text-muted-foreground">
              Verwalten Sie Ihr Unternehmen und Ihre Mitarbeiter
            </p>
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
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Größe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 Mitarbeiter</SelectItem>
                        <SelectItem value="11-50">11-50 Mitarbeiter</SelectItem>
                        <SelectItem value="51-200">51-200 Mitarbeiter</SelectItem>
                        <SelectItem value="201-500">201-500 Mitarbeiter</SelectItem>
                        <SelectItem value="501+">501+ Mitarbeiter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="country">Land</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie ein Land" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deutschland">Deutschland</SelectItem>
                        <SelectItem value="Österreich">Österreich</SelectItem>
                        <SelectItem value="Schweiz">Schweiz</SelectItem>
                        <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Straße, PLZ, Ort"
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Telefonnummer"
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
    </div>
  );
};

export default CompanyProfile;
