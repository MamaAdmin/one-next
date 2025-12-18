import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Impressum = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Impressum | One Next"
        description="Impressum und rechtliche Informationen von One Next - Julia Haitz, Horgen, Schweiz"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Impressum</h1>
        
        <section className="space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Kontaktadresse</h2>
            <p>Julia Haitz</p>
            <p>Rietwiesstrasse 111</p>
            <p>8810 Horgen</p>
            <p>Schweiz</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">E-Mail</h2>
            <p>
              <a href="mailto:julia@onenext.ch" className="text-primary hover:underline">
                julia@onenext.ch
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Vertretungsberechtigte Person</h2>
            <p>Julia Haitz, Inhaberin</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Haftungsausschluss</h2>
            <p className="mb-4">
              Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, 
              Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.
            </p>
            <p className="mb-4">
              Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, 
              welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten 
              Informationen, durch Missbrauch der Verbindung oder durch technische Störungen 
              entstanden sind, werden ausgeschlossen.
            </p>
            <p>
              Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, 
              Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, 
              zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Haftung für Links</h2>
            <p>
              Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres 
              Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten 
              abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene 
              Gefahr des Nutzers oder der Nutzerin.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Urheberrechte</h2>
            <p>
              Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen 
              Dateien auf der Website gehören ausschliesslich Julia Haitz oder den speziell 
              genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die 
              schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Impressum;
