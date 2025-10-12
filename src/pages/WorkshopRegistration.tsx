import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { WorkshopRegistrationForm } from "@/components/WorkshopRegistrationForm";

const WorkshopRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workshopType = searchParams.get("type") as "problem-framing" | "design-sprint" | undefined;

  const handleSuccess = () => {
    navigate("/");
  };

  return (
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
  );
};

export default WorkshopRegistration;
