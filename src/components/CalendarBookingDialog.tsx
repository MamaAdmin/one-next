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
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Termin vereinbaren</DialogTitle>
        </DialogHeader>
        <iframe
          src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2TkzdodLI7ecpqrSD2I7q1kHjVQGGaQ4_cvZ7JlUSqPyv5qifYKlZPlNZ_1yJEEHE6tjN6tIv6?gv=true"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Termin buchen"
        />
      </DialogContent>
    </Dialog>
  );
}
