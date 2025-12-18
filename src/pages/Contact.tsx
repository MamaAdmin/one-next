import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <>
      <SEO 
        title="Kontakt | One Next"
        description="Kontaktieren Sie uns für AI-Beratung und Innovation. Wir helfen Ihnen bei Ihren KI-Projekten."
        canonical="/kontakt"
      />
      <Navigation />
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Haben Sie Fragen zu unseren KI-Lösungen? Wir freuen uns auf Ihre Nachricht.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Kontaktformular</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input placeholder="Ihr Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">E-Mail</label>
                    <Input type="email" placeholder="ihre@email.de" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nachricht</label>
                    <Textarea placeholder="Ihre Nachricht..." rows={6} />
                  </div>
                  <Button type="submit" className="w-full">
                    Nachricht senden
                  </Button>
                </form>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">Kontaktinformationen</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">E-Mail</h3>
                      <p className="text-muted-foreground">info@onenext.ch</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Adresse</h3>
                      <p className="text-muted-foreground">
                        One Next<br />
                        Schweiz
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
