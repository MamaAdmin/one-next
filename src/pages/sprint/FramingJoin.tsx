import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function FramingJoin() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setError("Kein Token angegeben.");
        setLoading(false);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/auth?redirect=" + encodeURIComponent(`/sprint/framing/join/${token}`));
        return;
      }
      const { data, error } = await supabase.rpc("redeem_framing_invitation" as never, {
        p_token: token,
      } as never);
      if (cancelled) return;
      if (error) {
        setError(error.message || "Einladung ungültig oder abgelaufen.");
        setLoading(false);
        return;
      }
      const sessionId = data as unknown as string;
      navigate(`/sprint/framing/${sessionId}`, { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-6 py-20 max-w-lg text-center">
        {loading && !error ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p>Einladung wird eingelöst…</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Einladung ungültig</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate("/sprint")}>Zur Übersicht</Button>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
