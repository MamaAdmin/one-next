import { useEffect } from "react";
import WerkstattScene from "@/features/werkstatt/Werkstatt";
import { SEO } from "@/components/SEO";

const Werkstatt = () => {
  useEffect(() => {
    document.body.classList.add("werkstatt-page");
    return () => document.body.classList.remove("werkstatt-page", "past", "in-phase");
  }, []);

  return (
    <>
      <SEO
        title="Die one-next Werkstatt | Vom Geschäftsproblem zur belegten Wirkung"
        description="Interaktive Werkstatt: Erleben Sie in fünf Schritten, wie aus einem Geschäftsproblem ein sicherer KI-Arbeitsablauf mit messbarer Wirkung wird."
        canonical="https://one-next.com/werkstatt"
      />
      <div className="werkstatt-root">
        <WerkstattScene />
      </div>
    </>
  );
};

export default Werkstatt;
