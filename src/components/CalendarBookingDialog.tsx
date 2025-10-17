export function CalendarBookingDialog({
  buttonText = "Termin vereinbaren",
  buttonSize = "lg",
  buttonClassName = "bg-gradient-primary hover:opacity-90 transition-opacity",
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
        <iframe
          src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2TkzdodLI7ecpqrSD2I7q1kHjVQGGaQ4_cvZ7JlUSqPyv5qifYKlZPlNZ_1yJEEHE6tjN6tIv6?gv=true"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Termin buchen"
        />
      </DialogContent>
    </Dialog>
  );
}
