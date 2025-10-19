import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SmartSailboat } from "@/components/lms/SmartSailboat";
import { LMSBreadcrumb } from "@/components/lms/LMSBreadcrumb";
import { Sailboat } from "lucide-react";

const LMSSmartSailboat = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <LMSBreadcrumb
        items={[
          { label: "LMS", href: "/lms", icon: "Home" },
          { label: "Tools", href: "/lms", icon: "Wrench" },
          { label: "Smart Sailboat", icon: "Sailboat", active: true },
        ]}
      />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 max-w-full">
          <div className="mb-8 flex items-center gap-3">
            <Sailboat className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Smart Sailboat</h1>
              <p className="text-lg text-muted-foreground">
                Visuelle Retrospektive-Methode mit 4 Perspektiven zur Team-Reflexion
              </p>
            </div>
          </div>
          <SmartSailboat />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LMSSmartSailboat;
