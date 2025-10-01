import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ValueCards from "@/components/ValueCards";
import About from "@/components/About";
import Services from "@/components/Services";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <ValueCards />
      <About />
      <Services />
      <Footer />
    </div>
  );
};

export default Index;
