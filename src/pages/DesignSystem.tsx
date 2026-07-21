import { ColorTokens } from "@/components/design/ColorTokens";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const DesignSystem = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Design System" description="Interne Farbreferenz für one-next." />
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Corporate Design — Farbsystem</h1>
            <p className="text-muted-foreground">
              Interne Referenz aller semantischen Farb-Tokens. Die Werte sind in{" "}
              <code className="text-sm bg-muted px-1 rounded">src/index.css</code> definiert und in{" "}
              <code className="text-sm bg-muted px-1 rounded">tailwind.config.ts</code> als Tailwind-Klassen verfügbar.
            </p>
          </div>
          <ColorTokens />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DesignSystem;
