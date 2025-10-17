import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface CalendarBookingDialogProps {
  buttonText?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
}

export function CalendarBookingDialog({ 
  buttonText = "Termin vereinbaren",
  buttonSize = "lg",
  buttonClassName = "bg-gradient-primary hover:opacity-90 transition-opacity"
}: CalendarBookingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={buttonSize} className={buttonClassName}>
          <Calendar className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
        <DialogHeader className="px-4 py-2 border-b">
          <DialogTitle className="text-base">Termin vereinbaren</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2TkzdodLI7ecpqrSD2I7q1kHjVQGGaQ4_cvZ7JlUSqPyv5qifYKlZPlNZ_1yJEEHE6tjN6tIv6?gv=true"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Termin buchen"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
