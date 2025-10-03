import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ValueCards from "@/components/ValueCards";
import About from "@/components/About";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";

const Index = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { isContentManager, loading } = useContentManager();

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero isEditMode={isEditMode} />
      <ValueCards />
      <About />
      <Services />
      <Footer />
      {isContentManager && !loading && (
        <EditToggleButton
          isEditMode={isEditMode}
          onToggle={() => setIsEditMode(!isEditMode)}
        />
      )}
    </div>
  );
};

export default Index;
