import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent } from "@/lib/analytics";

export function ConsentBanner() {
  const [open, setOpen] = useState(() => getConsent() === null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("open-cookie-settings", show);
    return () => window.removeEventListener("open-cookie-settings", show);
  }, []);

  if (!open) return null;
  const current = getConsent();

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setOpen(false);
  };

  return (
    <div role="dialog" aria-label="Cookie-Einstellungen" className="fixed inset-x-0 bottom-0 z-[100] p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-lg border border-border bg-background p-5 shadow-lg md:flex-row md:items-center">
        <div className="flex-1 text-sm text-foreground">
          <p className="font-semibold">Ihre Privatsphäre</p>
          <p className="mt-1 text-muted-foreground">
            Mit Ihrer Zustimmung nutzen wir Google Analytics, um zu verstehen, wie unsere Website genutzt wird. Ohne
            Zustimmung werden keine Analyse-Cookies gesetzt. Sie können Ihre Wahl jederzeit unten auf der Seite unter
            „Cookie-Einstellungen" ändern.
            {current && (
              <span className="mt-1 block">
                Aktuell: {current === "granted" ? "zugestimmt" : "abgelehnt"}.
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => choose("denied")}>Ablehnen</Button>
          <Button onClick={() => choose("granted")}>Zustimmen</Button>
        </div>
      </div>
    </div>
  );
}
