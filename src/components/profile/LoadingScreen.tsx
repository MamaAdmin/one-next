import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Lädt Profil...</p>
      </div>
    </div>
  );
};
