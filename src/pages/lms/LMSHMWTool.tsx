import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HMWGenerator } from "@/components/lms/HMWGenerator";
import HMWClustering from "@/components/lms/HMWClustering";

const LMSHMWTool = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 max-w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">How Might We - Tool</h1>
            <p className="text-lg text-muted-foreground">
              Erstelle und organisiere "Wie könnten wir..."-Fragen
            </p>
          </div>

          <Tabs defaultValue="generate" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="generate">Fragen erfassen</TabsTrigger>
              <TabsTrigger value="cluster">Fragen clustern</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate">
              <HMWGenerator showSavedQuestions={false} />
            </TabsContent>
            
            <TabsContent value="cluster">
              <HMWClustering />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LMSHMWTool;
