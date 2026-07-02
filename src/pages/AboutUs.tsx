import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BrainIcon, TargetIcon, LightbulbIcon, RocketIcon } from "@/components/ui/custom-icons";
import { Linkedin, Users, Home, Flame } from "lucide-react";
import juliaProfile from "@/assets/julia-haitz-profile.jpg";
import trainingLocationRoom from "@/assets/training-location-room.jpg";
import trainingLocationCozy from "@/assets/training-location-cozy.jpg";
import { usePageContent } from "@/hooks/usePageContent";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { SEO } from "@/components/SEO";
import { personSchema, createBreadcrumbSchema } from "@/config/seoConfig";
const AboutUs = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    isContentManager
  } = useContentManager();
  const {
    content,
    loading,
    updateContent
  } = usePageContent('about-us');
  const structuredData = [personSchema, createBreadcrumbSchema([{
    name: "Home",
    url: "https://one-next.de/"
  }, {
    name: "Über uns",
    url: "https://one-next.de/about-us"
  }])];
  return <>
      <SEO title="Über one-next | Julia Haitz - KI KI & Innovation Innovation Expertin Innovation Expertin" description="Lernen Sie Julia Haitz kennen - Gründerin von one-next. Expertin für KI Design Sprints, Innovation und KI-Entwicklung mit Leidenschaft für Business Impact." keywords="Julia Haitz, one-next, KI-Expertin, Design Sprint, Innovation Consulting, KI-Beratung" canonical="https://one-next.de/about-us" ogType="profile" structuredData={structuredData} />
      <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 animate-fade-in">
            <InlineTextField value={content.hero_title || 'Über one-next'} onSave={value => updateContent('hero_title', value)} isEditMode={isEditMode} className="text-5xl lg:text-6xl font-bold" placeholder="Hero title" as="h1" />
            <InlineTextArea value={content.hero_description || 'Wir sind ein innovatives KI-Entwicklungsunternehmen mit Sitz in Deutschland, das Unternehmen dabei hilft, das volle Potenzial künstlicher Intelligenz zu nutzen.'} onSave={value => updateContent('hero_description', value)} isEditMode={isEditMode} className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" placeholder="Hero description" minRows={3} />
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-6 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Gründerin</h2>
            <p className="text-lg text-muted-foreground">
              Die Vision hinter one-next
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto shadow-elegant hover:shadow-glow transition-all duration-300">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
                <Avatar className="h-48 w-48">
                  <AvatarImage src={juliaProfile} alt="Julia Haitz, Gründerin und CEO von one-next, Expertin für KI Design Sprints und Innovation" />
                  <AvatarFallback>JH</AvatarFallback>
                </Avatar>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Julia Haitz</h3>
                    <p className="text-lg text-primary font-semibold mb-4">
                      Gründerin & CEO
                    </p>
                    <a href="https://www.linkedin.com/in/juliha/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                      <Linkedin className="w-5 h-5" />
                      LinkedIn Profil
                    </a>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">Julia Haitz ist Gründerin mit langjähriger Erfahrung in künstlicher Intelligenz und digitaler Transformation. Seit 2019 baut sie ihre KI‑Expertise kontinuierlich aus, unter anderem durch Weiterbildungen am MIT, wo sie Mitglied des Global GenAI Program ist. Mit one‑next unterstützt sie Unternehmen dabei, durch maßgeschneiderte KI‑Lösungen nachhaltige Wettbewerbsvorteile zu erzielen</p>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Ihre Mission ist es, die Lücke zwischen technologischer Innovation und 
                    praktischer Geschäftsanwendung zu schließen und Unternehmen auf ihrem 
                    Weg in die KI-gestützte Zukunft zu begleiten.
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Dank ihrer umfassenden Erfahrung kennt sie alle relevanten Perspektiven 
                    innerhalb eines Unternehmens – die agile Sicht, die strategische Sicht 
                    sowie die technische Umsetzung. Dieses Zusammenspiel ermöglicht ihr stets, 
                    das Gesamtbild im Blick zu behalten und nachhaltige Lösungen zu entwickeln.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Unsere Werte</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Die Prinzipien, die unsere Arbeit und unser Engagement leiten
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group hover-scale shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BrainIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Innovation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Wir bleiben an der Spitze der KI-Technologie und entwickeln kontinuierlich 
                  neue Lösungen, die echten Mehrwert schaffen.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-scale shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <TargetIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Kundenfokus</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ihre Ziele sind unsere Priorität. Wir entwickeln maßgeschneiderte Lösungen, 
                  die genau auf Ihre Geschäftsanforderungen zugeschnitten sind.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-scale shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <LightbulbIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Expertise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Unser Team kombiniert tiefes technisches Know-how mit strategischem 
                  Verständnis für nachhaltige Geschäftserfolge.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-scale shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <RocketIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Nachhaltigkeit</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Wir entwickeln zukunftssichere Lösungen, die langfristig Wert schaffen 
                  und mit Ihrem Unternehmen wachsen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 bg-background/50">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-center">Unsere Geschichte</h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                one-next wurde aus der Überzeugung heraus gegründet, dass künstliche Intelligenz 
                das Potenzial hat, die Art und Weise, wie Unternehmen arbeiten, grundlegend zu 
                verändern. Doch während die Technologie rasant voranschreitet, kämpfen viele 
                Unternehmen damit, konkrete Anwendungsfälle zu identifizieren und erfolgreich 
                umzusetzen.
              </p>
              
              <p>
                Genau hier setzt one-next an. Wir verstehen, dass erfolgreiche KI-Implementierung 
                mehr erfordert als nur technologisches Know-how – es braucht ein tiefes Verständnis 
                für Geschäftsprozesse, strategische Vision und die Fähigkeit, komplexe technische 
                Konzepte in praktische Lösungen zu übersetzen.
              </p>
              
              <p>
                Heute arbeiten wir mit Unternehmen verschiedener Größen und Branchen zusammen, 
                von innovativen Startups bis hin zu etablierten Konzernen. Unser Ziel bleibt dabei 
                immer gleich: KI-Lösungen zu schaffen, die echten Mehrwert liefern und messbare 
                Geschäftsergebnisse erzielen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Unser Ansatz</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              So arbeiten wir mit unseren Kunden zusammen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-elegant">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Verstehen</h3>
                <p className="text-muted-foreground">
                  Wir beginnen mit einer gründlichen Analyse Ihrer Geschäftsprozesse und 
                  identifizieren konkrete Potenziale für KI-Anwendungen.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">Entwickeln</h3>
                <p className="text-muted-foreground">
                  Mit agilen Methoden entwickeln wir maßgeschneiderte Lösungen, die perfekt 
                  auf Ihre Anforderungen zugeschnitten sind.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">Begleiten</h3>
                <p className="text-muted-foreground">
                  Wir unterstützen Sie bei der Implementierung und sorgen für nachhaltigen 
                  Erfolg durch kontinuierliche Optimierung.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Training Location Section */}
      <section className="py-20 px-6 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Unsere Trainingslocation</h2>
            <p className="text-lg text-muted-foreground">Cosy Training mitten im Grünen</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <img
              src={trainingLocationRoom}
              alt="Heller Meetingraum der one-next Trainingslocation mit Holzdecke, langem Tisch und großen Fenstern ins Grüne"
              className="rounded-2xl shadow-elegant w-full h-full object-cover"
            />
            <img
              src={trainingLocationCozy}
              alt="Gemütliche Lounge mit Kamin, Apéro und Fireside Talk in der one-next Trainingslocation"
              className="rounded-2xl shadow-elegant w-full h-full object-cover"
            />
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Wir arbeiten bewusst in kleinen Gruppen mit <strong className="text-foreground">maximal 6 Personen</strong> —
              für fokussierte Zusammenarbeit und echte Ergebnisse. Workshops finden in unseren
              eigenen Räumen statt, bei Ihnen vor Ort oder auf Wunsch in einer passenden Location
              in Kundennähe, die wir gerne für Sie organisieren.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Bei uns starten Sie am Nachmittag im lichtdurchfluteten Meetingraum und lassen den
              Tag mit einem <strong className="text-foreground">Apéro und Fireside Talk</strong> ausklingen —
              Erkenntnisse reflektieren am Kaminfeuer, mitten im Grünen mit Blick in die Berge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-elegant">
              <CardContent className="p-6 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Max. 6 Personen</h3>
                <p className="text-sm text-muted-foreground">
                  Fokussierte Intensität und echte Beteiligung aller Teilnehmenden.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="p-6 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Flexible Räume</h3>
                <p className="text-sm text-muted-foreground">
                  Bei uns, bei Ihnen oder in einer organisierten Location in Ihrer Nähe.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="p-6 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Flame className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Apéro & Fireside Talk</h3>
                <p className="text-sm text-muted-foreground">
                  Erkenntnisse gemeinsam reflektieren — am Kamin, mit Blick in die Berge.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white">
            Lassen Sie uns gemeinsam Ihre KI-Zukunft gestalten
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Kontaktieren Sie uns für ein unverbindliches Erstgespräch und erfahren Sie, 
            wie wir Ihr Unternehmen mit KI voranbringen können.
          </p>
          <Link to="/#about">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Jetzt Kontakt aufnehmen
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      {isContentManager && !loading && <EditToggleButton isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />}
    </div>
    </>;
};
export default AboutUs;