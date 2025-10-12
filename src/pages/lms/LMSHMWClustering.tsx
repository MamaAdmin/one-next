import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HMWClustering from "@/components/lms/HMWClustering";

const LMSHMWClustering = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 max-w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">HMW-Fragen Clustering</h1>
            <p className="text-lg text-muted-foreground">
              Organisiere deine gespeicherten Fragen in thematische Cluster
            </p>
          </div>
          <HMWClustering />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LMSHMWClustering;
