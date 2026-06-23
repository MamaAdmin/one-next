import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ValueCards from "@/components/ValueCards";
import About from "@/components/About";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { SEO } from "@/components/SEO";
import { organizationSchema } from "@/config/seoConfig";

const Index = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isContentManager, loading } = useContentManager();

  return (
    <>
      <SEO
        title="one-next | KI-Entwicklung & KI Design Sprints"
        description="Entdecken Sie KI-Potenziale mit innovativen Design Sprints und individueller KI-Entwicklung. Von der Idee zum getesteten Prototyp in 2 Tagen."
        keywords="KI-Entwicklung, KI Design Sprint, Design Thinking, Innovation Workshop, Künstliche Intelligenz, KI Consulting"
        canonical="https://one-next.de/"
        structuredData={organizationSchema}
      />
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Hero isEditMode={isEditMode} />
          <ValueCards isEditMode={isEditMode} />
          <About isEditMode={isEditMode} />
          <Services />
        </main>
        <Footer isEditMode={isEditMode} />
        {isContentManager && !loading && (
          <EditToggleButton
            isEditMode={isEditMode}
            onToggle={() => setIsEditMode(!isEditMode)}
          />
        )}
      </div>
    </>
  );
};

export default Index;
