import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * OAuth callback landing page. Opened as a popup by useConnectMiro().
 * Reads ?code&state, calls the miro-oauth-complete edge function with the
 * user's session, then postMessage()s the result to the opener and closes.
 */
export default function MiroCallback() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("Miro-Verbindung wird abgeschlossen …");

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const errParam = url.searchParams.get("error");
      if (errParam) {
        setStatus("error");
        setMessage(`Miro hat die Verbindung abgelehnt: ${errParam}`);
        window.opener?.postMessage({ type: "miro-oauth", ok: false, error: errParam }, window.location.origin);
        return;
      }
      if (!code || !state) {
        setStatus("error");
        setMessage("Ungültige Antwort von Miro (code oder state fehlt).");
        window.opener?.postMessage({ type: "miro-oauth", ok: false, error: "missing_params" }, window.location.origin);
        return;
      }
      const redirectUri = `${window.location.origin}/miro/callback`;
      const { data, error } = await supabase.functions.invoke("miro-oauth-complete", {
        body: { code, state, redirect_uri: redirectUri },
      });
      if (error || (data && (data as { error?: string }).error)) {
        const msg = (data as { error?: string; details?: string } | null)?.details
          || (data as { error?: string } | null)?.error
          || error?.message
          || "Unbekannter Fehler";
        setStatus("error");
        setMessage(`Verbindung fehlgeschlagen: ${msg}`);
        window.opener?.postMessage({ type: "miro-oauth", ok: false, error: msg }, window.location.origin);
        return;
      }
      setStatus("ok");
      setMessage("Miro erfolgreich verbunden. Dieses Fenster kann geschlossen werden.");
      window.opener?.postMessage({ type: "miro-oauth", ok: true }, window.location.origin);
      setTimeout(() => window.close(), 800);
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
      <div className="max-w-md w-full rounded-lg border bg-background p-6 text-center space-y-3">
        {status === "loading" && <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />}
        {status === "ok" && <CheckCircle2 className="w-8 h-8 mx-auto text-primary" />}
        {status === "error" && <AlertCircle className="w-8 h-8 mx-auto text-destructive" />}
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
