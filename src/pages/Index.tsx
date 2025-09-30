import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import AIDesignSprint from "@/components/AIDesignSprint";
import Applications from "@/components/Applications";
import Process from "@/components/Process";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Services />
      <AIDesignSprint />
      <Applications />
      <Process />
      <Footer />
    </div>
  );
};

export default Index;
