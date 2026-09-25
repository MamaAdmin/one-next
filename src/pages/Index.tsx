import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
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
        description="Vom echten Geschäftsproblem zur belegten Wirkung: Problem Framing, KI Design Sprint, Online KI-Sprint-Tool, sichere KI-Entwicklung sowie messbare Verbesserung und Skalierung."
        keywords="KI-Entwicklung, KI Design Sprint, Online Design Sprint, Problem Framing, KI-Arbeitsablauf, KI-Beratung, Datenqualität"
        canonical="https://one-next.de/"
        structuredData={organizationSchema}
      />
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Hero isEditMode={isEditMode} />
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
