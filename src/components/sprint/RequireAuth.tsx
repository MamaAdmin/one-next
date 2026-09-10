import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isUserApproved } from "@/lib/approval";
import { Button } from "@/components/ui/button";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Gate: only renders children if a Supabase session exists.
 * Otherwise redirects to /auth?redirect=<current-path>.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "in" | "out" | "pending">("loading");

  useEffect(() => {
    let mounted = true;

    const evaluate = async (userId: string | undefined) => {
      if (!userId) {
        if (mounted) setStatus("out");
        return;
      }
      const approved = await isUserApproved(userId);
      if (mounted) setStatus(approved ? "in" : "pending");
    };

    supabase.auth.getSession().then(({ data }) => {
      void evaluate(data.session?.user?.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => void evaluate(session?.user?.id), 0);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Wird geladen …
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Konto wartet auf Freigabe</h1>
          <p className="text-muted-foreground">
            Ihr Konto wurde noch nicht freigegeben. Sobald ein Administrator es
            bestätigt hat, erhalten Sie Zugriff.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
            }}
          >
            Abmelden
          </Button>
        </div>
      </div>
    );
  }

  if (status === "out") {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
