import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface CalendarBookingDialogProps {
  buttonText?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function CalendarBookingDialog({
  buttonText = "Termin vereinbaren",
  buttonSize = "lg",
  buttonClassName = "bg-gradient-primary hover:opacity-90 transition-opacity",
  buttonVariant = "default",
}: CalendarBookingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={buttonSize} variant={buttonVariant} className={buttonClassName}>
          <Calendar className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header mit Branding */}
        <div className="bg-gradient-primary px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-background/20 backdrop-blur-sm flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-primary-foreground">
                Termin vereinbaren
              </h2>
            </div>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 min-h-0 bg-background">
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2TkzdodLI7ecpqrSD2I7q1kHjVQGGaQ4_cvZ7JlUSqPyv5qifYKlZPlNZ_1yJEEHE6tjN6tIv6?gv=true"
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Termin buchen"
          />
        </div>

        {/* Footer mit zusätzlichen Infos */}
        <div className="border-t bg-card px-6 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>📅 30 Min. Beratung</span>
              <span>🎯 Kostenlos & unverbindlich</span>
            </div>
            <span className="text-xs">Powered by one-next</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
