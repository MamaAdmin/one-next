import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { WorkshopRegistrationForm } from "@/components/WorkshopRegistrationForm";
import { SEO } from "@/components/SEO";
import { createBreadcrumbSchema } from "@/config/seoConfig";

const WorkshopRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workshopType = searchParams.get("type") as "problem-framing" | "design-sprint" | undefined;

  const handleSuccess = () => {
    navigate("/");
  };

  return (
    <>
      <SEO
        title="Workshop Anfrage | one-next"
        description="Starten Sie Ihre Workshop-Anfrage für AI Design Sprints und Problem-Framing-Workshops."
        canonical="https://one-next.de/workshop-registration"
        noindex={true}
        structuredData={createBreadcrumbSchema([
          { name: "Home", url: "https://one-next.de/" },
          { name: "Workshop Anfrage", url: "https://one-next.de/workshop-registration" }
        ])}
      />
      <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24 pb-16 px-4">
        <WorkshopRegistrationForm 
          defaultWorkshopType={workshopType}
          onSuccess={handleSuccess}
        />
      </main>
      <Footer />
      </div>
    </>
  );
};

export default WorkshopRegistration;
